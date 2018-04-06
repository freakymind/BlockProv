angular.module('primDistributorsController', [])

.controller('primDist', ["$http", function($http){
	var _this = this;

	_this.addPrimDistributor = function(user) { 
		$http.post('/api/addPrimDistributor', {DistId : user})
		.then(function(res){
			_this.clearOut();
			
			if(res.data.success){
				_this.primDistHeader = "Success"
				_this.primDistMessage = res.data.message
				$('#primDistModal').modal({backdrop:"static"});
			} else { 
				_this.primDistHeader = "Oops"
				_this.primDistMessage = res.data.message
				$('#primDistModal').modal({backdrop:"static"});
			}
		})
	}

	_this.clearOut = function(){
		_this.primDistUsersAdd = "";
	}
}]);