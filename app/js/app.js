'use strict';

var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");

    if (c_start == -1)
        c_start = c_value.indexOf(c_name + "=");

    if (c_start == -1)
    {
        c_value = null;
    }
    else
    {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);

        if (c_end == -1)
            c_end = c_value.length;

        c_value = unescape(c_value.substring(c_start,c_end));
    }

    return c_value;
}


// Declare app level module which depends on filters, and services
angular.module('tealight', [
  'ngRoute',
  'tealight.filters',
  'tealight.services',
  'tealight.directives',
  'tealight.controllers',
  'github',
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

 
  function loginResolver(LoginChecker) {
  	return LoginChecker.requireLogin();
  }
  loginResolver['$inject'] = ['LoginChecker'];

  $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeController'});
  $routeProvider.when('/about', {templateUrl: 'partials/about.html', controller: 'AboutController'});

  $routeProvider.when("/code", {templateUrl: "partials/code.html", controller: "CodeController", resolve: { user: loginResolver }});
  $routeProvider.when("/code/:mode", {templateUrl: "partials/mode.html", controller: "ModeController", resolve: { user: loginResolver }});

  $routeProvider.when("/login", {template: "", controller: "LoginController"});
  $routeProvider.when("/login_progress", {template: ""});

  $routeProvider.otherwise({redirectTo: '/home'});

  $locationProvider.html5Mode(false).hashPrefix('!');

}]).
run(["$location", "github", "$rootScope", function($location, github, $rootScope) {

	$(document).foundation();


	// On document load, we either have a code in the query string, or a token cookie, or neither.
	var target = null;
	var githubLoaded = new Promise(function(resolve, reject) {

		if (getCookie("tealight-token")) {
			$rootScope.loggingIn = true;
			target = $location.url();
			// We can't leave the URL as it is - it will almost certainly get us stuck in a redirect loop because it needs authorisation that we don't have yet.
			$location.url("/login_progress");
			$rootScope.$apply();

			github.initWithToken(getCookie("tealight-token")).then(function() {
				resolve();
			}).catch(function() { reject(); });
		} else if (urlParams["code"]) {
			$rootScope.loggingIn = true;
			target = $location.search()['target'];
			// We can't leave the URL as it is - it will almost certainly get us stuck in a redirect loop because it needs authorisation that we don't have yet.
			$location.url("/login_progress");
			$rootScope.$apply();

			github.initWithCode(urlParams['code']).then(function() {

				document.cookie = "tealight-token=" + github.token;

				// Do this to get rid of the code from the url. But it will reload the page, so be sure you've saved the token somewhere. 
				// Everything will still work with this line commented out, but the URL will be less nice.
				document.location.href = document.location.href.split("?")[0] + "#!" + target;

				resolve();
			}).catch(function() { reject(); });
		}
	}).then(function() {
		console.log("Github successfully loaded");
		$rootScope.loggingIn = false;

		$rootScope.userProfile = github.user;

		if (target != null) {
			if (target == "")
				target = "/home";

			$location.url(target);
			$rootScope.$apply();
		}

	}).catch(function() {

		$rootScope.loggingIn = false;
		console.warn("Failed to load github. Clearing cookies.");
		document.cookie = 'tealight-token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

		$rootScope.userProfile = null;
		$location.url("/home");
		$rootScope.$apply();

	});

}]);

