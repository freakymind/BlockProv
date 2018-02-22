//core modules
var express 		= require('express');
var path        = require('path');
var jwt         = require('jsonwebtoken');
var speakeasy   = require('speakeasy');
var QRCode      = require('qrcode');
var bcrypt      = require('bcrypt-nodejs');

//loacl modules
var User 				= require('./models/User');
var Asset       = require('./models/Asset');
var countryData = require('../resources/countries');
let appDetails  = require('../package.json')

//instances
var router  		= express.Router();
var app         = express();
var secret      = "blockchain" //a secret key which helps decrypt out jwt token
router.use(express.json());
router.use(express.urlencoded({extended: true}));

//-------------------------------------------------------------------------//
//**************  API REALTED TO USER SIGNUP/REGISTEATIONS  ***************//
//-------------------------------------------------------------------------//

//User Registeration : send data from signup form for user reg.
router.post('/user', function(req, res, next){
  var user = new User();
  user.username = req.body.username;
  user.password = req.body.password;
  user.email    = req.body.emailid;
  user.country  = req.body.country;
  user.phone_no = req.body.phone_no;
  user.address  = req.body.address;
  user.fullname = req.body.fullname;
  user.role     = "user";
  user.assets_created = [];
  user.twoFactor = {};
  bcrypt.hash(user.password, null, null, function(err, hash){
    if (err) {
      res.json({success:false, message:"error converting password to hash"});
    } else {
      user.password = hash;
      user.save(function(err){
        if (err) {
          if (err.errors != null) {
            if (err.errors.fullname) {
              res.json({success: false, message : err.errors.fullname.message});
            } else if (err.errors.username) {
              res.json({success: false, message : err.errors.username.message});
            } else if (err.errors.email) {
              res.json({success: false, message : err.errors.email.message});
            } 
          } else {
            if (err.code = "11000") {
              res.json({success: false, message : err.errmsg})
            }
          }
        } else {
          res.json({success: true, message : "Signup Successful"});
        }
      });
    }
  });
});

//User Registeration : check if username exists during. 
router.post('/checkUsername', function(req, res, next) {
  User.findOne({username:req.body.username}, function(err, user){
    if(err) {
      res.json({success:false, message:err});
    } else {
      if(user) {
        res.json({success: false, message:'username taken'});
      } else {
        res.json({success: true, message: 'valid username'});
      }
    }
  });
});

//User Registeration : check if email already exists.
router.post('/checkEmail', function(req, res, next) {
  User.findOne({email:req.body.email}, function(err, user){
    if(err) {
      res.json({success:false, message:err});
    } else {
      if(user) {
        res.json({success: false, message:'email exists'});
      } else {
        res.json({success: true, message: 'valid email'});
      }
    }
  });
});

//User Registration : used to load countries 'select input field'
//Edit USer Details : used to load countries 'select input field'
router.get('/userRegCountries', function(req, res, next) {
  res.json(countryData);
});

//--------------------------------------------------------------//
//***************  API RELATED TO LOGIN  ***********************//
//--------------------------------------------------------------//

//check if user is 2FA enabled
router.get('/setup2FA/:username', function(req, res, next){
  User.findOne({username:req.params.username}, function(err, user){
    if (err) {
      res.json({success:false, message:"some error occured while fetching user " + err});
    } else if (user) {
      res.json({success:true, twoFactorDetails:user.twoFactor});
    } else {
      res.json({success:false, message:"user not found"});
    }
  }); 
});

//User Login
router.post('/login', function(req, res, next){
  User.findOne({username: req.body.username}, function(err, user) {
    if(user) {
      if (!user.twoFactor || !user.twoFactor.secret) {
        if (user.authUser(req.body.password)) {
          var token = jwt.sign({username: user.username, email: user.email, fullname: user.fullname, role: user.role}, secret, { expiresIn: '1h' });
          res.json({success:true, message:"correct credentials", token:token});
        } else {
          res.json({success:false, message:"incorrect credentials"});
        }
      } else {
        if(!req.body.twoFactAuthToken || req.body.twoFactAuthToken == '') {
          res.json({success:false, message:"no two factor auth token provided"});
        } else {
          var verified = speakeasy.totp.verify({
            secret: user.twoFactor.secret, //secret of the logged in user
            encoding: 'base32',
            token: req.body.twoFactAuthToken
          });

          if (verified) {
            if (user.authUser(req.body.password)) {
              var token = jwt.sign({username: user.username, email: user.email, fullname: user.fullname, role: user.role}, secret, { expiresIn: '1h' });
              res.json({success:true, message:"correct credentials", token:token});
            } else {
              res.json({success:false, message:"incorrect credentials"});
            }
          } else {
            res.json({success:false, message:"Invalid Token Verification failed"});
          }
        }
      }
    } else {
      res.json({success:false, message:"User not found"});
    }
  });
});


