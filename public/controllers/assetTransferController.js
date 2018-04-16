angular.module('assetTransferController',[])
.controller('assetTransCtrl',["$http","$routeParams", function($http, $routeParams){
	
	var _this = this;

	_this.assetId = $routeParams.name;
	_this.distList = [];
	_this.bodyMessage = "";
	_this.titleMessage = "";


	_this.addDistributor = function(valid){
		if (valid) {
			_this.TransAsset.Transid = $routeParams.id;
			$http.post('/api/transferAsset', _this.TransAsset)
			.then(function(res){
				if(res.data.success){
					_this.bodyMessage = res.data.message
					_this.titleMessage = "Success"
				} else {
					_this.bodyMessage = res.data.message
					_this.titleMessage = "Oops"
				}		
				return res
			})
			.then(function(res){
				$("#assetTransferModal").modal({backdrop: "static"}); 
				_this.TransAsset = {};
			});
		} else {
			_this.bodyMessage = "All fields are required"
			_this.titleMessage = "Oops"
			$("#assetTransferModal").modal({backdrop: "static"});
		}
	};

	_this.loadAllDistributors = function() {
		$http.get('/api/allDistributorsForAUser')
		.then(function(res){
			console.log(res.data);
			if (res.data.success) {
				res.data.PrimDists.forEach(function(PD){
					_this.distList.push(PD.PrimDistributorID);
				});
			}
		});
	};

}]);


