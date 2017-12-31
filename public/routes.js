angular.module('appRoutes', ["ngRoute"])

.config(function($routeProvider, $locationProvider){
  console.log("Router loaded");
  $routeProvider
  .when('/blockchain', {
    templateUrl : "./views/HomePage.htm"
  })
  .when('/blockchain/login', {
    templateUrl : "./views/Login.htm"
  })
  .when('/blockchain/signup', {
    templateUrl : "./views/SignUp.htm"
  })
  .when('/blockchain/about', {
    templateUrl : "./views/about.htm"
  });

  //https://scotch.io/tutorials/pretty-urls-in-angularjs-removing-the-hashtag#toc-setting-for-relative-links
  $locationProvider.html5Mode(true);

});
