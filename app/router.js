//core modules
var express         = require('express');
var path        = require('path');
var jwt         = require('jsonwebtoken');
var speakeasy   = require('speakeasy');
var QRCode      = require('qrcode');
var bcrypt    = require('bcrypt-nodejs');


//loacl modules
var User                 = require('./models/User');
var Asset       = require('./models/Asset');
var Company     = require('./models/Company');
var countryData = require('../resources/countries');
let appDetails  = require('../package.json')

//instances
var router          = express.Router();
var app         = express();
var secret      = "blockchain" //a secret key which helps decrypt out token
router.use(express.json());
router.use(express.urlencoded({extended: true}));

//bigchain API Path
const API_PATH = 'http://localhost:9984/api/v1/'

//User Registeration
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
  user.companies_created = [];
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
        console.log(user)
        if (user.authUser(req.body.password)) {
          var token = jwt.sign({username: user.username, email: user.email, fullname: user.fullname, role: user.role}, secret, { expiresIn: '10h' });
          console.log(token);
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
              var token = jwt.sign({username: user.username, email: user.email, fullname: user.fullname, role: user.role}, secret, { expiresIn: '10h' });
              console.log(token);
              res.json({success:true, message:"correct credentials", token:token});
            } else {
              console.log('hey');
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

router.get('/userRegCountries', function(req, res, next) {
    res.json(countryData);
});

//Ping health check
router.get('/ping', function(req, res, next) {
    res.end(`PONG, verzion ${appDetails.version}`);
});

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

router.get('/refreshSession/:username', function(req, res, next){
  if (req.token) {
    res.json({success:true, token:req.token});
  }
});

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

router.post('/setup2FA', function(req, res, next){
  var secret = speakeasy.generateSecret({length:10});
  
  //generating QRCode DataURL
  QRCode.toDataURL(secret.otpauth_url, function(err, dataUrl){
    if(req.decoded.role == "admin") {

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
    } else {
      res.json({success:false, message:"you are not admin"});
    }
  });
});

router.post('/verify2FA', function(req, res, next){
  if(req.decoded.role == "admin") {
    User.findOne({username:req.decoded.username}, function(err, user){
      
      if(err){
        res.json({success:false, message:"some error occured while fetching user " + err});
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
              res.json({success:false, message:"error occured while saving secret in user document" + userErr});
            } else {
              User.findOne({username:req.decoded.username}, function(err, user){
                console.log(user);
                res.json({success:true, message:"2FA Enabled for you!"});
              });
              
            }
          });
        } else {
          res.json({success:false, message:"Invalid Token Verification failed"});
        }
      } 
    });
  } else {  
    res.json({success:false, message:"you are not admin"});
  }
});

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

router.get('/getCurrentUser', function(req, res, next) {
    res.json({success:true, token:req.decoded});
});

router.get('/getCurrentUserAllDetails', function(req, res, next) {
    console.log(req.decoded.username);
    User.findOne({username:req.decoded.username}, function(err, user) {
      res.json({success:true, user:{username:user.username, address:user.address, country:user.country, email:user.email, fullname:user.fullname, phone_no:user.phone_no, role:user.role}});
    });
});

router.get('/getCurrentUserRole', function(req, res, next) {
    res.json({success: true, role: req.decoded.role});
});

router.get('/getAllUsers', function(req, res, next) {
  User.find({username : {$ne : req.decoded.username}}, 'username address country fullname phone_no role', function(err, users){
    if(req.decoded.role == 'admin'){
      if (users) {
        res.json({success:true, users:users});
      } else if (err) {
        res.json({success:false, message:err, users:{}});
      }
    } else {
      res.json({success: false, message:"You do not have permission."})
    }

  });
});

router.delete('/deleteUser/:id', function(req, res, next){
  if(req.decoded.role == 'admin') {
    console.log(req.params);
    User.findOneAndRemove({_id:req.params.id}, function(err){
      if(err){
        res.json({success:false, message:err});
      } else {
        res.json({success:true, message:"user deleted"})
      }
    });
  } else{
    res.json({success:false, message:"You do not have permission."})
  }
});

router.get('/getUserByID/:id', function(req, res, next){
  if(req.decoded.role == 'admin') {
    User.findOne({_id:req.params.id}, 'username address country fullname phone_no role', function(err, user){
      console.log(req.params.id);
      if(err) {
        res.json({success:false, message:err});
      } else if (user) {
        res.json({success:true, user:user});
      } else {
        res.json({success:false, message:"User not found"})
      }
    });
  }
}); 

