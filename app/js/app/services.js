'use strict';
define(["angular"], function() {

	/* Services */


	// Demonstrate how to register services
	// In this case it is a simple value service.
	angular.module('tealight.services', [])

	.value('version', '0.1')

	.service('LoginChecker', ["$rootScope", "$location", function($rootScope, $location) {

		$rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
			if (rejection == "unauthorized") {
				var url = $location.url();
				console.warn("Login required for", url, ". Redirecting to /login.");
				$location.url("/login");
				$location.search("target", url);
			}
		});

		this.requireLogin = function() {
			return $rootScope.userProfile ? Promise.resolve() : Promise.reject("unauthorized");
		};
	}])

	.service('TealightFilesChecker', ["$rootScope", "$location", "github", function($rootScope, $location, github) {

		$rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
			if (rejection == "tealightFilesMissing") {
				console.error("Tealight files repo is missing.");
			}
		});

		function waitForRepo(repoOwner, repoName, timeoutSecs) {
			return new Promise(function(resolve, reject){
			    var recheckRepo = function()
			    {
			        // Every 1 sec, check whether repo exists
			        var r = github.getRepo(repoOwner, repoName).then(function()
			        {
			            // It exists
			            console.log("Repo created successfully");
			            resolve();
			        }).catch(function()
			        {
			            // If not, wait another second.
			            console.log("Repo still doesn't exist. Waiting...");
			            if (timeoutSecs > 0)
			            {
			            	// *Now* it exists.
			                timeoutSecs -= 1;
			                setTimeout(recheckRepo, 1000);
			            }
			            else
			            {
			                // Timeout expired
			                console.error("Timeout expired waiting for repo fork.");
			                reject("Timeout expired");
			            }
			        });
			    }

			    // Force this to take long enough for the dialog to appear.
			    setTimeout(recheckRepo, 3000);
			});
		}

		this.requireTealightFiles = function() {
			return new Promise(function(resolve, reject) {
				//$rootScope.userProfile ? Promise.resolve() : Promise.reject("tealightFilesMissing");
				github.getRepo(github.user.login, "tealight-files").then(function(r) {
					console.log("User already has tealight-files repo.")
					resolve();
				}).catch(function() {

					// User does not already have tealight-files repo.
			        // Fork from tealight/tealight-files
			        console.log("Could not find tealight-files repo. Forking");
			        github.forkRepo("tealight", "tealight-files").then(function(e)
			        {
			            console.log("Started forking tealight-files");

			            // Wait for fork to be completed
			            waitForRepo("tealight", "tealight-files", 10).then(function()
			            {
			                console.log("tealight-files repo forked successfully.");
			                resolve();
			            }).catch(function(ev)
			            {
			                console.error("Timeout while waiting for tealight-files fork to become available");
			                reject("Timeout while forking");
			            });
			        }).catch(function(e)
			        {
			            console.error("Could not fork tealight-files", e);
			            reject("tealightFilesMissing");
			        });
				});
			});
		};
	}])

	.service('Missions', ["$http", function($http) {

		function parseMap(mapStr) {
			var walls = [];
			var fruit = [];
			var lines = mapStr.split("\n");

			for(var y in lines) {
				for(var x in lines[y]) {
					y = parseInt(y);
					x = parseInt(x);
					switch(lines[y][x]) {
						case "#":
							walls.push([x,y]);
							break;
						case "o":
							fruit.push([x,y]);
							break;
					}
				}
			}

			return {
				size: [x+1,y],
				walls: walls,
				fruit: fruit
			};
		}
		this.missions = {};
		var self = this;
		this.load = new Promise(function(resolve, reject) {
			$http.get("assets/missions/index.json").success(function(missions) {

				var loadPs = [];
				for(var i in missions) {
					var m = missions[i];

					var loadP = new Promise(function(rsv, rej) {
						$http.get("assets/missions/" + m.mapFile).success((function(m) { return function(mapFile) {

								var mapData = parseMap(mapFile);
								m.walls = mapData.walls;
								m.size = mapData.size;
								m.initialState.fruit = mapData.fruit;
								m.initialState.angle = ["N", "E", "S", "W"].indexOf(m.initialState.angle);
								m.initialState.moves = 0;
								m.initialState.score = 0;
								self.missions[m.name] = m;
								rsv();
							}
						})(m));
					});

					loadPs.push(loadP);

				}

				Promise.all(loadPs).then(function() {
					resolve(missions);					
				});
			});
		});

	}]);
});
