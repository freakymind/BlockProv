angular.module('viewAssets', [])
.controller('viewAssetsController', function($http, $location){
	var _this = this;

	_this.AssetsArray = [];

	$http.get('/api/viewAssets')
	.then(function(res){
		_this.AssetsArray = res.data;
	});
});