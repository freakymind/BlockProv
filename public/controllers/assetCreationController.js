angular.module('assetCreationController', [])

.controller('assetCreation', ["$http", function($http){
	console.log('heyy asset creation');
	var _this = this;

	_this.addAsset = function() {
		$http.post('/api/addAsset', _this.assetData)
		.then(function(res){
			console.log(res.data);
		});

	}


}]);