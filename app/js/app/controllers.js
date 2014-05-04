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


  .controller('ModeController', ["$scope", "$routeParams", "$rootScope", "github", function($scope, $routeParams, $rootScope, github) {
  	console.log("ModeController for user:", $rootScope.userProfile);

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

      // Make sure that the editor is loaded, and we have a full list of files. Then load the first file.

      Promise.all([

      	$scope.loadEditor.promise, 
      	listFiles()

      	]).then(function() {
      		$scope.fileInfo = $scope.files[0];
      		$scope.$apply();
      	});

    	///////////////////////////////////////////////
      // PRIVATE FUNCTIONS
    	///////////////////////////////////////////////

      var modeObj;
      var modeParams = {};
    	function initMode()
    	{
    		switch($scope.mode)
    		{
    			case "logo":
    			  modeObj = new Logo($('#canvas')[0]);
    			  break;
          case "robot":
            modeObj = new Robot($('#canvas')[0]);
            break;
          case "art":
            modeObj = new Art($('#canvas')[0]);
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
          $scope.files.push({name: "<New File...>", createNew: true});

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
          console.log("Content has changed. Saving", $scope.fileInfo.path, ".");

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

  function loadFile(path) {
    console.log("Loading ", path);

    $scope.editor.setValue("Loading " + path + "...");

    return github.getFile(github.user.login, "tealight-files", path).then(function(f) {
     console.log("Loaded", f.name);
     $scope.editor.setValue(f.decodedContent);
     $scope.file = f;
   })
  }

  $scope.$watch("fileInfo", function(newVal, oldVal, scope) {

    if(newVal === oldVal)
    			return; // Initialisation

    		if(newVal.createNew) {

    			console.log("Create new file");
    			var newName = window.prompt("Type a name for the new file", "untitled.py");

    			if (newName) {

            if (newName.lastIndexOf(".py") != newName.length - 3)
             newName += ".py";

           var initialContent = "print \"A new file!\"";
           var path = 
           github.createFile(github.user.login, "tealight-files", scope.mode + "/" + newName, initialContent).then(function(f) {
             console.log("Created", f.content.name);
             scope.fileInfo = f.content;
             return loadFile(f.content.path)
             .then(listFiles()).then(function() {})
           }).catch(function(e) {
             console.error("Error creating file:", e);
             setTimeout(function() {scope.fileInfo = oldVal; scope.$apply()}, 1)  					
           });

         } else {
          setTimeout(function() {scope.fileInfo = oldVal; scope.$apply()}, 1)
        }

      } else {

       loadFile(newVal.path);
     }

   });

    	///////////////////////////////////////////////
      // EXECUTION
    	///////////////////////////////////////////////

      var lastConsoleUpdateTime = 0;
      var nextMessageId = 0;

      function consoleMessage(type, message) {

        while($scope.console.length > 100)
          $scope.console.shift();

        $scope.console.push({type: type, message: message, id: nextMessageId++});

        if (new Date().getTime()  - lastConsoleUpdateTime > 100) {
          $scope.$apply();
          lastConsoleUpdateTime = new Date().getTime();
        }
      }

      function onWorkerMessage(event) {
          switch (event.data.type)
          {
            case "stdout":

              consoleMessage("INFO", event.data.message);

              break;
            case "done":

              consoleMessage("INFO", "Done!");
              $scope.running = false;
              $scope.$apply();

              break;
            case "eval":
              eval(event.data.code);

              break;
            case "rpc":
          
              var fn = event.data.fn;
              var args = event.data.args;
              
              modeObj[fn].apply(modeObj, args);

              break;
            case "module_cache":

              $scope.tealightSkulptModuleCache = event.data.modules;

              break;
            case "python_error":
              var msg = event.data.message;
              var line = event.data.line;
              var col = event.data.col;

              consoleMessage("ERROR", msg + "\n");
              
              $scope.editor.addLineClass(line-1, "background", "tealight-line-error")

              $scope.stopCode();
              $scope.$apply();

              break;
            case "js_error":

              var msg = event.data.message;
              var stack = event.data.stack;
              var line = event.data.line;
              var col = event.data.col;

              console.error("JS Error triggered by line", line, "and column", col);
              console.error(stack);

              consoleMessage("ERROR", msg + "\n");
              consoleMessage("ERROR", "See browser console for detailed (and largely unhelpful) error stack.\n")

              $scope.editor.addLineClass(line-1, "background", "tealight-line-error")

              $scope.stopCode();
              $scope.$apply();

              break;
            case "error":

              var msg = event.data.message;
              console.error(msg);

              consoleMessage("ERROR", msg + "\n");
              consoleMessage("ERROR", stack + "\n");

              $scope.stopCode();
              $scope.$apply();

              break;
          }
      }

    	$scope.runFile = function() {
    		$scope.stopCode();
    		$scope.python_worker = new Worker("js/app/run_python.js");

    		$scope.saveFile("Running " + $scope.fileInfo.path);

    		initMode();


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
    		$scope.running = false;
    	}

    }])


  .controller("LoginController", ["$window", "$location", "github", function($window, $location, github) {
  	var url = github.getLoginRedirectUrl();
  	document.location.href = url + "#!?target=" + ($location.search()['target'] || "");
  }]);
});
