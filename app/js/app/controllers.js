'use strict';
define(["require", "angular", "github", "app/modes/logo", "app/modes/robot", "app/modes/art"], function(require) {

	var Logo = require("app/modes/logo");
	var Robot = require("app/modes/robot");
	var Art = require("app/modes/art");
	/* Controllers */

	angular.module('tealight.controllers', ["github"])


	.controller('TealightController', ["$scope", "$rootScope", "$location", function($scope, $rootScope, $location) {

		$scope.logout = function() {
			console.log("LOGGING OUT");
			document.cookie = 'tealight-token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			$rootScope.userProfile = null;
			$location.url("/home");
		}

	}])


	.controller('HomeController', ["$scope", function($scope) {

	}])


	.controller('AboutController', [function() {

	}])


	.controller('CodeController', ["$rootScope", function($rootScope) {
		console.log("CodeController for user:", $rootScope.userProfile);
	}])


	.controller('ModeController', ["$scope", "$routeParams", "$rootScope", "$location", "Missions", "github", function($scope, $routeParams, $rootScope, $location, Missions, github) {
		console.log("ModeController for user:", $rootScope.userProfile);

		Missions.load.then(function(missions) {
			console.log("Missions loaded.");
		})

		///////////////////////////////////////////////
		// INITIALISATION
		///////////////////////////////////////////////

		$scope.mode = $routeParams.mode;

		$scope.loadEditor = {};
		$scope.loadEditor.promise = new Promise(function(resolve, reject) { 
			$scope.loadEditor.resolve = resolve;
		});
		$scope.tealightSkulptModuleCache = {};

		$scope.console = [];

		// Now load the file in the URL, or redirect to a URL with a file in it.

		if ($routeParams.fileName) {
			// We have chosen a file in the url.
			// Make sure that the editor is loaded, then load the selected file.

			var filePath = $scope.mode + "/" + $routeParams.fileName;
			$scope.loadEditor.promise.then(function() {

				console.log("Loading ", filePath);

				$scope.editor.setValue("Loading " + filePath + "...");

				return github.getFile(github.user.login, "tealight-files", filePath).then(function(f) {
					console.log("Loaded", f.name);
					$scope.editor.setValue(f.decodedContent);
					$scope.file = f;
					$scope.$apply();
				});

			}).then(function() { 
				return listFiles(); 
			}).then(function() {

				for(var i in $scope.files) {
					if ($scope.files[i].path == filePath) {
						$scope.fileSelection = $scope.files[i];
						break;
					}
				}
				$scope.$apply();
				initMode();
			});

		} else {
			// We have not chosen a file in the url.
			// List files, pick the first one, and reload.

			listFiles().then(function() {
				$location.url("/code/" + $scope.files[0].path);
				$scope.$apply();
			});
		}

		///////////////////////////////////////////////
		// PRIVATE FUNCTIONS
		///////////////////////////////////////////////

		var robotKeyIsDown = false;
		var robotSlowDelay = 200;
		var robotFastDelay = 30;

		function robotKeyDown(e) {
			if (e.which == 17 && !robotKeyIsDown && codeStartTime) {
				var now = new Date().getTime();
				var timeStepsSoFar = (now - codeStartTime) / msPerTimeStep;
				startTimeStep += timeStepsSoFar;
				codeStartTime = now;
				msPerTimeStep = robotFastDelay;
				robotKeyIsDown = true;
			}
		}

		function robotKeyUp(e) {
			if (e.which == 17 && robotKeyIsDown) {
				var now = new Date().getTime();
				var timeStepsSoFar = (now - codeStartTime) / msPerTimeStep;
				startTimeStep += timeStepsSoFar;
				codeStartTime = now;
				msPerTimeStep = robotSlowDelay;
				robotKeyIsDown = false;
			}
		}

		var msPerTimeStep = 0;
		var codeStartTime = 0;
		var startTimeStep = 0;

		var modeObj;
		var modeParams = {};
		function initMode()
		{
			$(document).off("keydown", robotKeyDown);
			$(document).off("keyup", robotKeyUp);

			switch($scope.mode) {
				case "logo":
					modeObj = new Logo($('#canvas')[0]);
					msPerTimeStep = 0;
					break;
				case "robot":
					modeParams = {
						map: Missions.missions[$scope.file.name.replace(".py","")],
					}
					modeObj = new Robot($('#canvas')[0], modeParams.map);
					msPerTimeStep = robotKeyIsDown ? robotFastDelay : robotSlowDelay;

					$(document).on("keydown", robotKeyDown);
					$(document).on("keyup", robotKeyUp);

					break;
				case "art":
					modeObj = new Art($('#canvas')[0]);
					msPerTimeStep = 0;
					modeParams = {
						screenWidth: $('#canvas').width(),
						screenHeight: $('#canvas').height(),
					};
					break;
			}
		}

		///////////////////////////////////////////////
		// EVENT HANDLING STUFF
		///////////////////////////////////////////////

		function sendEvent(event, namedArgs) {
			if ($scope.python_worker) {
				$scope.python_worker.postMessage({type:"EVENT", event: event, namedArgs: namedArgs});
			}    	
		}

		function mouseEvent(event, e) {
			var offset = $(e.target).offset();
			var x = e.pageX - offset.left;
			var y = e.pageY - offset.top;
			var button = ["left", "middle", "right"][e.button];
			sendEvent(event, {x:x, y:y, button:button});    	
		}

		$scope.canvas_mousedown = function(e) {
			mouseEvent("mousedown", e);
		}

		$scope.canvas_mousemove = function(e) {
			var offset = $(e.target).offset();
			var x = e.pageX - offset.left;
			var y = e.pageY - offset.top;
			sendEvent("mousemove", {x:x, y:y});    	
		}

		$scope.canvas_mouseup = function(e) {
			mouseEvent("mouseup", e);
		}

		///////////////////////////////////////////////
		// FILE OPERATIONS
		///////////////////////////////////////////////

		function listFiles() {
			return github.listFiles(github.user.login, "tealight-files", $scope.mode).then(function(files) {

				$scope.files = files;
				if ($scope.mode != "robot")
					$scope.files.push({name: "<New File...>", createNew: true});
				$scope.$apply();

			}).catch(function(e) {
				console.error("Error listing tealight files:", e);
				throw e;
			})
		}

		$scope.saveFile = function(message) {

			if ($scope.file)
			{

				if (!message)
					message = "Update " + $scope.file.path;

				var currentContent = $scope.editor.getValue()
				if ($scope.file.decodedContent != currentContent)
				{
					console.log("Content has changed. Saving", $scope.file.path, ".");

					github.commitChange($scope.file, currentContent, message).then(function(f)
					{
						console.log("Got back",f,"from commit");
						$scope.file.sha = f.content.sha;
						$scope.file.decodedContent = currentContent;
					}).catch(function(e) {
						console.error("Error saving file:", e);
					});
				}
				else
				{
					console.log("Not saving. Content unchanged.");
				}
			}
		}

		$scope.clearErrorWidget = function() {

			if ($scope.errorWidget) {
				$scope.errorWidget.clear();
				$scope.errorWidget = null;
			}
		}

		$scope.$watch("fileSelection", function(newVal, oldVal, scope) {

			if(newVal === oldVal)
				return; // Initialisation

			if (!oldVal)
				return; // We are setting the initial value.

			if(newVal.createNew) {
				
				console.log("Create new file");
				var newName = window.prompt("Type a name for the new file", "untitled.py");

				if (newName) {

					if (newName.lastIndexOf(".py") != newName.length - 3)
						newName += ".py";

					var initialContent = "print \"A new file!\"";

					github.createFile(github.user.login, "tealight-files", scope.mode + "/" + newName, initialContent).then(function(f) {
						console.log("Created", f.content.name);
						$location.url("/code/" + f.content.path);
						$scope.$apply();
					}).catch(function(e) {
						console.error("Error creating file:", e);
						setTimeout(function() {scope.fileSelection = oldVal; scope.$apply()}, 1)  					
					});

				} else {
					setTimeout(function() {scope.fileSelection = oldVal; scope.$apply()}, 1)
				}
				
			} else {
				$location.url("/code/" + newVal.path);
			}
		});
		///////////////////////////////////////////////
		// EXECUTION
		///////////////////////////////////////////////

		var lastConsoleUpdateTime = 0;
		var nextMessageId = 0;

		var consoleUpdateTimeout = null;
		function consoleUpdate() {
			$scope.$digest();
			lastConsoleUpdateTime = new Date().getTime();
			clearTimeout(consoleUpdateTimeout);
			consoleUpdateTimeout = null;
		}

		function consoleMessage(type, message) {

			while($scope.console.length > 100)
				$scope.console.shift();

			$scope.console.push({type: type, message: message, id: nextMessageId++});

			if (new Date().getTime()  - lastConsoleUpdateTime > 500) {
				consoleUpdate();
			} else {
				clearTimeout(consoleUpdateTimeout);
				consoleUpdateTimeout = setTimeout(consoleUpdate, 500);
			}
		}

		var globals = {
			stdout: function(str) {
				consoleMessage("INFO", str);
			},
			log: function() {
				console.log.apply(console, arguments)
			},
			done: function() {
				consoleMessage("INFO", "Done!");
				$scope.stopCode();
				$scope.$apply();
			},
			python_error: function(e) {
				var msg = e.message;
				var line = e.line;
				var col = e.col;

				consoleMessage("ERROR", msg + "\n");

				if (e.line) {
					//$scope.editor.addLineClass(line-1, "background", "tealight-line-error")
					$scope.errorWidget = $scope.editor.addLineWidget(line-1, $("<div/>").addClass("tealight-line-error").html(msg)[0]);
				}

				$scope.stopCode();
				$scope.$apply();
			},
			js_error: function(e) {
				var msg = e.message;
				var stack = e.stack;
				var line = e.line;
				var col = e.col;

				console.error("JS Error triggered by line", line, "and column", col);
				console.error(stack);

				consoleMessage("ERROR", msg + "\n");
				consoleMessage("ERROR", "See browser console for detailed (and largely unhelpful) error stack.\n")

				//$scope.editor.addLineClass(line-1, "background", "tealight-line-error")
				$scope.errorWidget = $scope.editor.addLineWidget(line-1, $("<div/>").addClass("tealight-line-error").html(msg)[0]);

				$scope.stopCode();
				$scope.$apply();
			},
			error: function(e) {
				var msg = e.message;
				console.error(msg);

				consoleMessage("ERROR", msg + "\n");
				consoleMessage("ERROR", stack + "\n");

				$scope.stopCode();
				$scope.$apply();
			},

		};

		var rpcQueue = [];
		setTimeout(rpcTick, 20);

		function rpcTick() {

			if (rpcQueue.length > 10000)
				globals.python_error({message: "RPC Queue Overflow"});

			if (rpcQueue.length > 0) {
				var now = new Date().getTime();

				if (codeStartTime == null) {
					// codeStartTime has not been set. Set it.
					codeStartTime = now;
					console.log("Setting code start time")
				} 

				if (msPerTimeStep > 0) {
					// We are doing slow replay. Work out which time step we're now up to.
					var executeUpToTimeStep = startTimeStep + ((now - codeStartTime) / msPerTimeStep);
				} else {
					// We are executing at full speed.
					var executeUpToTimeStep = rpcQueue[rpcQueue.length - 1].timeStep;
				}

				while(rpcQueue.length > 0 && rpcQueue[0].timeStep <= executeUpToTimeStep) {
					var r = rpcQueue.shift();
					var fn = r.fn;
					var args = r.args;
					var line = r.line;
					var col = r.col;

					var f = modeObj[fn] || globals[fn];
					var result = f.apply(modeObj, args);

					if (result instanceof Promise) {
						var after = function() {
							setTimeout(rpcTick, 20);
						}
						result.then(after).catch(function(msg) {
							globals.python_error({message: msg, line: line, col: col});
							$scope.stopCode();
							after();
						});
						return;
					}
				}
			}

			setTimeout(rpcTick, 20);
		}

		function onWorkerMessage(event) {
			switch (event.data.type)
			{
				case "rpc":

					rpcQueue.push.apply(rpcQueue, event.data.queue);

					break;
				case "module_cache":

					$scope.tealightSkulptModuleCache = event.data.modules;

					break;
			}
		}

		$scope.runFile = function() {
			$scope.stopCode();
			$scope.clearErrorWidget();
			rpcQueue = [];

			$scope.console = [];
			codeStartTime = null;
			startTimeStep = 0;

			$scope.python_worker = new Worker("js/app/run_python.js");

			$scope.saveFile("Running " + $scope.file.path);

			initMode();

			modeParams.githubToken = github.token;

			$scope.python_worker.addEventListener("message", onWorkerMessage);

			$scope.python_worker.postMessage({type: "MODULES", modules: $scope.tealightSkulptModuleCache});
			$scope.python_worker.postMessage({type: "RUN", code: $scope.editor.getValue(), params: modeParams});
			$scope.running = true;
		};

		$scope.stopCode = function() {
			if ($scope.python_worker) {
				$scope.python_worker.terminate();
				$scope.python_worker = null;
			}
			rpcQueue = [];
			$scope.running = false;
		}

	}])

	.controller("LoginController", ["$window", "$location", "github", function($window, $location, github) {
		var url = github.getLoginRedirectUrl();
		document.location.href = url + "#!?target=" + ($location.search()['target'] || "");
	}]);
});
