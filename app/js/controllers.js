'use strict';

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

    function initMode()
    {
        switch($scope.mode)
        {
            case "logo":
                Logo.init($('#canvas')[0]);
                break;
        }
    }


  	$scope.mode = $routeParams.mode;
    $scope.loadEditor = {};
    $scope.loadEditor.promise = new Promise(function(resolve, reject) { 
      $scope.loadEditor.resolve = resolve;
    });
    $scope.tealightSkulptModuleCache = {};

    Promise.all([

      $scope.loadEditor.promise, 

      github.listFiles(github.user.login, "tealight-files", $scope.mode).then(function(files) {
        
        $scope.fileInfo = files[0];
        $scope.files = files;

      }).catch(function(e) {
        console.error("Error listing tealight files:", e);
        throw e;
      })

    ]).then(function() {

      $scope.fileChanged();
      $scope.$apply();
    });

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

    $scope.fileChanged = function() {
      console.log("File changed:", $scope.fileInfo.name);

      $scope.editor.setValue("Loading " + $scope.fileInfo.name + "...");

      github.getFile(github.user.login, "tealight-files", $scope.fileInfo.path).then(function(f) {
        console.log("Loaded", f.name);
        $scope.editor.setValue(f.decodedContent);
        $scope.file = f;
      })

    };

    $scope.runFile = function() {
      $scope.stopCode();
      $scope.python_worker = new Worker("js/run_python.js");

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
              	  var r = eval(event.data.code);
              	  $scope.python_worker.postMessage({type: "RPC_RETURN", result: r, id: event.data.id});
              	  break;
              case "module_cache":
                  $scope.tealightSkulptModuleCache = event.data.modules;
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
