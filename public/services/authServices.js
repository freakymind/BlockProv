angular.module('authServices', [])

.factory('authUser', ["$http", "tokenCheck", function($http, tokenCheck){
  var authFactory={};
  authFactory.login = function(loginDetails){
    console.log('in factory')
    var promise = $http.post('/api/login', loginDetails);
    return promise;
  }

  authFactory.isLoggedIn = function() {
    if (tokenCheck.getToken()) {
      console.log('user is logged in');
    } else {
      console.log('no user logged in');
    }
  }

  authFactory.logout = function() {
    if (tokenCheck.getToken()) {
      tokenCheck.removeToken();
      return true;
    } else {
      return false;
    }
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
}]);
