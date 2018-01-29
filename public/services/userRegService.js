angular.module('userRegService', [])

.factory('userFactory', ["$http", function($http){
	var UserReg = {}
	UserReg.register = function(regData) {
		return $http.post('/api/user', regData);
	}

	UserReg.fetchCountries = function() {
		return $http.get('/api/userRegCountries');
	}

	UserReg.checkUsername = function(username) {
		return $http.post('/api/checkUsername', username);
	}

	UserReg.checkEmail = function(emailId) {
		return $http.post('/api/checkEmail', emailId);
	}

	return UserReg;
}]);
