var $builtinmodule = function(name)
{
    var mod = {};

    var maps = {
    	"apples": {

            size: [100,100],

    		walls: [
                [0,10],
                [1,10],
                [2,10],
                [3,10],
                [4,10],
                [5,10],
                [6,10],
            ],

            limit: 400,

            target: 1,

            wallIcon: "foo",

            fruitIcon: "bar",

            initialState: {
                fruit: [
                    [3,7],
                ],
                pos: [0, 0],
                angle: 0,
                moves: 0,
                score: 0,
            }
    	}
    };

    var map = null;
    var state = null;

    function canMoveTo(map, pos) {

    	for (var i in map.walls) {
	   		var w = map.walls[i];

            if (w[0] == pos[0] && w[1] == pos[1])
                return false;
	   	}

	   	return true;
    }

    function eatFruit(state, pos) {

        for (var i in state.fruit) {
            var f = state.fruit[i];

            if (f[0] == pos[0] && f[1] == pos[1]) {
                state.fruit.splice(i,1);
                return true;
            }
        }
        return false;
    }

    mod.chooseMap = new Sk.builtin.func(function(mapName) {
    	if (map)
    		throw new Error("Map already initialised. Cannot choose twice.");

    	map = maps[mapName.v];
        state = JSON.parse(JSON.stringify(map.initialState));

    	if (map) {

    		rpc("setMap", map);

    	} else {

    		throw "Map does not exist";

    	}
    });

    mod.move = new Sk.builtin.func(function() {
    	if (!map)
    		throw new Error("Cannot move - map not initialised.");

    	if (state.moves >= map.limit)
    		throw new OutOfMovesError();


    	var newPos = null;
    	switch(state.angle) {
    		case 0:
    			newPos = [state.pos[0], state.pos[1] - 1];
    			break;
    		case 1:
    			newPos = [state.pos[0] + 1, state.pos[1]];
    			break;
    		case 2:
    			newPos = [state.pos[0], state.pos[1] + 1];
    			break;
    		case 3:
    			newPos = [state.pos[0] - 1, state.pos[1]];
    			break;
    	}

        if (canMoveTo(map, newPos)) {
            state.pos = newPos
            state.moves += 1;

            if (eatFruit(state, newPos))
                state.score += 1;

            rpc("updateState", state);
        }


    });

    mod.turn = new Sk.builtin.func(function(steps) {
    	if (state.moves >= map.limit)
    		throw "Run out of moves. Terminating.";

    	state.moves += 1;

    	state.angle = (state.angle + steps.v) % 4;

    	rpc("updateState", state);
    });
	

	
    return mod;
}