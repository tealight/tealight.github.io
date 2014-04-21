'use strict';

/* Directives */


angular.module('tealight.directives', [])

  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])

  .directive('tealightCodeMirror', [function() {

  	function link(scope, element, attrs) {

		scope.codeMirror = CodeMirror(element[0],
		{
			mode: "python",
			lineNumbers: true,
			theme: "solarized dark"
		});


  	}

  	return { link: link };
  }]);
