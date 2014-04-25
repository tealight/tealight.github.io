'use strict';
define(["require", "angular", "github", "app/modes/logo", "app/modes/robot"], function(require) {

  var Logo = require("app/modes/logo");
  var Robot = require("app/modes/robot");
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

    	$scope.runFile = function() {
    		$scope.stopCode();
    		$scope.python_worker = new Worker("js/app/run_python.js");

    		$scope.saveFile("Running " + $scope.fileInfo.path);

    		$scope.stdout = [];
    		initMode();
    		$scope.python_worker.addEventListener("message", function(event)
    		{
    			switch (event.data.type)
    			{
    				case "stdout":
      				if($scope.stdout.length > 100)
      					$scope.stdout = $scope.stdout.slice(1);
      				$scope.stdout.push(event.data.message);
      				$scope.$apply();
      				break;
    				case "done":
      				$scope.stdout.push("Done!");
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
            case "error":
              console.error(event.data.stack);
              break;

          }
        });

    		$scope.python_worker.postMessage({type: "MODULES", modules: $scope.tealightSkulptModuleCache});
    		$scope.python_worker.postMessage({type: "RUN", code: $scope.editor.getValue()});
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
