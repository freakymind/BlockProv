angular.module('mainApp', ['appRoutes','mainController', 'userController', 'userRegService', 'authServices'])

.config(function() {
    console.log("App Loaded");
});
