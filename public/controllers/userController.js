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


  this.checkUsername = function(valid) {
    if(valid) {
      userFactory.checkUsername({username:_this.regData.username})
      .then(function(res){
        console.log(res.data.message);
      });
    }
  }

  this.checkEmail = function(valid) {
    if(valid) {
      userFactory.checkEmail({email:_this.regData.emailid})
      .then(function(res){
        console.log(res.data.message);
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


// .directive('match', function() {
//   return {
//     template : '{{register.myInput}}'
//   }
// })


// .directive('match', function() {
//   return {
//     template : 'hey'
//   }
// })
