angular.module('appRoutes', ["ngRoute"])

.config(function($routeProvider, $locationProvider){
  console.log("Router loaded");
  $routeProvider
  .when('/', {
    templateUrl : "./views/HomePage.htm"
  })
  .when('/login', {
    templateUrl : "./views/Login.htm"
  })
  .when('/signup', {
    templateUrl : "./views/SignUp.htm"
  })
  .when('/about', {
    templateUrl : "./views/about.htm"
  })
  .when('/successfulReg', {
    templateUrl : "./views/successfulReg.htm"
  });

  //https://scotch.io/tutorials/pretty-urls-in-angularjs-removing-the-hashtag#toc-setting-for-relative-links
  $locationProvider.html5Mode(true);

});
