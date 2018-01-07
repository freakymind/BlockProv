angular.module('mainController', ['authServices'])

.controller('mainCtrl',["$http", "$timeout", "$location", "$rootScope", "authUser", "tokenCheck", "profileDetails", function($http, $timeout, $location, $rootScope, authUser, tokenCheck, profileDetails){
	_this = this;

	//scope variables of mainController
	_this.message 				= ""			// post login message on the panel (on Login Page)
	_this.panelVisible 		= false;	// post login message panel	(on Login Page)
	_this.loginDet 				= {};			// login Details variable
	_this.isLoggedIn;								// boolean to check if a user is logged in
	_this.currentUserDet	= '';			// current Logged in user Details from session token
	_this.checkSession		= true;
	_this.currentUserFullDet = '';
	//check Session on route change
	$rootScope.$on('$routeChangeStart', function (next, last) {
			//checking if user logged in
			if (authUser.isLoggedIn()) {
				_this.isLoggedIn = true;
				console.log(_this.isLoggedIn);
				// checking session token
				authUser.getUser()
				.then(function(res) {
					if (res.data.success) {
						_this.currentUserDet = res.data.token;
					} else {
						//error conditions
					}
				});
			} else {
				_this.isLoggedIn = false;
			}
	});



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

	//signOut function
	_this.signOut = function() {
		if (authUser.logout()) {
			$timeout(function () {
				$location.path('/');
				console.log('logged Out');
			}, 2000);
		}
	};

	_this.getCurrentUserProfile = function() {
		profileDetails.getAllDetails()
		.then(function(res) {
			if(res.data.success) {
				_this.currentUserFullDet = res.data.user;
			}
		});
	}
}]);
