angular.module('userController', ['userRegService'])

.controller('userCtrl', ["$http", "$location", "userFactory", "tokenCheck", function($http, $location, userFactory, tokenCheck) {
  console.log("controller userCtrl loaded.. ");
  var _this = this;
  this.countryData;
  this.dropdCountries=[];
  this.signupModalMessage = '';
  this.signupModalHeader = 'Error';
  this.isEmailValid=false;
  this.isEmailAuthorised=false;
  this.isUsernameValid=false;

  this.checkIfAuthorised = function(emailid){
    userFactory.checkIfAuthorised(emailid)
    .then(function(res){
      _this.isEmailAuthorised = res.data.success;
    });
  }

  this.submitRegDetails = function(regData, valid) {
    if (valid) {
      userFactory.checkIfAuthorised(regData.emailid)
      .then(function(response){
        if(response.data.success) {
          userFactory.register(regData)
          .then(function(res){
            if (res.data.success) {
              clearOut();
              _this.signupModalMessage = 'Registration Complete, Login to continue.';
              _this.signupModalHeader = 'Success';
              $('#userSignupModal').modal({backdrop:"static"});
            } else {
              _this.signupModalMessage = res.data.message;
              _this.signupModalHeader = 'Error';
              $('#userSignupModal').modal({backdrop:"static"});
            }
          });
        } else {
          _this.signupModalMessage = response.data.message;
          _this.signupModalHeader = 'Error';
          $('#userSignupModal').modal({backdrop:"static"});
        }
      });
      
    } else {
      _this.signupModalMessage = "Form details are invalid. Some details you might have entered are not valid and all fields are required.";
      _this.signupModalHeader = 'Error';
      $('#userSignupModal').modal({backdrop:"static"});
    }
  }


  this.checkUsername = function(valid) {
    if(valid) {
      userFactory.checkUsername({username:_this.regData.username})
      .then(function(res){
        _this.isUsernameValid = res.data.success;
      });
    }
  }

  this.checkEmail = function(valid) {
    if(valid) {
      userFactory.checkEmail({email:_this.regData.emailid})
      .then(function(res){
        _this.isEmailValid = res.data.success;
      });
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
      if (word != undefined && word != "" && (country.name.length >= word.length) && (country.name.toLowerCase().indexOf(word.toLowerCase()) == 0)) {
        _this.dropdCountries.push(country.name);
      }
    });
  }

  this.countryInList = function(word) {
    if(_this.dropdCountries.length == 0) {
      _this.regData.country = "";
    }
    angular.forEach(_this.dropdCountries, function(country) {
      if (word.toLowerCase() == country.toLowerCase()) {
        _this.regData.country = country;
      } else {
        _this.regData.country = "";
      }
    });
  }

  var clearOut = function() {
    _this.regData = {};
  }
}])



.directive('match', function() {
  return {
    restrict : 'A',
    
    controller : function($scope) {
      $scope.register.passwordIsValid = false;
      
      $scope.validatePassword = function(confirmValue) {
        if ($scope.register.regData != undefined && confirmValue == $scope.register.regData.retypepass) {
          $scope.register.passwordIsValid = true;
        } else {
          $scope.register.passwordIsValid = false;
        }
      };

    },

    link : function(scope,element,attrs) {
      scope.$watch(function(scope) {
          if (scope.register.regData != undefined) {
            return scope.register.regData.retypepass
          }
          else {
            return undefined;
          }
        }, function(value) {
          scope.validatePassword(attrs.match);
      });

      attrs.$observe('match', function() {
        scope.validatePassword(attrs.match);
      });
    }
  };
});
