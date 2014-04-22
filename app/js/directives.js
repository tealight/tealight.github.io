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

		scope.editor = CodeMirror(element[0],
		{
			mode: "python",
			lineNumbers: true,
			theme: "neat",
		});

    scope.loadEditor.resolve();

  	}

  	return { link: link };
  }])

  .directive('tealightConsole', [function() {

    return { 

      scope: {
        lines: "=",
      },

      templateUrl: "partials/console.html",

      link: function(scope, element, attrs) {

        scope.$watch('lines', function(newVal, oldVal, scope) {
          element.scrollTop(element[0].scrollHeight);
        }, true)
      },

    };
  }])

  .directive('tealightExpandHeight', function() {
    return { 

      scope: {
        heightPercent: "=",
        bottomGap: "=",
      },

      link: function(scope, element, attrs) {
        console.log(element.offset());
        //element.height(($("body").height() - element.offset().top - scope.bottomGap) * scope.heightPercent * 0.01);
      }
    };
  });
