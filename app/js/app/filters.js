'use strict';
define(["angular"], function() {

	/* Filters */

	angular.module('tealight.filters', []).
	  filter('interpolate', ['version', function(version) {
	    return function(text) {
	      return String(text).replace(/\%VERSION\%/mg, version);
	    };
	  }]);
});
