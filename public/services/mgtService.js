angular.module('managementServices', ['authServices'])

.factory('mgtService', ["$http", "tokenCheck", function($http, tokenCheck){
	var mgtFactory = {};
	
	//get all users
	mgtFactory.getAllUsers = function(){
		return $http.get('/api/getAllUsers');
	}

	mgtFactory.deleteUser = function(id) {
		return $http.delete('api/deleteUser/'+ id)
	}
	return mgtFactory;
}]);