router.put('/updateUserDetailsByID', function(req, res, next){
  if (req.decoded.role == 'admin') {
    User.findOne({_id:req.body.id}, function(err, user){
      if (err){
        res.json({success:false, message:err});
      } else if (user) {
        if(req.body.fullname) { //update FULL NAME
          console.log("here")
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
  } else {
    res.json({success:false, message:'you donot have enough permissions'});
  }
});

router.post('/addCompany', function(req,res, next){
  var company= new Company();
  company.companyName  =  req.body.companyName;
  company.companyId    =  req.body.companyId;
  company.location     =  req.body.location;
  company.regNumber    =  req.body.regNumber;
  company.type         =  req.body.type;

  company.save(function(err){
    console.log(company);
    if(err) {
       res.json({success:false, message:err});
    } else{
      //finding the user to which the asset is added
      User.findOne({username : req.decoded.username}, function(error, user) {
        if(error){
          Company.deleteOne({_id:company._id}, function(err){
            if(err){
              res.json({success:false, message:"user not found but could not delete company"});
            } else {
              res.json({success:false, message:"user not found deleted the company"});
            }
          });
          res.json({success:false, message:error});
        } else if (user) {
          //add asset to assets_created array for the user
          user.companies_created = user.companies_created.concat([company._id]);
          //saving the model
          user.save(function(errorUser){
            if(errorUser) {
              res.json({success: false, message:"could not save the user" + errorUser});
            } else {
              res.json({success: true, message:"Company Created", company:company});
            }
          });
        } else {
          //deleting the asset just created if no user found
          Company.deleteOne({_id:company._id}, function(err){
            if(err){
              res.json({success:false, message:"user not found but could not delete asset"});
            } else {
              res.json({success:false, message:"user not found deleted the asset"});
            }
          });
        }
      })
    }
  });
}); 


//ading asset for the user
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


  /*var asset1 = {
        'bicycle': {
                'serial_number': 'cde',
                'manufacturer': 'Bicycle Inc.',
        }
    }

  var  asset2= {
  'product_ref'   : req.body.product_ref,
  'company_ref'   : req.body.company_ref,
  'upc_a'         : req.body.upc_a,
  'country_code'  : req.body.country_code,
  'brand'         : req.body.brand,
  'product_name'  : req.body.product_name,
  'model'         : req.body.model,
  'weight'        : req.body.weight,
  'product_dim'   : req.body.product_dim,
  }
  var metadata = { 'weight1' : 'req.body.weight'}
  console.log("alice keypair " + bigchainUsers.alice + " bob public_keys " + bigchainUsers.bob);
  var driver= bigchainUsers.driver
  const txCreateAliceSimple = driver.Transaction.makeCreateTransaction(
        //{'shreya' : {JSON.stringify(asset, null, '\t')}},
        asset2,
        metadata, 

        // A transaction needs an output
        [ driver.Transaction.makeOutput(
                        driver.Transaction.makeEd25519Condition(bigchainUsers.alice))
        ],
        bigchainUsers.alice
  )
  const txCreateAliceSimpleSigned = driver.Transaction.signTransaction(txCreateAliceSimple, bigchainUsers.alice)

  const conn = new driver.Connection(API_PATH)
  conn.postTransaction(txCreateAliceSimpleSigned)
        // Check status of transaction every 0.5 seconds until fulfilled
        .then(() => conn.pollStatusAndFetchTransaction(txCreateAliceSimpleSigned.id))

        .then(retrievedTx => console.log('Transaction', retrievedTx.id, 'successfully posted.'))
        // Check status after transaction has completed (result: { 'status': 'valid' })
        // If you check the status of a transaction to fast without polling,
        // It returns that the transaction is waiting in the 'backlog'
        .then(() => conn.getStatus(txCreateAliceSimpleSigned.id))
        .then(status => console.log('Retrieved status method 2: ', status))

        // Transfer bicycle to Bob
        .then(() => {
                const txTransferBob = driver.Transaction.makeTransferTransaction(
                        // signedTx to transfer and output index
                        [{ tx: txCreateAliceSimpleSigned, output_index: 0 }],
                        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bigchainUsers.bob))],
                        // metadata
                        {'alice':'abcd'}
                )

                // Sign with alice's private key
                let txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, bigchainUsers.alice)
                console.log('Posting signed transaction: ', txTransferBobSigned)

                // Post and poll status
                return conn.postTransaction(txTransferBobSigned)
        })
        .then(res => {
                console.log('Response from BDB server:', res)
                return conn.pollStatusAndFetchTransaction(res.id)
        })
        .then(tx => {
                console.log('Is Bob the owner?', tx['outputs'][0]['public_keys'][0] == bigchainUsers.bob)
                console.log('Was Alice the previous owner?', tx['inputs'][0]['owners_before'][0] == bigchainUsers.alice )
        })
        // Search for asset based on the serial number of the bicycle
        .then(() => conn.searchAssets('Bicycle Inc.'))
        .then(assets => console.log('Found assets with serial number Bicycle Inc.:', assets))
*/


  asset.save(function(err){
    console.log(asset);
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

module.exports.router = router;
