angular.module('viewAssetsController', [])

.controller('viewAsset', ["$http","$location", function($http, $location){
	var _this = this;

	_this.loadme = false;
	_this.noErrorTxnHist = true;
	_this.AssetsArray = [];
	_this.AssetHist = [];
	_this.getAssetArray = function(){
		$http.get('/api/viewAssets')
		.then(function(res){
			if(res.data.success){
				_this.AssetsArray = res.data.Assets
				console.log(_this.AssetsArray)
				_this.addSequence(function(){
					_this.loadme=true;
				});
			} else {

			}
		})
	}

	_this.showHist = function(asset){
		console.log(asset.transactionId);
		$http.get('/api/getTransHist/' + asset.transactionId)
		.then(function(res){
			// console.log("hey")
			if(res.data.success){
				_this.AssetHist=res.data.history
				_this.noErrorTxnHist = true;
				console.log(_this.AssetHist)
			} else {
				_this.noErrorTxnHist = false;
			}
			return res;
		})
		.then(function(res){
			$('#txnHist').modal({backdrop:"static"});
		});
	}

	 _this.getAssetArray();


	 _this.addSequence = function(cb){
	 	var itr = 1;
	 	_this.AssetsArray.forEach(function(asset){
	 		asset.seqNo = itr++;
	 	})
	 	cb();
	 }

	 _this.gototransferAsset = function(asset){
	 	console.log(asset.assetID)
	 	$location.path('/assetTransfer/' + asset.assetdata.product_name+'/'+asset.transactionId)
	 }
}]);