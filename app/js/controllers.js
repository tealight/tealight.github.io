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


  .controller('ModeController', ["$scope", "$routeParams", "$rootScope", function($scope, $routeParams, $rootScope) {
  	console.log("ModeController for user:", $rootScope.userProfile);
	$scope.mode = $routeParams.mode;


	$scope.file = "one";

	$scope.files = ["one", "two", "three"]

	//$scope.chooseFile = function(file) {
	//	$scope.codeMirror.setValue("Contents of " + file);
	//}

  }])


  .controller("LoginController", ["$window", "$location", "github", function($window, $location, github) {
  	var url = github.getLoginRedirectUrl();
  	document.location.href = url + "#!?target=" + ($location.search()['target'] || "");
  }]);
