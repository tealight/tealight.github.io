var $builtinmodule = function(name)
{
    var mod = {};
    var startTime = Date.now();
	
    mod.sleep = new Sk.builtin.func(function(milliseconds) { // milliseconds will be a Sk.builtin.nmbr
		var startTime = Date.now();
		while (Date.now() < startTime + milliseconds.v) { /* spin */ }
    });

    mod.now = new Sk.builtin.func(function() {
    	return new Sk.builtin.nmber(Date.now() / 1000.0);
    })

    mod.age = new Sk.builtin.func(function() {
    	return new Sk.builtin.nmber((Date.now() - startTime) / 1000.0)
    })
	
    return mod;
}