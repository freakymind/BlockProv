angular.module('authServices', [])

.factory('authUser', ["$http", "tokenCheck", function($http, tokenCheck) {
  var authFactory={};

  authFactory.login = function(loginDetails){
    var promise = $http.post('/api/login', loginDetails);
    return promise;
  };

  authFactory.isLoggedIn = function() {
    if (tokenCheck.getToken()) {
      return true;
    } else {
      return false;
    }
  };

  authFactory.logout = function() {
    if (tokenCheck.getToken()) {
      tokenCheck.removeToken();
      return true;
    } else {
      return false;
    }
  };

  authFactory.getUser = function() {
    return $http.get('/api/getCurrentUser');
  };

  return authFactory;
}])

.factory('profileDetails', ["$http", "tokenCheck", function($http, tokenCheck) {
  var profileDetailsFactory = {};

  profileDetailsFactory.getAllDetails = function() {
    return $http.get('/api/getCurrentUserAllDetails');
  }

  return profileDetailsFactory;
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