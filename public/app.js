angular.module('mainApp', ['appRoutes','mainController', 'userController', 'userRegService', 'authServices', 'managementController', 'managementServices'])

.config(function($httpProvider) {
	$httpProvider.interceptors.push('authInterceptor');
  	console.log("App Loaded");
});
