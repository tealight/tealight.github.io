var $builtinmodule = function(name)
{
    var mod = {};
	
    mod.sleep = new Sk.builtin.func(function(milliseconds) { // milliseconds will be a Sk.builtin.nmbr
		var startTime = Date.now();
		while (Date.now() < startTime + milliseconds.v) { /* spin */ }
    });

    mod.github_load = new Sk.builtin.func(function(repo_owner, path, name) {
		var http = new XMLHttpRequest();
		var url = "https://api.github.com/repos/" + repo_owner.v + "/tealight-files/contents/" + path.v + "?access_token=" + params.githubToken;

		http.open("GET", url, false);
		http.send(null);

		if (http.status == 200) {
			var py = atob(JSON.parse(http.responseText).content.replace("\n", ""));

			Sk.importModuleInternal_(name.v, false, undefined, py);
		} else {
			throw new Sk.builtin.Exception("Could not load " + path.v + " from Github user '" + repo_owner.v + "'");
		}
    })

	
    return mod;
}