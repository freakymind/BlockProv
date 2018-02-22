angular.module('assetCreationController', [])

.controller('assetCreation', ["$http", function($http){
	var _this = this;

	_this.assetCreationModal = {};
	
	_this.addAsset = function(valid) {
		if(valid) {
			$http.post('/api/addAsset', _this.assetData)
			.then(function(res){
				_this.assetData = {};
				_this.assetCreationModal = {
					title : "Success",
					body : "Asset is succesfully created"
				}
				$("#assetCreationModal").modal({backdrop: "static"});
			});
		} else {
			_this.assetCreationModal = {
				title : "Error",
				body : "Form is invalid, All fields are required."
			}
			$("#assetCreationModal").modal({backdrop: "static"});
		}
	}
}]);