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
				size: [x,y],
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
