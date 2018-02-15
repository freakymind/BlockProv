angular.module('dashboardController', [])

.controller('dashboardCtrl', ["$http", "$location",function($http, $location){
	var _this = this;

	_this.goTo = function(path){
		$location.path(path);
	};

}]);
