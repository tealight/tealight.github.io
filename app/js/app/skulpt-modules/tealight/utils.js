var $builtinmodule = function(name)
{
    var mod = {};
    var startTime = Date.now();
	
    mod.sleep = new Sk.builtin.func(function(milliseconds) { // milliseconds will be a Sk.builtin.nmbr
        Sk.builtin.pyCheckArgs("sleep", arguments, 1, 1);
        Sk.builtin.pyCheckType("milliseconds", "number", Sk.builtin.checkNumber(milliseconds));

		var startTime = Date.now();
		while (Date.now() < startTime + milliseconds.v) { /* spin */ }
    });

    mod.now = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("sleep", arguments, 0, 0);

    	return new Sk.builtin.nmber(Date.now() / 1000.0);
    })

    mod.age = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("sleep", arguments, 0, 0);

    	return new Sk.builtin.nmber((Date.now() - startTime) / 1000.0)
    })
	
    return mod;
}