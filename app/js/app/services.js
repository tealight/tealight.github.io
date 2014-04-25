'use strict';
define(["angular"], function() {

  /* Services */


  // Demonstrate how to register services
  // In this case it is a simple value service.
  angular.module('tealight.services', []).

    value('version', '0.1').

    service('LoginChecker', ["$rootScope", "$location", function($rootScope, $location) {

    	$rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
    		if (rejection == "unauthorized") {
    			var url = $location.url();
  	  		console.warn("Login required for", url, ". Redirecting to /login.");
  	  		$location.url("/login");
  	  		$location.search("target", url);
  	  	}
    	});
    
    	this.requireLogin = function() {
    		return $rootScope.userProfile ? Promise.resolve() : Promise.reject("unauthorized");
    	};

    }]);
});
