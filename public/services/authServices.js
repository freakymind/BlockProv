angular.module('authServices', [])

.factory('authUser', ["$http", "tokenCheck", function($http, tokenCheck){
  var authFactory={};

  authFactory.login = function(loginDetails){
    console.log('in factory')
    var promise = $http.post('/api/login', loginDetails);
    return promise;
  };

  authFactory.isLoggedIn = function() {
    if (tokenCheck.getToken()) {
      console.log('user is logged in' + tokenCheck.getToken());
      return true;
    } else {
      console.log('no user logged in');
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
    return $http.post('/api/getCurrentUser', {token:tokenCheck.getToken()});
  }

  return authFactory;
}])



.factory('profileDetails', ["$http", "tokenCheck", function($http, tokenCheck) {
  var profileDetailsFactory = {};

  profileDetailsFactory.getAllDetails = function() {
    return $http.post('/api/getCurrentUserAllDetails', {token:tokenCheck.getToken()});
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
}]);
