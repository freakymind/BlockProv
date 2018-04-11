angular.module('viewAssetsController', [])

.controller('viewAsset', ["$http","$location", function($http, $location){
	var _this = this;

	_this.loadme = false;

	_this.AssetsArray = [];

	_this.getAssetArray = function(){
		$http.get('/api/viewAssets')
		.then(function(res){
			if(res.data.success){
				_this.AssetsArray = res.data.Assets
				console.log(_this.AssetsArray)
				_this.loadme=true
			} else {

			}
		})
	}

	 _this.getAssetArray();

}]);