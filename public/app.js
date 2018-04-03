angular.module('mainApp', ['viewAssetsController', 'approvedUsersController', 'appRoutes','mainController', 'userController', 'userRegService', 'authServices', 'managementController', 'managementServices', 'editUserDetailsController', 'assetCreationController', 'dashboardController','companyCreationController'])

.config(function($httpProvider) {
	$httpProvider.interceptors.push('authInterceptor');
  	console.log("App Loaded");
});
