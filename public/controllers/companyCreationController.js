angular.module('companyCreationController',[])

.controller('companyCreation',["$http", function($http){
	var _this = this;

	_this.addCompany = function() {
		$http.post('/api/addCompany', _this.companyData)
		.then(function(res){
			console.log(res.data);
		});
	}
}]);