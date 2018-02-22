angular.module('editUserDetailsController', ['userRegService'])
.controller('editUserCtrl', ["$http", "userFactory", "$location", "$routeParams", function($http, userFactory, $location, $routeParams){

	var _this = this;
	var tabs = ['fullname', 'address', 'phone_no', 'role'];
	_this.tabDisplay = {
		fullname : true,
		address : false,
		phone_no : false,
		role: false
	};

	_this.userToBeEdited = {};
	
	//function to toggle between the tabs
	_this.toggle = function(idx){
		angular.forEach(tabs, function(tabName){
			_this.tabDisplay[tabName] = false;
		});
		
		_this.tabDisplay[idx] = true;
	}

	_this.updateUserFullName = function(valid){
		if (valid) {
			userFactory.updateUserFullNameByID($routeParams.id, _this.changedValues.fullname)
			.then(function(res){
				console.log(res);
				_this.showModal(2);
			});
		} else {
			_this.showModal(1);
		}
	}

	_this.updateUserPhone = function(valid){
		if (valid) {
			userFactory.updateUserPhoneByID($routeParams.id, _this.changedValues.phone_no)
			.then(function(res){
				console.log(res);
				_this.showModal(2);
			});
		} else {
			_this.showModal(1);
		}
	}

	_this.updateUserRole = function(valid){
		if (valid) {
			userFactory.updateUserRoleByID($routeParams.id, _this.changedValues.role)
			.then(function(res){
				console.log(res);
				_this.showModal(2);
			});
		} else {
			_this.showModal(1);
		}
	}

	_this.updateUserAddress = function(valid){
		if (valid){
			userFactory.updateUserAddressByID($routeParams.id, _this.changedValues.address, _this.changedValues.country)
			.then(function(res){
				console.log(res);
				_this.showModal(2);
			});
		} else {
			_this.showModal(1);
		}
	}

	_this.fetchCountries = function() {
	    userFactory.fetchCountries()
	    .then(function(res){
	      _this.countryData = res.data['countryData'];
	    });
	}

	_this.loadCountries = function(word) {
	    _this.dropdCountries = [];
	    angular.forEach(_this.countryData, function(country) {
		    if (word != undefined && word != "" && 
		        (country.name.length >= word.length) && 
		        (country.name.toLowerCase().indexOf(word.toLowerCase()) == 0)) {
		    	
		    	_this.dropdCountries.push(country.name);
		    }
	    });
	}

	_this.countryInList = function(word) {
	    if(_this.dropdCountries.length == 0) {
	      _this.changedValues.country = "";
	    }
	    angular.forEach(_this.dropdCountries, function(country) {
	    	if (word.toLowerCase() == country.toLowerCase()) {
	    		_this.changedValues.country = country;
	      	} else {
	        	_this.changedValues.country = "";
	      	}
	    });
	}

	_this.showModal = function(value){
		if(value == 1) {
			_this.titleMessage = 'Error';
			_this.bodyMessage = 'The submission is not valid';
			_this.modalSecondButton = 'Ok';
			_this.modalButtonClass = 'btn-danger';
			$("#editUserModal").modal({backdrop: "static"});
		} else if(value == 2) {
			_this.titleMessage = 'Success';
			_this.bodyMessage = 'Data Successfully changed';
			_this.modalSecondButton = 'Ok';
			_this.modalButtonClass = 'btn-primary';
			$("#editUserModal").modal({backdrop: "static"});
			_this.changedValues = {};	
		}
	}

	_this.getCurrentUserByID = function() {
		userFactory.getUserByID($routeParams.id)
		.then(function(res){
			if (res.data.success) {
				_this.userToBeEdited = res.data.user;
			} else {
				console.log(res.data.message);
			}
			
		});
	}

	_this.getCurrentUserByID();
}]);