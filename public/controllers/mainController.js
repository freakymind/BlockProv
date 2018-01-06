angular.module('mainController', ['authServices'])

.controller('mainCtrl',["$http", "$timeout", "$location", "authUser", "tokenCheck", function($http, $timeout, $location, authUser, tokenCheck){
	_this = this;

	//scope variables of mainController
	_this.message 			= ""
	_this.panelVisible 	= false;
	_this.loginDet 			= {};

	//check Session
	authUser.isLoggedIn();

	//signIn function
	_this.signIn = function() {
		authUser.login(_this.loginDet)
		.then(function(res){
			if (res.data.success) {
					_this.message = res.data.message + " redirecting .. ";
					tokenCheck.setToken(res.data.token);
					$timeout(function() {
							_this.loginDet 	= {};
							_this.message 	= "";
							$location.path('/');
					}, 2000);
			} else {
					_this.message 	= res.data.message;
					_this.loginDet 	= {};
			}
		})
	};

	_this.signOut = function() {
		if (authUser.logout()) {
			$timeout(function () {
				$location.path('/');
				console.log('logged Out');
			}, 2000);
		}
	};

}]);
