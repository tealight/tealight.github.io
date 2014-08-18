var $builtinmodule = function(name)
{
    var mod = {};

    var map = params.map;
    var state = JSON.parse(JSON.stringify(map.initialState));

    function canMoveTo(map, pos) {

        if (pos[0] < 0 || pos[1] < 0 || pos[0] >= map.size[0] || pos[1] >= map.size[1])
            return false;

    	for (var i in map.walls) {
	   		var w = map.walls[i];

            if (w[0] == pos[0] && w[1] == pos[1])
                return false;
	   	}

	   	return true;
    }

    function fruitIndex(state, pos) {
        for (var i in state.fruit) {
            var f = state.fruit[i];

            if (f[0] == pos[0] && f[1] == pos[1]) 
                return i;
        }
        return null;
    }

    function eatFruit(state) {
        var index = fruitIndex(state, state.pos);

        if (index)
            state.fruit.splice(index, 1);

        return index != null;
    }

    function angleToPosDelta(angle) {
        angle = (angle+4) % 4;
        var xDelta = 0;
        var yDelta = 0;
        switch(angle) {
            case 0:
                yDelta = -1;
                break;
            case 1:
                xDelta = 1;
                break;
            case 2:
                yDelta = 1;
                break;
            case 3:
                xDelta = -1;
                break;
        }

        return [xDelta, yDelta];
    }

    function getCellContent(map, state, pos) {
        if(!canMoveTo(map, pos))
            return "wall"; // This will include having walked off the edge of the map.

        if(fruitIndex(state, pos))
            return "fruit";

        return null;
    }
/*
    mod.chooseMap = new Sk.builtin.func(function(mapName) {
    	if (map)
    		throw new Error("Map already initialised. Cannot choose twice.");

    	map = maps[mapName.v];
        state = JSON.parse(JSON.stringify(map.initialState));

    	if (map) {

    		rpc("setMap", 0, map);

    	} else {

    		throw "Map does not exist";

    	}
    });
*/
    mod.move = new Sk.builtin.func(function() {
    	if (!map)
    		throw new Error("Cannot move - map not initialised.");

    	if (state.moves >= map.limit)
    		throw new OutOfMovesError(state);


        var delta = angleToPosDelta(state.angle)
        var newPos = [state.pos[0] + delta[0], state.pos[1] + delta[1]];

        if (canMoveTo(map, newPos)) {
            state.pos = newPos

            if (eatFruit(state))
                state.score += 1;

        }

        state.moves += 1;

        rpc("updateState", 1, JSON.parse(JSON.stringify(state)));


    });

    mod.turn = new Sk.builtin.func(function(steps) {
        if (!map)
            throw new Error("Cannot turn - map not initialised.");

        if (state.moves >= map.limit)
            throw new OutOfMovesError(state);

    	state.moves += 1;

    	state.angle = (state.angle + steps.v) % 4;

    	rpc("updateState", 1, JSON.parse(JSON.stringify(state)));
    });

    mod.look = new Sk.builtin.func(function() {
        var delta = angleToPosDelta(state.angle)

        var pos = state.pos;
        while(true) {
            pos = [pos[0] + delta[0], pos[1] + delta[1]];

            var content = getCellContent(map, state, pos);

            if (content)
                return Sk.builtin.str(content);
        }

        // Should never get here - maps should be surrounded with wall. But just in case.
        return Sk.builtin.str("wall");
    });

    // This differs from roboc, in that it only smells fruit. No-one ever used smell(Wall) anyway.
    mod.smell = new Sk.builtin.func(function() {
        var count = 0;
        for(var x = -2; x < 3; x++) {
            for(var y = -2; y < 3; y++) {
                if (fruitIndex(state, [state.pos[0] + x, state.pos[1] + y]))
                    count += 1;
            }
        }
        return count;
    });

    mod.touch = new Sk.builtin.func(function() {
        var delta = angleToPosDelta(state.angle)
        var pos = [state.pos[0] + delta[0], state.pos[1] + delta[1]];

        var c = getCellContent(map, state, pos);
        if(c)
            return Sk.builtin.str(c);
        else
            return Sk.builtin.none.none$;
    });

    mod.left_side = new Sk.builtin.func(function() {
        var delta = angleToPosDelta(state.angle-1)
        var pos = [state.pos[0] + delta[0], state.pos[1] + delta[1]];

        var c = getCellContent(map, state, pos);
        if(c)
            return Sk.builtin.str(c);
        else
            return Sk.builtin.none.none$;    });

    mod.right_side = new Sk.builtin.func(function() {
        var delta = angleToPosDelta(state.angle+1)
        var pos = [state.pos[0] + delta[0], state.pos[1] + delta[1]];

        var c = getCellContent(map, state, pos);
        if(c)
            return Sk.builtin.str(c);
        else
            return Sk.builtin.none.none$;    });

	
    return mod;
}