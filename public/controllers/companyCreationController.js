angular.module('companyCreationController',[])

.controller('companyCreation',["$http", function($http){
	var _this = this;
	_this.modalHead = "";
	_this.modalBody = "";
	
	_this.addCompany = function(valid) {
		if(valid) {
			$http.post('/api/addCompany', _this.companyData)
			.then(function(res){
				if (res.data.success) {
					_this.modalHead = "Success";
					_this.modalBody = res.data.message;
				} else {
					_this.modalHead = "Oops";
					_this.modalBody = res.data.message;
					
				}
				return res;
			})
			.then(function(res){
				$('#companyCreationModal').modal({backdrop:"static"});
				_this.clearOut();
			});
		} else {
			_this.modalHead = "Failed";
			_this.modalBody = "All fields are Required";
			$('#companyCreationModal').modal({backdrop:"static"});
		}
	}

	_this.clearOut = function(){
		_this.companyData = {};
	}
}]);
