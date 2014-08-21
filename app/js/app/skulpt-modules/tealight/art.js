var $builtinmodule = function(name)
{
    var mod = {};
	
    mod.color = new Sk.builtin.func(function(c) {
        Sk.builtin.pyCheckArgs("color", arguments, 1, 1);
        Sk.builtin.pyCheckType("c", "string", Sk.builtin.checkString(c));

    	rpc("setColor", 0, c.v);
    });

    mod.line = new Sk.builtin.func(function(x1, y1, x2, y2) {
        Sk.builtin.pyCheckArgs("line", arguments, 4, 4);
        Sk.builtin.pyCheckType("x1", "number", Sk.builtin.checkNumber(x1));
        Sk.builtin.pyCheckType("x2", "number", Sk.builtin.checkNumber(x2));
        Sk.builtin.pyCheckType("y1", "number", Sk.builtin.checkNumber(y1));
        Sk.builtin.pyCheckType("y2", "number", Sk.builtin.checkNumber(y2));

    	rpc("line", 1, x1.v, y1.v, x2.v, y2.v);
    });

    mod.spot = new Sk.builtin.func(function(x, y, radius) {
        Sk.builtin.pyCheckArgs("spot", arguments, 3, 3);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));
        Sk.builtin.pyCheckType("radius", "number", Sk.builtin.checkNumber(radius));

    	rpc("spot", 1, x.v, y.v, radius.v);
    });

    mod.circle = new Sk.builtin.func(function(x, y, radius) {
        Sk.builtin.pyCheckArgs("circle", arguments, 3, 3);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));
        Sk.builtin.pyCheckType("radius", "number", Sk.builtin.checkNumber(radius));

    	rpc("circle", 1, x.v, y.v, radius.v);
    });

    mod.box = new Sk.builtin.func(function(x, y, width, height) {
        Sk.builtin.pyCheckArgs("box", arguments, 4, 4);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));
        Sk.builtin.pyCheckType("width", "number", Sk.builtin.checkNumber(width));
        Sk.builtin.pyCheckType("height", "number", Sk.builtin.checkNumber(height));

    	rpc("box", 1, x.v, y.v, width.v, height.v);
    });

    mod.rectangle = new Sk.builtin.func(function(x, y, width, height) {
        Sk.builtin.pyCheckArgs("rectangle", arguments, 4, 4);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));
        Sk.builtin.pyCheckType("width", "number", Sk.builtin.checkNumber(width));
        Sk.builtin.pyCheckType("height", "number", Sk.builtin.checkNumber(height));

    	rpc("rectangle", 1, x.v, y.v, width.v, height.v);
    });

    mod.image = new Sk.builtin.func(function(x, y, path) {
        Sk.builtin.pyCheckArgs("image", arguments, 3, 3);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));
        Sk.builtin.pyCheckType("path", "string", Sk.builtin.checkString(path));

    	rpc("image", 1, x.v, y.v, path.v);
    });

    mod.text = new Sk.builtin.func(function(x, y, string) {
        Sk.builtin.pyCheckArgs("text", arguments, 3, 3);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));

        // Don't check type of string argument. It can probably be just about anything.

    	rpc("text", 1, x.v, y.v, string.v);
    });

    mod.font = new Sk.builtin.func(function(font) {
        Sk.builtin.pyCheckArgs("font", arguments, 1, 1);
        Sk.builtin.pyCheckType("font", "string", Sk.builtin.checkString(font));

        rpc("font", 1, font.v);
    });

    mod.background = new Sk.builtin.func(function(path) {
        Sk.builtin.pyCheckArgs("background", arguments, 1, 1);
        Sk.builtin.pyCheckType("path", "string", Sk.builtin.checkString(path));

    	rpc("background", 1, path.v);
    });

    mod.clear = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("clear", arguments, 0, 0);

    	rpc("clear", 1);
    });

    mod.polygon = new Sk.builtin.func(function(vertices) {
        Sk.builtin.pyCheckArgs("polygon", arguments, 1, 1);
        Sk.builtin.pyCheckType("vertices", "list", Sk.builtin.checkSequence(vertices));

        for (var i in vertices.v.length) {
            var t = vertices.v[i];
            Sk.builtin.pyCheckType("vertex", "tuple", Sk.builtin.checkSequence(t));
        }

        var verts = Sk.ffi.remapToJs(vertices);

        for (var i in verts) {
            if (verts[i].length != 2)
                throw new Sk.builtin.Exception("Vertices must specify exactly 2 coordinates");
        }

        rpc("polygon", 1, verts);
    })

    mod.fill_polygon = new Sk.builtin.func(function(vertices) {
        Sk.builtin.pyCheckArgs("fill_polygon", arguments, 1, 1);
        Sk.builtin.pyCheckType("vertices", "list", Sk.builtin.checkSequence(vertices));

        for (var i in vertices.v.length) {
            var t = vertices.v[i];
            Sk.builtin.pyCheckType("vertex", "tuple", Sk.builtin.checkSequence(t));
        }

        var verts = Sk.ffi.remapToJs(vertices);

        for (var i in verts) {
            if (verts[i].length != 2)
                throw new Sk.builtin.Exception("Vertices must specify exactly 2 coordinates");
        }

        rpc("fillPolygon", 1, verts);
    })

    mod.test_polygon = new Sk.builtin.func(function(x,y, vertices) {
        Sk.builtin.pyCheckArgs("test_polygon", arguments, 3, 3);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));
        Sk.builtin.pyCheckType("vertices", "list", Sk.builtin.checkSequence(vertices));

        for (var i in vertices.v.length) {
            var t = vertices.v[i];
            Sk.builtin.pyCheckType("vertex", "tuple", Sk.builtin.checkSequence(t));
        }

        vertices = Sk.ffi.remapToJs(vertices);

        for (var i in vertices) {
            if (vertices[i].length != 2)
                throw new Sk.builtin.Exception("Vertices must specify exactly 2 coordinates");
        }
        x = x.v;
        y = y.v;

        var debug = false;

        // Return true if (x,y) is inside the polygon, otherwise false.

        // Test every edge of the polygon for intersection with the line of increasing x and constant y from (x,y)
        // Intersection test should be inclusive of start point, and exclusive of end point.

        var edges = [];
        for (var i = 0; i < vertices.length; i++) {

            var j = i + 1;

            if (j == vertices.length)
                j = 0;

            if (vertices[i][0] <= vertices[j][0]) {
                edges.push({
                    start: { x: vertices[i][0],   y: vertices[i][1]   },
                    end:   { x: vertices[j][0], y: vertices[j][1] },
                });
            } else {
                edges.push({
                    end:   { x: vertices[i][0],   y: vertices[i][1]   },
                    start: { x: vertices[j][0], y: vertices[j][1] },
                });
            }
        }

        // Count the number of edges that intersect the line.
        var crossedEdges = 0;

        for (var i in edges) {
            var e = edges[i];

            if (debug)
                console.log("Testing line of y= " + y + " from (" + x + ", " + y + ") with edge from (" + e.start.x + "," + e.start.y + ") to (" + e.end.x + "," + e.end.y + ")");
            
            // Are our endpoints on opposite sides of the line?
            // N.B. The inclusivity check here is switched depending on line direction. That works. Honest.

            if (e.start.y <= y && e.end.y > y ||
                e.end.y <= y && e.start.y > y) {

                if (debug)
                    console.log("Edge crosses line.")

                // This edge might cross the line. Find its intersection with the line

                if (e.start.x == e.end.x) {

                    if (debug)
                        console.log("Edge is vertical")
                    // The edge is vertical

                    var xCrossing = e.start.x;

                } else {

                    var edgeGradient = (e.end.y - e.start.y) / (e.end.x - e.start.x);

                    var edgeIntercept = e.end.y - edgeGradient * e.end.x;

                    // Now we have y = edgeGradient*x_ + edgeIntercept Need x_

                    var xCrossing = (y - edgeIntercept) / edgeGradient;

                }

                if (debug)
                    console.log("Intersection of y= " + y + " from (" + x + ", " + y + ") with edge from (" + e.start.x + "," + e.start.y + ") to (" + e.end.x + "," + e.end.y + ") is at x=" + xCrossing);

                if (xCrossing >= x) {
                    crossedEdges++;

                    if (debug)
                        console.log("CROSSED EDGE")
                }

            } else {
                // This edge doesn't cross the line. Do nothing.
            }
        }

        if (debug)
            console.log("Crossed edges: " + crossedEdges)

        // We are inside the polygon if we crossed an odd number of edges.
        return new Sk.builtin.bool(crossedEdges % 2 == 1);

    })

    mod.screen_width = Sk.builtin.nmber(params.screenWidth || 0);
    mod.screen_height = Sk.builtin.nmber(params.screenHeight || 0);

    return mod;
}
