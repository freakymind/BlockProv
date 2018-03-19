var app = angular.module('appRoutes', ["ngRoute", "authServices", "managementServices"])

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
    templateUrl : "./views/Dashboard.htm",
    authenticated : true
  })
  .when('/management', {
    templateUrl : "./views/management.htm",
    authenticated : true, 
    permissions : ["admin"]
  })
  .when('/editUserDetailsMgt/:id', {
    templateUrl : "./views/editUserDetailsMgt.htm",
    authenticated : true, 
    permissions : ["admin"]
  })
  .when('/assetCreation', {
    templateUrl : "./views/assetCreation.htm",
    authenticated : true
  })
  .when('/twoFactorSetup', {
    templateUrl : "./views/twoFactorSetup.htm",
    authenticated : true,
    permissions : ["admin"]
  })

  .when('/addApprovedUsers', {
    templateUrl : "./views/addApprovedUsers.htm",
    authenticated : true,
    permissions : ["admin"]
  })
  
  .when('/companyCreation', {
    templateUrl : "./views/companyCreation.htm",
    authenticated : true,
    permissions : ["admin"]
  });

  //https://scotch.io/tutorials/pretty-urls-in-angularjs-removing-the-hashtag#toc-setting-for-relative-links
  $locationProvider.html5Mode(true);

});

app.run(['$rootScope', 'authUser', '$location', 'mgtService', function($rootScope, authUser, $location, mgtService) {
  $rootScope.$on('$routeChangeStart', function (event, next, last) {

    if (next.$$route.authenticated == true) {
      if (!authUser.isLoggedIn()) {
        event.preventDefault();
        $location.path('/');
      } else if (authUser.isLoggedIn() && next.$$route.permissions) {
        authUser.getCurrentUserRole()
        .then(function(res){
          if (next.$$route.permissions.find(function(permission){
            return permission == res.data.role;
          }) == undefined) {
            event.preventDefault();
            $location.path('/');
          } 
        });
      }
    } else if (next.$$route.authenticated == false) {
      if (authUser.isLoggedIn()) {
        event.preventDefault();
        $location.path('/profile');
      }
    }
  });
}]);