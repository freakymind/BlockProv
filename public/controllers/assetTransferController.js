angular.module('assetTransferController',[])
.controller('assetTransCtrl',["$http","$routeParams", function($http, $routeParams){
	
	var _this = this;

	_this.assetId = $routeParams.name;

	_this.addDistributor = function(){
		_this.TransAsset.Transid = $routeParams.id;
		$http.post('/api/transferAsset',_this.TransAsset)
		.then(function(res){
			if(res.data.success){
				_this.TransAsset = {};
				console.log("success")
			}
			 else {
			 	console.log(res.data)
			 }

			/*_this.assetCreationModal = {
					title : "Success",
					body : "Asset is succesfully created"
				}
				$("#assetTransferModal").modal({backdrop: "static"});
			}

			else {
				_this.assetCreationModal = {
					title : "Error",
					body : "Form is invalid, All fields are required."
				}
				$("#assetTransferModal").modal({backdrop: "static"}); */
		})

	}
}])


