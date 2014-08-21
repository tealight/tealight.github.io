'use strict';
define(["angular", "app/filters", "codemirrorPython"], function() {

	/* CodeMirror addins */

	CodeMirror.defineOption("pythonIndentationGuides", false, function(cm, val, old) {
        if (old && old != CodeMirror.Init) {
            clearPythonIndendationGuides(cm);
            cm.off("update", refreshPythonIndendationGuides);
            cm.off("cursorActivity", refreshPythonIndendationGuides);
        }
        if (val) {
            createPythonIndendationGuides(cm);
            cm.on("update", refreshPythonIndendationGuides);
            cm.on("cursorActivity", refreshPythonIndendationGuides);
        }
    });

    function clearPythonIndendationGuides(cm) {
        // Remove all children with class "cm-python-indent-guide"
        for (var i = cm.display.lineSpace.childNodes.length - 1; i >= 0; i--) {
            var node = cm.display.lineSpace.childNodes[i];
            if (/(^|\s)cm-python-indent-guide($|\s)/.test(node.className))
                node.parentNode.removeChild(node);
        }
    }

    function createPythonIndendationGuides(cm) {
        // Calculate indentation of each line
        var indents = [];
        var parens = 0;
        var ml_string = false;
        var cursorPos = cm.getCursor();
        cm.eachLine(function(line) {
            var text = line.text;
            // Replace strings with "" (i.e. clear strings)
            text = text.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '""')
            // Remove text after comments
            text = text.replace(/#.*/,"#");

            if (parens > 0 || ml_string) {
                // If we have open parentheses or are in a """ string, use the previous line's indentation
                indents.push(indents[indents.length-1]);
            } else if (/^\s*$/.test(text)) {
                if (!cm.somethingSelected() && cursorPos.line == cm.lineInfo(line).line) {
                    // Empty lines with the cursor in them are indented to the position of the cursor
                    indents.push(cursorPos.ch);
                } else {
                    // Empty lines don't contribute to indentation changes
                    indents.push(null);
                }
            } else {
                // Indent by the number of spaces at the start (accounts for tabs)
                indents.push(CodeMirror.countColumn(text, null, cm.getOption("tabSize")));
            }

            // See (or rather, approximate) if there are any open parentheses
            // or """ strings.
            //
            // This has lots of edge cases that won't work, but it's close
            // enough without having to write a full python lexer.
            if (ml_string) {
                ml_string = ((text.match(/"""/g) || []).length % 2 === 0)
            } else {
                ml_string = ((text.match(/"""/g) || []).length % 2 === 1)
            }
            if (!ml_string) {
                parens += (text.match(/\(|\[|\{/g) || []).length
                parens -= (text.match(/\)|\]|\}/g) || []).length
            }
        });

        // Go backwards through the indents, setting empty lines (with null
        // indent) to have the next line's indent.
        //
        // Going backwards makes blocks end on their last line with content, as
        // opposed to above the next line with content (which is what happens if
        // you use the previous line's indent)
        // 
        // def foo():
        //    pass <-- block ends here
        //
        //         <-- not here
        // foo()
        //
        for (var i = indents.length - 1; i >=0; --i) {
            if (indents[i] === null) {
                if (i == indents.length - 1)
                    indents[i] = 0;
                else {
                    // The exception is when the next block is paired with this
                    // block, e.g. if/else, in which case we want to continue
                    // the block to the end, done in the next pass.
                    // 
                    // FIXME: nested ifs continue to the previous nesting level's else
                    var nextLine = cm.getLine(i+1);

                    // If the chopped off line starts with an else or whatever,
                    // then we'll need to continue the block, so flip the sign.
                    // Otherwise, just copy the next line's indentation.
                    if (/^\s*(else|finally|elif\s.*|except(\s.*)?)\s*:/.test(nextLine))
                        indents[i] = null;
                    else
                        indents[i] = indents[i+1];
                }
            }
        }
        // Go back forward, setting any missing indents (from the first part of
        // two-part blocks) with their predecessor's indentation
        for (var i = 1; i < indents.length; ++i) {
            if (indents[i] === null) {
                indents[i] = indents[i-1];
            }
        }

        // For each increase in indentation level, find blocks which start with
        // that indent, and continue while indent >= start indent
        var scopeBoxes = [];
        var curScopes = [0];
        var curScopeBoxes = [];
        var line0 = cm.heightAtLine(0);
        cm.eachLine(function(line) {
            var li = cm.lineInfo(line);
            var indent = indents[li.line];
            var curScope = curScopes[curScopes.length - 1];
            if (indent > curScope) {
                // If the indentation level increased, that means we're starting a new box
                curScopes.push(indent);
                curScopeBoxes.push({left: cm.defaultCharWidth()*indent, top: cm.heightAtLine(li.line) - line0, level: curScopes.length-1});
            } else {
                // If the indentation level dropped, that means we're closing all boxes with higher indent level
                while (indent < curScopes[curScopes.length - 1]) {
                    var box = curScopeBoxes.pop();
                    box.bottom = cm.heightAtLine(li.line) - line0;
                    scopeBoxes.push(box);
                    curScopes.pop();
                }
            }
        });
        // Close any left-over boxes
        while (curScopeBoxes.length) {
            var box = curScopeBoxes.pop();
            box.bottom = cm.heightAtLine(cm.lastLine()+1) - line0;
            scopeBoxes.push(box);
        }

        // Sort by increasing indent level so that higher level boxes are on
        // top of lower indent ones
        scopeBoxes.sort(function(a,b) { return a.level - b.level; })

        // Add boxes to cm.display.lineSpace, behind text and cursors, stretching all the way to the right.
        scopeBoxes.forEach(function(box) {
            var elt = document.createElement("div");
            elt.className = "cm-python-indent-guide cm-python-indent-guide-" + box.level;
            elt.setAttribute("data-level", box.level);
            elt.style.position = "absolute";
            elt.style.left = box.left + "px";
            elt.style.top = box.top + "px";
            // Set bottom/right instead of width/height to compensate for styling on the indent guides, especially borders
            elt.style.bottom = (cm.display.lineSpace.offsetHeight - box.bottom) + "px";
            elt.style.right = "0px";
            cm.display.lineSpace.insertBefore(elt, cm.display.cursorDiv);
        });
    }

    function refreshPythonIndendationGuides(cm) {
        clearPythonIndendationGuides(cm);
        createPythonIndendationGuides(cm);
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
				pythonIndentationGuides: true,
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

			scope.editor.on("focus", function() {
				scope.stopCode();
			});

			scope.$on("focusCodeEditor", function() {
				scope.editor.getInputField().focus();
			});

			scope.$on("blurCodeEditor", function() {
				scope.editor.getInputField().blur();
			})

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
						element.attr("unselectable", "on");
						element.css("user-select", "none");
						element.scrollTop(element[0].scrollHeight);

						// TODO: Make the console selectable again.

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
