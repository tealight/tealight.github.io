var $builtinmodule = function(name)
{
    var mod = {};
	
    mod.sleep = new Sk.builtin.func(function(milliseconds) { // milliseconds will be a Sk.builtin.nmbr
		var startTime = Date.now();
		while (Date.now() < startTime + milliseconds.v) { /* spin */ }
    });

	
    return mod;
}