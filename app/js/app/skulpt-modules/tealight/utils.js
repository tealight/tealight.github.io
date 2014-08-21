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

    mod.github_load = new Sk.builtin.func(function(repo_owner, mode, file) {
        var http = new XMLHttpRequest();
        var url = "https://api.github.com/repos/" + repo_owner.v + "/tealight-files/contents/" + mode.v + "/" + file.v + ".py?access_token=" + params.githubToken;

        http.open("GET", url, false);
        http.send(null);

        if (http.status == 200) {
            var py = atob(JSON.parse(http.responseText).content.replace("\n", ""));

            return Sk.importModuleInternal_(file.v, false, undefined, py);
        } else {
            throw new Sk.builtin.Exception("Could not load " + mode.v + "/" + file.v + " from Github user '" + repo_owner.v + "'");
        }
    })
	
    return mod;
}