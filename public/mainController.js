angular.module('mainController', [])

.controller('mainCtrl',["$http", function($http){
	_this = this;

	_this.validate = function(loginDet) {
		$http.post('/api/login', loginDet)
		.then(function(res){
			console.log(res.data);
		})
	};

}]);