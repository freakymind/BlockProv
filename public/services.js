angular.module('userServices', [])

.factory('userFactory', ["$http", function($http){
	var UserReg = {}
	UserReg.register = function(regData) {
		return $http.post('/api/user', regData);
	}

	UserReg.fetchCountries = function() {
		return $http.get('/api/userRegCountries');
	}
	
	return UserReg;
}]);