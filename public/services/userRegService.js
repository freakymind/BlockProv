angular.module('userRegService', [])

.factory('userFactory', ["$http", function($http){
	var UserReg = {}

	//user Signup
	UserReg.register = function(regData) {
		return $http.post('/api/user', regData);
	}

	//fetching all countries
	UserReg.fetchCountries = function() {
		return $http.get('/api/userRegCountries');
	}

	//check if username exist
	UserReg.checkUsername = function(username) {
		return $http.post('/api/checkUsername', username);
	}

	//check if email exists
	UserReg.checkEmail = function(emailId) {
		return $http.post('/api/checkEmail', emailId);
	}

	//get a user using id
	UserReg.getUserByID = function(id) {
		return $http.get('/api/getUserByID/' + id);
	}

	//update user fullname by id
	UserReg.updateUserFullNameByID = function(id, fullname) {
		return $http.put('/api/updateUserDetailsByID', {id: id, fullname: fullname})
	}

	//update user address by id
	UserReg.updateUserAddressByID = function(id, address, country) {
		return $http.put('/api/updateUserDetailsByID', {id: id, address:address, country:country})
	}

	//update user phone by id
	UserReg.updateUserPhoneByID = function(id, phone_no) {
		return $http.put('/api/updateUserDetailsByID', {id: id, phone_no: phone_no})
	}

	//update user role by id
	UserReg.updateUserRoleByID = function(id, role) {
		return $http.put('/api/updateUserDetailsByID', {id: id, role: role})
	}
	return UserReg;
}]);