//Ping health check
router.get('/ping', function(req, res, next) {
	res.end(`PONG, version ${appDetails.version}`);
});

//api to refresh the user session by signing a new json web token
router.param('username', function(req, res, next, username){
  User.findOne({username:username}, function(err, user){
    if(user) {
      var token = jwt.sign({username: user.username, email: user.email, fullname: user.fullname, role: user.role}, secret, { expiresIn: '1h' })
      req.token = token;
      next();
    } else {
      res.json({success:false, message:"could not refresh"})
    }
  }); 
});

//api that sends back the response with the new token
router.get('/refreshSession/:username', function(req, res, next){
  if (req.token) {
    res.json({success:true, token:req.token});
  }
});

//-----------------------------------------------------------------------------//
//*******************  API THAT REQUIRE USER LOGIN  ***************************//
//-----------------------------------------------------------------------------//

//session or token verification middleware
router.use(function(req, res, next){
  var token = req.body.token || req.body.query || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, secret, function(err, decoded){
      if(err) {
        res.json({success: false, message: "token invalid"});
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.json({success: false, message: "no token provided"});
  }
});

//API to respond with current user details(stored in json web token) who is logged in
router.get('/getCurrentUser', function(req, res, next) {
    res.json({success:true, token:req.decoded});
});

//API to respond with current role(stored in json web token) who is logged in
router.get('/getCurrentUserRole', function(req, res, next) {
    res.json({success: true, role: req.decoded.role});
});

//API to respond with current user all details(stored in database) who is logged in
router.get('/getCurrentUserAllDetails', function(req, res, next) {
    User.findOne({username:req.decoded.username}, function(err, user) {
      res.json({success:true, user:{username:user.username, address:user.address, country:user.country, email:user.email, fullname:user.fullname, phone_no:user.phone_no, role:user.role}});
    });
});

//API to Add an asset for a user.
router.post('/addAsset', function(req, res, next){
  var asset = new Asset();
  asset.product_ref   = req.body.product_ref;
  asset.company_ref   = req.body.company_ref;
  asset.upc_a         = req.body.upc_a;
  asset.country_code  = req.body.country_code;
  asset.brand         = req.body.brand;
  asset.product_name  = req.body.product_name;
  asset.model         = req.body.model;
  asset.weight        = req.body.weight;
  asset.product_dim   = req.body.product_dim;
  asset.save(function(err){
    if(err) {
       res.json({success:false, message:err});
    } else{
      //finding the user to which the asset is added
      User.findOne({username : req.decoded.username}, function(error, user) {
        if(error){
          Asset.deleteOne({_id:asset._id}, function(err){
            if(err){
              res.json({success:false, message:"user not found but could not delete asset"});
            } else {
              res.json({success:false, message:"user not found deleted the asset"});
            }
          });
          res.json({success:false, message:error});
        } else if (user) {
          //add asset to assets_created array for the user
          user.assets_created = user.assets_created.concat([asset._id]);
          //saving the model
          user.save(function(errorUser){
            if(errorUser) {
              res.json({success: false, message:"could not save the user" + errorUser});
            } else {
              res.json({success: true, message:"Asset Created", asset:asset});
            }
          });
        } else {
          //deleting the asset just created if no user found
          Asset.deleteOne({_id:asset._id}, function(err){
            if(err){
              res.json({success:false, message:"user not found but could not delete asset"});
            } else {
              res.json({success:false, message:"user not found deleted the asset"});
            }
          });
        }
      });
    }
  });
});

router.use(function(req, res, next){
  if(req.decoded.role == "admin") {
    next();
  } else {
    res.json({success:false, message:"You donot have permission to access the link"}) 
  }
});

//For Management related purpose.
router.get('/getAllUsers', function(req, res, next) {
  User.find({username : {$ne : req.decoded.username}}, 'username address country fullname phone_no role', function(err, users) {
    if (users) {
      res.json({success:true, users:users});
    } else if (err) {
      res.json({success:false, message:err, users:{}});
    }
  });
});

//delete a user from database using the ID of the user document.
router.delete('/deleteUser/:id', function(req, res, next){
  User.findOneAndRemove({_id:req.params.id}, function(err){
    if(err){
      res.json({success:false, message:err});
    } else {
      res.json({success:true, message:"user deleted"})
    }
  });
});

//finding any user's information using it's document id.
router.get('/getUserByID/:id', function(req, res, next){
  User.findOne({_id:req.params.id}, 'username address country fullname phone_no role', function(err, user){
    if(err) {
      res.json({success:false, message:err});
    } else if (user) {
      res.json({success:true, user:user});
    } else {
      res.json({success:false, message:"User not found"})
    }
  });

}); 

//update user details using the document id of the user 
router.put('/updateUserDetailsByID', function(req, res, next){
  User.findOne({_id:req.body.id}, function(err, user){
    if (err){
      res.json({success:false, message:err});
    } else if (user) {
      if(req.body.fullname) { //update FULL NAME
        user.fullname = req.body.fullname;
        user.save(function(err){
          if (err) {
            if(err.errors != null) {
              if (err.errors.fullname) {
                res.json({success:false, message:err.errors.fullname.message});
              }
            } else {
              res.json({success:false, message:err});
            }
          } else {
            res.json({success:true, message:"Successfully updated full name"})
          }
        });
      } else if (req.body.address && req.body.country) { //update ADDRESS
        user.address = req.body.address;
        user.country = req.body.country;
        user.save(function(err) {
          if (err) {
            res.json({success:false, message:err});
          } else {
            res.json({success:true, message:"Successfully updated address"})
          }
        });
      } else if (req.body.phone_no) { //update PHONE_NO
        user.phone_no = req.body.phone_no;
        user.save(function(err) {
          if (err) {
            if(err.errors != null) {
              if (err.errors.phone_no) {
                res.json({success:false, message:err.errors.phone_no.message});
              }
            } else {
              res.json({success:false, message:err});
            }
          } else {
            res.json({success:true, message:"Successfully updated phone_no"})
          }
        });
      } else if (req.body.role) { //update ROLE
        user.role = req.body.role;
        user.save(function(err) {
          if (err) {
            res.json({success:false, message:err});
          } else {
            res.json({success:true, message:"Successfully updated role"})
          }
        });
      } else { //updating nothing
        res.json({success:false, message:"no update attribute provided"});
      }
    } else {
      res.json({success:false, message:'User Not Found'});
    }
  });
});

//setup 2FA security option.
router.post('/setup2FA', function(req, res, next){
  var secret = speakeasy.generateSecret({length:10});
  
  //generating QRCode DataURL
  QRCode.toDataURL(secret.otpauth_url, function(err, dataUrl){

    //finding the current user document to save the twofactor details
    User.findOne({username:req.decoded.username}, function(err, user){
      if (err) {
        res.json({success:false, message:"some error occured while fetching user " + err});
      } else if (user) {
        user.twoFactor = {
          secret : "",
          tempSecret : secret.base32,
          dataUrl : dataUrl,
          otpURL: secret.otpauth_url
        };
        user.save(function(err){
          if(err){
            res.json({success:false, message:"error in saving the twofactor field "+ err});
          } else {
            res.json({
              success:true,
              message: 'Verify OTP',
              tempSecret: secret.base32,
              dataURL: dataUrl,
              otpURL: secret.otpauth_url
            });
          }
        });
      } else {
        res.json({success:false, message:"user not found"});
      }
    });
  });
});

//verify 2FA security once it is being setup.
router.post('/verify2FA', function(req, res, next){

    //finding user for verification.
    User.findOne({username:req.decoded.username}, function(err, user){
      
    if(err){
      res.json({success:false, message:"An error occured while fetching user " + err});
    } else if (user) {
      var verified = speakeasy.totp.verify({
        secret: user.twoFactor.tempSecret, //secret of the logged in user
        encoding: 'base32',
        token: req.body.twoFactAuthToken
      });

      if(verified) {
        //set secret, confirm 2fa
        user.twoFactor = {
          secret : user.twoFactor.tempSecret,
          tempSecret : user.twoFactor.tempSecret,
          dataUrl : user.twoFactor.dataUrl,
          otpURL: user.twoFactor.otpURL
        }
        
        user.save(function(userErr){
          if(userErr){
            res.json({success:false, message:"An error occured while saving secret in user document" + userErr});
          } else {
            User.findOne({username:req.decoded.username}, function(err, user){
              res.json({success:true, message:"2FA Enabled for you!"});
            });
            
          }
        });
      } else {
        res.json({success:false, message:"Invalid Token Verification failed"});
      }
    } else {
      res.json({success:false, message:"User not found"})
    } 
  });
});

//delete or disable 2FA security option.
router.delete('/disable2FA', function(req, res, next){
  User.findOne({username:req.decoded.username}, function(err, user){
    if(err) {
      res.json({success:false, message:"Error occured : " + err});
    } else if(user){
      user.twoFactor = {};
      user.save(function(errorSave){
        if(errorSave) {
          res.json({success:false, message:"Error occured while saving : " + errorSave});
        } else {
          res.json({success:true, message:"Disabled 2FA for you"});
        }
      })
      
    } else {
      res.json({success:false, message:"User not found"});
    }
  });
});

module.exports.router = router;
