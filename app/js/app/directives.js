'use strict';
define(["angular", "app/filters", "codemirrorPython"], function() {

	/* CodeMirror addins */

	CodeMirror.defineOption("scopeBG", false, function(cm, val, old) {
		if (old && old != CodeMirror.Init) {
			clearScopeBG(cm);
			cm.off("renderLine", refreshScopeBG);
			cm.off("change", refreshScopeBG);
		}
		if (val) {
			setScopeBG(cm);
			cm.on("refresh", refreshScopeBG);
			cm.on("change", refreshScopeBG);
		}
	});

	function clearScopeBG(cm) {
		for (var i = cm.display.lineSpace.childNodes.length - 1; i >= 0; i--) {
			var node = cm.display.lineSpace.childNodes[i];
			if (/(^|\s)scope-bg($|\s)/.test(node.className))
				node.parentNode.removeChild(node);
		}
	}

	function setScopeBG(cm) {
		var indents = [];
		var parens = 0;
		cm.eachLine(function(line) {
			if (/^\s*$/.test(line.text)) {
				indents.push(null)
			} else {
				if (parens > 0) {
					indents.push(indents[indents.length-1])
				} else {
					indents.push(/^\s*/.exec(line.text)[0].length)
				}

				parens += (line.text.match(/\(|\[|\{/g) || []).length
				parens -= (line.text.match(/\)|\]|\}/g) || []).length
			}
		});
		for (var i = indents.length - 1; i >=0; --i) {
			if (indents[i] === null) {
				if (i == indents.length - 1)
					indents[i] = 0;
				else if (/^\s*(else|elif)\s*:/.test(cm.getLine(i+1)))
					indents[i] = null
				else
					indents[i] = indents[i+1]
			}
		}
		for (var i = 1; i < indents.length; ++i) {
			if (indents[i] === null) {
				indents[i] = indents[i-1]
			}
		}

		var scopeBoxes = [];
		var curScopes = [0];
		var curScopeBoxes = [];
		cm.eachLine(function(line) {
			var li = cm.lineInfo(line);
			var indent = indents[li.line];
			var curScope = curScopes[curScopes.length - 1];
			//console.log(curScope);
			if (indent > curScope) {
				var coords = cm.charCoords({line:li.line, ch: indent}, "local");
				var coords0 = cm.charCoords({line:0, ch: 0}, "local");
				curScopes.push(indent);
				curScopeBoxes.push({left: coords.left - coords0.left, top: coords.top - coords0.top, height: 0, level: curScopes.length-1});
			} else {
				while (indent < curScopes[curScopes.length - 1]) {
					//console.log("popping");
					scopeBoxes.push(curScopeBoxes.pop());
					curScopes.pop();
				}
			}
			curScopeBoxes.forEach(function(box) {
				box.height += line.height;
			});
		});
		while (curScopeBoxes.length) {
			scopeBoxes.push(curScopeBoxes.pop());
		}

		scopeBoxes.sort(function(a,b) { return a.level - b.level; })

		var right = cm.display.scroller.offsetWidth;
		scopeBoxes.forEach(function(box) {
			var elt = document.createElement("div");
			elt.className = "scope-bg scope-bg-" + box.level;
			elt.style.position = "absolute";
			elt.style.left = box.left + "px";
			elt.style.top = box.top + "px";;
			elt.style.height = box.height + "px";;
			elt.style.width = (right - box.left) + "px";;
			cm.display.lineSpace.insertBefore(elt, cm.display.cursorDiv);
		});
	}

	function refreshScopeBG(cm) {
		clearScopeBG(cm);
		setScopeBG(cm);
	}

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
				tabSize: 2,
				scopeBG: true,
			    extraKeys: {
			      Tab: function(cm) {
			        if (cm.getSelection().length)
			        	CodeMirror.commands.indentMore(cm)
			        else 
			        	cm.replaceSelection("  ", "end")
			    	},
			      'Shift-Tab': function(cm) {
			        CodeMirror.commands.indentLess(cm)
			    	},
			      'Ctrl-Enter': function(cm) {
			      	scope.$emit("run-code");
			      }
			    }
			});

			scope.editor.on("change", scope.clearErrorWidget);


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
