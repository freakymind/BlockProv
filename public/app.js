angular.module('mainApp', ['primDistributorsController', 'viewAssetsController', 'approvedUsersController', 'appRoutes','mainController', 'userController', 'userRegService', 'authServices', 'managementController', 'managementServices', 'editUserDetailsController', 'assetCreationController', 'dashboardController','companyCreationController'])

.config(function($httpProvider) {
	$httpProvider.interceptors.push('authInterceptor');
  	console.log("App Loaded");
});
