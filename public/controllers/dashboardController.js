angular.module('dashboardController', ['managementServices'])

.controller('dashboardCtrl', ["$http", "$location", 'mgtService', function($http, $location, mgtService){
	var _this = this;

	_this.goTo = function(path){
		$location.path(path);
	};

	_this.currentUserRole = "";

	mgtService.getCurrentUserRole()
	.then(function(res){
		_this.currentUserRole = res.data.role;
	});

}]);
