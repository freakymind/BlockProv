angular.module('managementServices', ['authServices'])

.factory('mgtService', ["$http", "tokenCheck", function($http, tokenCheck){
	var mgtFactory = {};

	mgtFactory.getCurrentUserRole =	function(){
		return $http.get('/api/getCurrentUserRole');
	}

	return mgtFactory;
}]);