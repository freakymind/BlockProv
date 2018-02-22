angular.module('managementController', ['authServices', 'managementServices'])

.controller('mgtCtrl', ["$http", "tokenCheck", "mgtService", "$location", "authUser", function($http, tokenCheck, mgtService, $location, authUser){
	
	console.log('mgtCtrl loaded');
	var _this = this;

	_this.loadme = false;
	_this.userAllDetails;
	_this.userToBeDeleted;
	
	//deleting a user from db with id provided
	_this.deleteUser = function(id){
		console.log(id);
		mgtService.deleteUser(id)
		.then(function(res){
			console.log(res);
			mgtService.getAllUsers()
			.then(function(res){
				_this.userAllDetails = res.data.users;
				_this.loadme = true;
			});
		});

	}

	//shows the deleteing user modal when delete button is clicked
	_this.deleteThisUser = function(user){
		_this.userToBeDeleted = user;
		$("#deleteUserModal").modal({backdrop: "static"});
	}

	_this.gotoEditRoute = function(user) {
		$location.path('/editUserDetailsMgt/'+user._id);
	}

	//gets current user Role
	authUser.getCurrentUserRole()
	.then(function(res){
		console.log(res.data);
	});

	//gets All users and populates in userAllDetails
	mgtService.getAllUsers()
	.then(function(res){
		_this.userAllDetails = res.data.users;
		_this.loadme = true;
	});


	
}]);