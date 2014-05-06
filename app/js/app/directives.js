'use strict';
define(["angular", "app/filters", "codemirrorPython"], function() {

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

			scope.editor.on("change", function() {
				for(var i = 0; i < scope.editor.lineCount(); i++)
					scope.editor.removeLineClass(i, "background", "tealight-line-error");
			});


			scope.loadEditor.resolve();

		}

		return { link: link };
	}])

	.directive('tealightConsole', [function() {

		return { 

			scope: {
				messages: "=",
			},

			templateUrl: "partials/console.html",

			link: function(scope, element, attrs) {

				var scrollTimeout = null;
				scope.$watch('messages', function(newVal, oldVal, scope) {

					clearTimeout(scrollTimeout);

					scrollTimeout = setTimeout(function() {
						element.scrollTop(element[0].scrollHeight);
					}, 1);
				}, true);
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
});
