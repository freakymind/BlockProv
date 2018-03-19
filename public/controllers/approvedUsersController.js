angular.module('approvedUsersController', [])

.controller('approvedUsers', ["$http", function($http){
	var _this = this
	_this.addApprovedUsers = function(users){
		$http.post('/api/addApprovedUserList', {newUserList : users})
		.then(function(res){
			console.log(res);
		});
	}

	_this.removeApprovedUsers = function(users){
		$http.post('/api/removeApprovedUserList', {newUserList : users})
		.then(function(res){
			console.log(res);
		});
	}
}]);
