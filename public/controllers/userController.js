angular.module('userController', ['userRegService'])

.controller('userCtrl', ["$http", "$location", "userFactory", function($http, $location, userFactory) {
  console.log("controller userCtrl loaded.. ");
  _this = this;
  this.countryData;
  this.dropdCountries=[];
  this.signupModalMessage = '';
  this.signupModalHeader = '';


  this.submitRegDetails = function(regData, valid) {
    if (valid) {
        var boolValidatePassword = validatePassword();
        
        if(boolValidatePassword) {
          userFactory.register(regData)
          .then(function(res){
            if (res.data.success) {
              clearOut();
              _this.signupModalMessage = 'Registration Complete, Login to continue.';
              _this.signupModalHeader = 'Success';
            } else {
              console.log(res.data);
              _this.signupModalMessage = res.data.message;
              _this.signupModalHeader = 'Error';
            }
          });
        }
      }
  }

  this.fetchCountries = function() {
    userFactory.fetchCountries()
    .then(function(res){
      _this.countryData = res.data['countryData'];
    });
  }

  this.loadCountries = function(word) {
    _this.dropdCountries = [];
    angular.forEach(_this.countryData, function(country) {
      if (word != "" && (country.name.length >= word.length) && (country.name.toLowerCase().indexOf(word.toLowerCase()) == 0)) {
        _this.dropdCountries.push(country.name);
      }
    });
  }

  this.countryInList = function(word) {
    angular.forEach(_this.dropdCountries, function(country) {
      if (word.toLowerCase() == country.toLowerCase()) {
        _this.regData.country = country;
      } else {
        _this.regData.country = "";
      }
    });
  }

  var validatePassword = function() {
    if (_this.regData != undefined  &&
       _this.regData.password != "" && _this.regData.password != undefined && 
       _this.regData.retypepass != "" && _this.regData.retypepass != undefined && 
       _this.regData.password === _this.regData.retypepass) {

      console.log("password valid");
      return true;
    } else {
      console.log("password invalid");
      _this.inputFields.password = "emptyFields";
      _this.inputFields.retypepass = "emptyFields";
      return false;
    }
  }

  var clearOut = function() {
    _this.regData = {};
  }

}]);
