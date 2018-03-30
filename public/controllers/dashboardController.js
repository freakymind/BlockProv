angular.module('dashboardController', ['managementServices', 'authServices'])

.controller('dashboardCtrl', ["$http", "$location", 'mgtService', 'authUser', function($http, $location, mgtService, authUser){
	var _this = this;

	_this.goTo = function(path){
		$location.path(path);
	};

	_this.currentUserRole = "";

	authUser.getCurrentUserRole()
	.then(function(res){
		_this.currentUserRole = res.data.role;
	});

	_this.viewAssets = function(){
		$http.get('/api/viewAssets')
		.then(function(res){
			console.log(res.data);
		});
	}
}]);
