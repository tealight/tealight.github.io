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

	.controller('GalleryController', ["$scope", function($scope) {
		$scope.panels = [{
			title: "Sutton Trust Summer School 2014",
			featured: [{
				title: "Connect 4",
				subtitle: "Group 1",
				user: "chandler6",
				path: "art/connectfourmain.py",
				minWidth: 900,
				minHeight: 900,
				authors: [{
					name: "Chandler Goddard",
					username: "chandler6",
				}, {
					name: "Chloe Ayoub",
					username: "chloea",
				}, {
					name: "Maurice Yap",
					username: "mauriceyap",
				}, {
					name: "Sohraab Sayed",
					username: "v3506",
				}],
			},{
				title: "Memory Game",
				subtitle: "Group 2",
				user: "shivam1023",
				path: "art/MemoryGame.py",
				minWidth: 850,
				minHeight: 1000,
				authors: [{
					name: "Shivam Shah",
					username: "shivam1023",
				}, {
					name: "Feras Al-Hamadani",
					username: "feras96",
				}, {
					name: "Jordan Clark",
					username: "jordanc44",
				}, {
					name: "Saxon Zerbino",
					username: "lordofsax",
				}],
			},{
				title: "Connect 4",
				subtitle: "Group 3",
				user: "griffithsben",
				path: "art/Connect4Main.py",
				minWidth: 900,
				minHeight: 900,
				authors: [{
					name: "Ben Griffiths",
					username: "griffithsben",
				}, {
					name: "Andrew Wells",
					username: "andyandywells",
				}, {
					name: "Basil Regi",
					username: "basregi",
				}, {
					name: "Nicholas McAlpin",
					username: "nickmcalpin",
				}],
			},{
				title: "dinOTHELLOsaurus",
				subtitle: "Group 4",
				user: "anthonyajsmith",
				path: "art/othello.py",
				minWidth: 1200,
				minHeight: 850,
				authors: [{
					name: "Anthony Smith",
					username: "anthonyajsmith",
				}, {
					name: "Ahartisha Selakanabarajah",
					username: "arty001",
				}, {
					name: "Louise Truong",
					username: "louisahoa",
				}, {
					name: "Ronan Kelly",
					username: "ronanmtkelly",
				}],
			},{
				title: "Minesweeper",
				subtitle: "Group 5",
				user: "davidsamueljones",
				path: "art/Minesweeper.py",
				minWidth: 600,
				minHeight: 1000,
				authors: [{
					name: "David Jones",
					username: "davidsamueljones",
				}, {
					name: "Christopher Davies",
					username: "v3520",
				}, {
					name: "Elizabeth Tebbutt",
					username: "lizztebbutt",
				}, {
					name: "Emrecan Kayran",
					username: "emrecan-k",
				}],
			},{
				title: "Racetrack",
				subtitle: "Group 6",
				user: "a-l-williams",
				path: "art/project.py",
				minWidth: 1000,
				minHeight: 1000,
				authors: [{
					name: "Adam Williams",
					username: "a-l-williams",
				}, {
					name: "Matthew Brooks",
					username: "lordvile018",
				}, {
					name: "Calin Tataru",
					username: "calintat",
				}],
			},{
				title: "Racetrack",
				subtitle: "Group 7",
				user: "v3491",
				path: "art/racetrack.py",
				authors: [{
					name: "George Andersen",
					username: "v3491",
				}, {
					name: "Callum Ryan",
					username: "c-ryan747",
				}],
			}],
		}];

	}])

	.controller('ModeController', ["$scope", "$routeParams", "$rootScope", "$location", "Missions", "github", "$window", function($scope, $routeParams, $rootScope, $location, Missions, github, $window) {
		console.log("ModeController for user:", $rootScope.userProfile);

		Missions.load.then(function(missions) {
			console.log("Missions loaded.");
		})

		///////////////////////////////////////////////
		// INITIALISATION
		///////////////////////////////////////////////

		console.debug("Route params:", $routeParams);

		// TODO: Need to think about rate limiting for gallery mode: https://developer.github.com/v3/#rate-limiting

		$scope.gallery = !!$routeParams.username;

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

				return github.getFile($routeParams.username || github.user.login, "tealight-files", filePath).then(function(f) {
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

					try {
						var minWidth = parseInt($location.search().minWidth);
						var minHeight = parseInt($location.search().minHeight);
					} catch (e) {
						console.error(e);
					}

					if (minWidth && minHeight) {
						if ($('#canvas').width() < minWidth || $('#canvas').height() < minHeight) {
							modeObj.setMinScreenSize(minWidth, minHeight);
							modeParams = {
								screenWidth: minWidth,
								screenHeight: minHeight,
							};
						}
					} else {
						modeParams = {
							screenWidth: $('#canvas')[0].width,
							screenHeight: $('#canvas')[0].height,
						};
					}

					break;
			}
		}

		///////////////////////////////////////////////
		// EVENT HANDLING STUFF
		///////////////////////////////////////////////

		function sendEvent(event, args) {
			if ($scope.python_worker) {
				$scope.python_worker.postMessage({type:"EVENT", event: event, args: args});
			}    	
		}

		function mouseEvent(event, e) {
			var offset = $(e.target).offset();
			var x = e.target.width * (e.pageX - offset.left) / $(e.target).width();
			var y = e.target.height * (e.pageY - offset.top) / $(e.target).height();
			var button = [null,"left", "middle", "right"][e.which];

			if (modeObj && modeObj.inputTranslateX) {
				x = modeObj.inputTranslateX(x);
			}
			if (modeObj && modeObj.inputTranslateY) {
				y = modeObj.inputTranslateY(y);
			}

			sendEvent(event, [Math.round(x), Math.round(y), button]);    	
		}

		$scope.canvas_mousedown = function(e) {
			mouseEvent("mousedown", e);
		}

		$scope.canvas_mousemove = function(e) {
			mouseEvent("mousemove", e);    	
		}

		$scope.canvas_mouseup = function(e) {
			mouseEvent("mouseup", e);
		}

		///////////////////////////////////////////////
		// FILE OPERATIONS
		///////////////////////////////////////////////

		function listFiles() {
			return github.listFiles($routeParams.username || github.user.login, "tealight-files", $scope.mode).then(function(files) {

				$scope.files = files;
				if ($scope.mode != "robot" && !$scope.gallery)
					$scope.files.push({name: "<New File...>", createNew: true});
				$scope.$apply();

			}).catch(function(e) {
				console.error("Error listing tealight files:", e);
				throw e;
			})
		}

		$scope.saveFile = function(message) {

			if ($scope.file && !$scope.gallery)
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

			$scope.editor.eachLine(function(h) {
				$scope.editor.removeLineClass(h, "wrap");
			});

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
				if ($scope.gallery) {
					$location.url("/gallery/" + $routeParams.username + "/" + newVal.path);
				} else {
					$location.url("/code/" + newVal.path);
				}
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
			beginBatch: function() {},
			endBatch: function() {},
			python_error: function(e) {
				var msg = e.message;
				var line = e.line;
				var col = e.col;

				if (line > $scope.editor.lineCount()) {
					col = $scope.editor.getLine($scope.editor.lineCount()-1).length;
				}

				line = Math.min(line, $scope.editor.lineCount());


				consoleMessage("ERROR", msg + "\n");

				if (e.line) {
					var p = "^\n";
					for(var i = 0; i < col; i++)
						p = "&nbsp;" + p;
					$scope.editor.addLineClass(line-1, "wrap", "error-line")
					$scope.errorWidget = $scope.editor.addLineWidget(line-1, 
						$("<div/>").html(col > 0 ? p : "").append(
							$("<div/>").addClass("error-widget").html(msg)
						)[0], {noHScroll: true});
				}

				$scope.stopCode();
				$scope.$apply();
			},
			js_error: function(e) {
				var msg = e.message;
				var stack = e.stack;
				var line = e.line;
				var col = e.col;

				if (line > $scope.editor.lineCount()) {
					col = $scope.editor.getLine($scope.editor.lineCount()-1).length;
				}

				line = Math.min(line, $scope.editor.lineCount());

				console.error("JS Error triggered by line", line, "and column", col);
				console.error(stack);

				consoleMessage("ERROR", msg + "\n");
				consoleMessage("ERROR", "See browser console for detailed (and largely unhelpful) error stack.\n")

				if (e.line) {
					var p = "^\n";
					for(var i = 0; i < col; i++)
						p = "&nbsp;" + p;
					$scope.editor.addLineClass(line-1, "wrap", "error-line")
					$scope.errorWidget = $scope.editor.addLineWidget(line-1, 
						$("<div/>").html( col > 0 ? p : "").append(
							$("<div/>").addClass("error-widget").html(msg)
						)[0], {noHScroll: true});
				}

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
					try {
						var result = f.apply(modeObj, args);
					} catch (e) {
						globals.python_error({message: e.message, line: line, col: col});
						$scope.stopCode();
					}

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
			$scope.$broadcast("blurCodeEditor");
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
			$scope.$broadcast("focusCodeEditor");
		}

		var pressedKeys = {};

		var keyEvent = function(event, e) {
			var k = null

			if (e.which >= 48 && e.which <= 57 ||
				e.which >= 65 && e.which <= 90) {

				k = String.fromCharCode(e.which).toLowerCase();

			} else if (e.which == 8) {
				k = "backspace";
			} else if (e.which == 9) {
				k = "tab";
			} else if (e.which == 13) {
				k = "return";
			} else if (e.which == 16) {
				k = "shift";
			} else if (e.which == 17) {
				k = "ctrl";
			} else if (e.which == 18) {
				k = "alt";
			} else if (e.which == 27) {
				k = "escape";
			} else if (e.which == 32) {
				k = "space";
			} else if (e.which == 38) {
				k = "up";
			} else if (e.which == 40) {
				k = "down";
			} else if (e.which == 37) {
				k = "left";
			} else if (e.which == 39) {
				k = "right";
			} else if (e.which == 46) {
				k = "delete";
			}

			if (k) {
				e.preventDefault();
				e.stopPropagation();

				if (!pressedKeys[e.which]) 
					sendEvent(event, [k])

			}

		}

		var window_keydown = function(e) {

			keyEvent("keydown", e);

			pressedKeys[e.which] = true;
		}

		var window_keyup = function(e) {

			delete pressedKeys[e.which];

			keyEvent("keyup", e);
		}

		$scope.$watch("running", function(newRunning) {
			if (newRunning) {

				$($window).on("keydown", window_keydown)
				$($window).on("keyup", window_keyup)

			} else {

				$($window).off("keydown", window_keydown);
				$($window).off("keyup", window_keyup);

			}
		})

		$scope.$on("$destroy", function() {
			$($window).off("keydown", window_keydown);
			$($window).off("keyup", window_keyup);		

			if ($scope.file) {
				$scope.saveFile("Closing " + $scope.file.path);
			}
		})

		$scope.$on("run-code", function() {
			$scope.runFile();
			$scope.$apply();
		})
		$scope.$on("save-code", function() {
			$scope.saveFile("Saving " + $scope.file.path);
		})
	}])

	.controller("LoginController", ["$window", "$location", "github", function($window, $location, github) {
		var url = github.getLoginRedirectUrl();
		document.location.href = url + "#!?target=" + ($location.search()['target'] || "");
	}]);
});
