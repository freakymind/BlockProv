angular.module('userController', ['userRegService'])

.controller('userCtrl', ["$http", "$location", "userFactory", function($http, $location, userFactory) {
  console.log("controller userCtrl loaded.. ");

  _this = this;
  this.countryData;
  this.dropdCountries=[];
  this.inputFields = {
    'username' : '',
    'fullname' : '',
    'emailid'  : '',
    'address'  : '',
    'country'  : '',
    'password' : '',
    'retypepass' : '',
   };

  this.signupMessage = '';
  this.signupMessageHeader = '';
  this.submitRegDetails = function(regData) {
    _this.inputFields = {
      'username' : '',
      'fullname' : '',
      'emailid'  : '',
      'address'  : '',
      'country'  : '',
      'password' : '',
      'retypepass' : '',
    };

    var boolValidateRequired = validateRequired();
    var boolValidatePassword = validatePassword();
    var boolValidateEmailId  = validateEmailID();
    
    if(boolValidateRequired && boolValidatePassword && boolValidateEmailId) {
      userFactory.register(regData)
      .then(function(res){
        if (res.data.success) {
          clearOut();
          // $location.path('/successfulReg');
          _this.signupMessage = 'Registration Complete, Login to continue.';
          _this.signupMessageHeader = 'Success';
        } else {
          console.log(res.data);
          _this.signupMessage = res.data.message;
          _this.signupMessageHeader = 'Error';
        }
      });
    } else if (!boolValidateRequired) {
      _this.signupMessage = 'Please fill all the details';
    } else if (!boolValidatePassword) {
      _this.signupMessage = 'Password does not match';
    } else if (!boolValidateEmailId) {
      _this.signupMessage = 'Enter a valid Email ID';
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
      
        console.log(_this.regData)

        if (_this.regData == undefined  || locRegData.username == "" || locRegData.username   == undefined) {
          _this.inputFields.username = "emptyFields"
        }
        if (_this.regData == undefined  || locRegData.fullname   == "" || locRegData.fullname   == undefined) {
          _this.inputFields.fullname = "emptyFields"
        }
        if (_this.regData == undefined  || locRegData.emailid    == "" || locRegData.emailid    == undefined) {
          _this.inputFields.emailid = "emptyFields"
        }
        if (_this.regData == undefined  || locRegData.country    == "" || locRegData.country    == undefined) {
          _this.inputFields.country = "emptyFields"
        }
        if (_this.regData == undefined  || locRegData.address    == "" || locRegData.address    == undefined) {
          _this.inputFields.address = "emptyFields"
        }
        if (_this.regData == undefined  || locRegData.phone_no   == "" || locRegData.phone_no   == undefined) {
          _this.inputFields.phone_no = "emptyFields"
        }
        if (_this.regData == undefined  || locRegData.password   == "" || locRegData.password   == undefined) {
          _this.inputFields.password = "emptyFields"
        }
        if (_this.regData == undefined  || locRegData.retypepass == "" || locRegData.retypepass == undefined) {
          _this.inputFields.retypepass = "emptyFields"
        }
        return false;
    } else {
      return true;
    }
  }

  var validateEmailID = function() {
    if (_this.regData != undefined  &&
        _this.regData.emailid != "" && _this.regData.emailid != undefined ) {
      
      var atLoc = _this.regData.emailid.indexOf('@');
      var dotLoc = _this.regData.emailid.indexOf('.');
      var email = _this.regData.emailid;

      if(((atLoc > 0) && (atLoc < (email.length - 1))) && 
        (((dotLoc - atLoc) > 1)  && (email.lastIndexOf('.') < (email.length - 1)))) {
        //-----------------------------------------------------------------------
        // http get request to search db for the emailID.
        // if email ID exists, donot continue, ask user to enter another emailID
        //-----------------------------------------------------------------------

        return true;
      } else {

        //change the style of the email input field
        _this.inputFields.emailid = "emptyFields"
        console.log('error email');
        return false;
      }
    }
  }



  var clearOut = function() {
    _this.regData.username   = "";
    _this.regData.fullname   = "";
    _this.regData.emailid    = "";
    _this.regData.country    = "";
    _this.regData.address    = "";
    _this.regData.phone_no   = "";
    _this.regData.password   = "";
    _this.regData.retypepass = "";
  }
}]);
