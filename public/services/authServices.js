angular.module('authServices', [])

.factory('authUser', ["$http", "tokenCheck", function($http, tokenCheck) {
  var authFactory={};

  //to call the login api for logging in the user
  authFactory.login = function(loginDetails){
    var promise = $http.post('/api/login', loginDetails);
    return promise;
  };

  //returning boolean if user is logged in by checking token
  authFactory.isLoggedIn = function() {
    if (tokenCheck.getToken()) {
      return true;
    } else {
      return false;
    }
  };

  //logging out the user by removing the token from browser local storage
  authFactory.logout = function() {
    if (tokenCheck.getToken()) {
      tokenCheck.removeToken();
      return true;
    } else {
      return false;
    }
  };

  //getting current user that is logged in
  authFactory.getCurrentUser = function() {
    return $http.get('/api/getCurrentUser');
  };

  //getting the current user role
  authFactory.getCurrentUserRole = function(){
    return $http.get('/api/getCurrentUserRole');
  }

  //getting all user details of the current user 
  authFactory.getCurrentUserAllDetails = function() {
    return $http.get('/api/getCurrentUserAllDetails');
  }

  //refreshing the session of the current user
  authFactory.refreshSession = function(username) {
    return $http.get('/api/refreshSession/' + username);
  }

  //getting 2FA setup details of the user 
  authFactory.getSetup2FADetails = function(username) {
    return $http.get('/api/setup2FA/' + username);
  }

  // 2FA for the current user
  authFactory.setup2FA = function() {
    return $http.post('/api/setup2FA');
  }

  // 2FA setup VERIFICATION for the current user
  authFactory.verify2FA = function(TOTP) {
    return $http.post('/api/verify2FA', {twoFactAuthToken:TOTP});
  }

  //disabling the 2FA for the current user
  authFactory.disable2FA = function() {
    return $http.delete('/api/disable2FA');
  }

  return authFactory;
}])

.factory('tokenCheck', ["$window", function($window){
  var tokenCheckFactory = {};

  tokenCheckFactory.getToken = function() {
    return $window.localStorage.getItem('token');
  };

  tokenCheckFactory.setToken = function(token) {
    return $window.localStorage.setItem('token', token);
  };

  tokenCheckFactory.removeToken = function() {
    return $window.localStorage.removeItem('token');
  };

  return tokenCheckFactory;
}])

.factory('authInterceptor', ["tokenCheck", function(tokenCheck){
  var authInterceptorFactory = {};

  authInterceptorFactory.request = function(config) {
    var token = tokenCheck.getToken();

    if (token) config.headers['x-access-token'] = token;
    return config;
  } 

  return authInterceptorFactory;
}]);