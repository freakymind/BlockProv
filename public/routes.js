var app = angular.module('appRoutes', ["ngRoute", "authServices"])

.config(function($routeProvider, $locationProvider){
  console.log("Router loaded");
  $routeProvider
  .when('/', {
    templateUrl : "./views/HomePage.htm"
  })
  .when('/login', {
    templateUrl : "./views/Login.htm",
    authenticated : false
  })
  .when('/signup', {
    templateUrl : "./views/SignUp.htm",
    authenticated : false
  })
  .when('/about', {
    templateUrl : "./views/about.htm"
  })
  .when('/successfulReg', {
    templateUrl : "./views/successfulReg.htm",
    authenticated : false
  })
  .when('/loggingOut', {
    templateUrl : "./views/loggingOut.htm",
    authenticated : true
  })
  .when('/profile', {
    templateUrl : "./views/profile.htm",
    authenticated : true
  })
  .when('/dashboard', {
    templateUrl : "./views/dashboard.htm"
  });

  //https://scotch.io/tutorials/pretty-urls-in-angularjs-removing-the-hashtag#toc-setting-for-relative-links
  $locationProvider.html5Mode(true);

});

app.run(['$rootScope', 'authUser', '$location', function($rootScope, authUser, $location) {
  $rootScope.$on('$routeChangeStart', function (event, next, last) {
    // console.log(authUser.isLoggedIn());
    // console.log(next.$$route);
    if (next.$$route.authenticated == true) {
      if (!authUser.isLoggedIn()) {
        event.preventDefault();
        $location.path('/');
      }
    } else if (next.$$route.authenticated == false) {
      if (authUser.isLoggedIn()) {
        event.preventDefault();
        $location.path('/profile');
      }
    }
  });
}]);