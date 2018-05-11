angular.module("assetProvDetailsController", [])
.controller('assetProvDetailsCtrl', ["$http", "$routeParams", function($http, $routeParams){

	var _this = this;

	_this.checkProvButtonClick = function(product_ref, companyName){
		$location.path("/assetProvDetails/" + product_ref + "/" + companyName)
	}

	_this.ownersArray=null;

	_this.checkAssetProvenance = function(){
		if($routeParams.product_ref != undefined && $routeParams.companyName != undefined && $routeParams.product_ref != "" && $routeParams.companyName != "") {
			$http.get('/api/getAssetId/' + $routeParams.product_ref + "/" + $routeParams.companyName)
			.then(function(res){
				if (res.data.success) {
					$http.get('/api/getTransHist/' + res.data.assetId)
					.then(function(res){
						_this.ownersArray = res.data.history;
					});

					_this.checkProv = "";
				}
			});
		}
	}
}]);