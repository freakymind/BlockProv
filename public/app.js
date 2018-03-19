angular.module('mainApp', ['approvedUsersController', 'appRoutes','mainController', 'userController', 'userRegService', 'authServices', 'managementController', 'managementServices', 'editUserDetailsController', 'assetCreationController', 'dashboardController'])

.config(function($httpProvider) {
	$httpProvider.interceptors.push('authInterceptor');
  	console.log("App Loaded");
});
