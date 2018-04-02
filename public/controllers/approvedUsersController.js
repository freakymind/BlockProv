angular.module('approvedUsersController', [])

.controller('approvedUsers', ["$http", function($http){
	var _this = this
	_this.approvedUsersHeader = "";
	_this.approvedUsersMessage= "";

	_this.addApprovedUsers = function(users){
		$http.post('/api/addApprovedUserList', {newUserList : users})
		.then(function(res){
			_this.clearout();
			if (res.data.success) {
				_this.approvedUsersHeader = "Success"
				_this.approvedUsersMessage = res.data.message
				$('#approvedUsersModal').modal({backdrop:"static"});
			} else {
				_this.approvedUsersHeader = "Oops"
				_this.approvedUsersMessage = res.data.message
				$('#approvedUsersModal').modal({backdrop:"static"});
			}
		});
	}

	_this.removeApprovedUsers = function(users){
		$http.post('/api/removeApprovedUserList', {newUserList : users})
		.then(function(res){
			console.log(res);
		});
	}

	_this.clearout = function() {
		_this.UserListAdd = "";
	}
}]);
