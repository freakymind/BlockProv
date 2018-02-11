angular.module('mainController', ['authServices', 'managementServices'])


.controller('mainCtrl',["$route", "$window", "$http", "$timeout", "$location", "$rootScope", "authUser", "tokenCheck", "profileDetails", "$interval", "mgtService",
	function($route, $window, $http, $timeout, $location, $rootScope, authUser, tokenCheck, profileDetails, $interval, mgtService){
	
	var _this = this;

	//scope variables of mainController
	_this.message = ""			// post login message on the panel (on Login Page)
	_this.loginDet = {};		// login Details variable
	_this.isLoggedIn;			// boolean to check if a user is logged in
	_this.currentUserDet = '';		// current Logged in user Details from session token
	_this.currentUserFullDet = ''; 	// populated by getCurrentUserProfile()
	_this.loadme = true;			// loading the page once all the information is fetched
	_this.isCheckingSession = false;
	_this.isAdmin = false;			// if user is admin or not

	// Bootstrap Modal related data
	_this.titleMessage = "";
	_this.bodyMessage = "";
	_this.modalBehaviour = false;
	_this.modalCloseBouttonLabel = "";
	
	//for changing routes on button click
	_this.switchRoute = function(path) {
		$location.path(path);
	}

	//function to check whether a user is logged in / session is there logging out user when token expires
	_this.checkSession = function() {

		//variable holds true if a session checking function instance is running
		_this.isCheckingSession = true;
		var interval = $interval( function() {
			var token = tokenCheck.getToken();
			if (token == null) {
				console.log('no token');
				$interval.cancel(interval);
			} else {
				//parsing jwt token
				self.parseJwt = function(token) {
				  var base64Url = token.split('.')[1];
				  var base64 = base64Url.replace('-', '+').replace('_', '/');
				  return JSON.parse($window.atob(base64));
				}
				var expireTime = self.parseJwt(token);
				var timestamp = Math.floor(Date.now()/1000);
				console.log(timestamp);
				if ((expireTime.exp - timestamp) <= 0) {	
					_this.showModal(1);
					$interval.cancel(interval);
				}
			}

		}, 2000);
	}

	//shows the #myModal Modal
	_this.showModal = function(value) {
		if (value == 1) { // modal for expired session
			_this.titleMessage = "Your session is expired !";
			_this.bodyMessage = "Do you want to refresh your session ?";
			_this.modalBehaviour = true;
			_this.modalFirstRefreshButton = "Refresh"
			_this.modalSecondButton = "Cancel";
			$("#myModal").modal({backdrop: "static"});
		} else if (value == 2) { // modal for logout button click
			_this.titleMessage = "Logging Out";
			_this.bodyMessage = "Are you sure you want to log out ?";
			_this.modalBehaviour = false;
			_this.modalFirstNoButton = "No";
			_this.modalSecondButton = "Yes, I am sure";
			$("#myModal").modal({backdrop: "static"});
		}
	}

	//cancel button functionality of #myModal
	_this.cancelButtonModal = function() {
		_this.signOut();
		_this.isLoggedIn = false;
	}

	//refresh button functionality of #myModal
	_this.refreshButton = function() {
		authUser.refreshSession(_this.currentUserDet.username)
		.then(function(res){
			if(res.data.success){
				tokenCheck.setToken(res.data.token);
				_this.checkSession();
			} else {
				console.log(res.data.message);
				_this.signOut();
			}
		});
	}

	//signIn function
	_this.signIn = function(valid) {
		if (valid) {

			//sign in function in the authService
			authUser.login(_this.loginDet)
			.then(function(res){
				if (res.data.success) {
					_this.message = res.data.message + " redirecting .. ";
					
					//setting jwt token recieved from the server in the browser memory 
					tokenCheck.setToken(res.data.token);
					$timeout(function() {
						_this.loginDet 	= {};
						_this.message 	= "";
						
						$location.path('/');
						_this.checkSession();
						mgtService.getCurrentUserRole()
						.then(function(res){
							if(res.data.role == "admin") {
								_this.isAdmin = true;
							} else {
								_this.isAdmin = false;
							}
						})
					}, 2000);
				} else {
					_this.message 	= res.data.message;

					//clear out login form fields
					_this.loginDet 	= {};
				}
			});
		}
	};

	//signOut function
	_this.signOut = function() {
		//logout function to remove the user jwt token from browser memory if present
		if (authUser.logout()) {
			$location.path('/');
			console.log('logged Out');
		}
	};


	//function to get all user details for profile view
	_this.getCurrentUserProfile = function() {
		profileDetails.getCurrentUserAllDetails()
		.then(function(res) {
			if(res.data.success) {
				_this.currentUserFullDet = res.data.user;
			}
		});
	}

	//check Session on route change
	$rootScope.$on('$routeChangeStart', function (next, last) {
			
			//if get user details if route is set to profile
			if($location.path() == '/profile'){
				_this.getCurrentUserProfile();
			}				


			//checking if user logged in
			if (authUser.isLoggedIn()) {

				//checking if the interval function for checking session is running 
				if(!_this.isCheckingSession) {
					_this.checkSession();
					console.log('interval function was not running');
				} else {
					console.log('interval function already running');
				}
				

				//used on frontend for navbar display toggle of login/logout links
				_this.isLoggedIn = true; 

				// getting user details from jwt token
				authUser.getCurrentUser()
				.then(function(res) {
					
					if (res.data.success) {
						_this.currentUserDet = res.data.token;
						if (_this.currentUserDet.role == "admin"){
							_this.isAdmin = true;
						} else {
							_this.isAdmin = false;
						}
					}

					// loads the page once all the data is present
					_this.loadme = true;
				});
			
			} else {
				_this.isLoggedIn = false;	
				_this.loadme = true;
			}

	});
}]);
