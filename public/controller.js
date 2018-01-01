angular.module('userController', [])

.controller('userCtrl', function($http) {
  console.log("controller userCtrl loaded.. ");

  _this = this;
  this.countryData;
  this.dropdCountries=[];

  this.submitRegDetails = function(regData) {
    if(validateRequired() && validatePassword() && validateEmailID()) {
      $http.post('/api/user', regData)
      .then(function(res){
        console.log(res.data);
        console.log("post request success!");
      });
    }
  }

  this.fetchCountries = function() {
    $http.get('/api/userRegCountries')
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
    if (_this.regData.password === _this.regData.retypepass) {
      console.log("password valid");
      return true;
    } else {
      console.log("password invalid");
      return false;
    }
  }

  var validateRequired = function() {
    var locRegData = _this.regData
    if (_this.regData == undefined  ||
        locRegData.username   == "" || locRegData.username   == undefined ||
        locRegData.fullname   == "" || locRegData.fullname   == undefined ||
        locRegData.emailid    == "" || locRegData.emailid    == undefined ||
        locRegData.country    == "" || locRegData.country    == undefined ||
        locRegData.address    == "" || locRegData.address    == undefined ||
        locRegData.phone_no   == "" || locRegData.phone_no   == undefined ||
        locRegData.password   == "" || locRegData.password   == undefined ||
        locRegData.retypepass == "" || locRegData.retypepass == undefined) {
        console.log("some details required!")
        return false;
    } else {
      return true;
    }
  }

  var validateEmailID = function() {
    var atLoc = _this.regData.emailid.indexOf('@');
    var dotLoc = _this.regData.emailid.indexOf('.');
    var email = _this.regData.emailid;

    if (((atLoc > 0) && (atLoc < (email.length - 1))) && (((dotLoc - atLoc) > 1)  && (email.lastIndexOf('.') < (email.length - 1)))) {
      //-----------------------------------------------------------------------
      // http get request to search db for the emailID.
      // if email ID exists, donot continue, ask user to enter another emailID
      //-----------------------------------------------------------------------

      return true;
    } else {
      console.log('error email');
      return false;
    }
  }

});
