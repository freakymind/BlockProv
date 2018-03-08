angular.module('assetCreationController', [])

.controller('assetCreation', ["$http", function($http){
	console.log('heyy asset creation');
	var _this = this;

	_this.addAsset = function() {
		$http.post('/api/addAsset', _this.assetData)
		.then(function(res){
			var bigchain= require(path.join(__dirname, '/bigchain.js'))
			module.exports = {dataForBigchain : res.data};
			bigchain.bigchain(function(err,res){
				console.log(res);
			});
			console.log(res.data);
		});

	}





}]);