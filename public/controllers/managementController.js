angular.module('managementController', ['authServices', 'managementServices'])

.controller('mgtCtrl', ["$http", "tokenCheck", "mgtService", function($http, tokenCheck, mgtService){
	
	console.log('mgtCtrl loaded');

	mgtService.getCurrentUserRole()
	.then(function(res){
		console.log(res.data);
	});
}]);