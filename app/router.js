//Core modules
var express     = require('express');
var path        = require('path');
var jwt         = require('jsonwebtoken');
var speakeasy   = require('speakeasy');
var QRCode      = require('qrcode');
var bcrypt      = require('bcrypt-nodejs');
var util        = require('util');
var prettyjson  = require('prettyjson');

//Loacl modules
var User        = require('./models/User');
var Asset       = require('./models/Asset');
var assetDAO    = require('./AssetDAO');
var Company     = require('./models/Company');
var countryData = require('../resources/countries');
var userDAO     = require('./userDAO');
var prDistDAO   = require('./PrimaryDistributorDAO');
var approvedUserDAO = require('./ApprovedUserDAO');
var companyDAO = require('./companyDAO');
var async = require('async');

let appDetails  = require('../package.json');
const bcwrapper = require('./bigchain/index.js');

//instances
var router      = express.Router();
var app         = express();
var secret      = "blockchain" //a secret key which helps decrypt out jwt token
router.use(express.json());
router.use(express.urlencoded({extended: true}));

var assetHistArr = [];
router.get('/getAssetId/:product_ref/:companyName', function(req, res, next){
  //get company id from company name
  companyDAO.findCompany({companyName:req.params.companyName}, "companyId", function(err, company){
    if (err) {
      res.json({success:false, message:"some error occured while fetching the company"});
    } else if(company != null){
      assetDAO.findAssetID({product_ref:req.params.product_ref, company_ref:company.companyId}, function(err, asset){
        if(err){
          res.json({success:false, message:"error occured while searching for asset"})
        } else if(asset != null){
          res.json({success:true, assetId:asset.assetId});
        } else {
          res.json({success:false, message:"asset is not registered"});
        }
      });
    } else {
      res.json({success:false, message:"invalid company name"})
    }
  });
});

router.get('/getTransHist/:txnID', function(req, res, next){
  var curAsset = bcwrapper.createAssetObj();
  
  //creating an asset object from transacion ID
  curAsset.createAssetFromId(req.params.txnID)
  .then(function(responseObj){
    if(responseObj) {
      
      //calling GetAssetHistory wrpper function 
      //from the asset object
      curAsset.getAssetHistory()
      .then(function(history){
        if(history) {
          assetHistArr = [];
          
          //find the user details from the public keys
          //from each transaction in the history array
          async.eachSeries(history, function(assetHist, cb){
            userDAO.findUser({'bigchainKeyPair.publicKey' : assetHist.outputs[0].public_keys[0]}, "username email fullname companyName", function(err, user) {
              if (err) {
                res.json({success:false, message:err})
              } else if(user != null) {
                
                user.asset = assetHist;
                var tempUser = {};
                tempUser.username = user.username;
                tempUser.email = user.email;
                tempUser.fullname = user.fullname;
                tempUser.companyName = user.companyName;
                if(assetHist.operation == "CREATE") {
                  tempUser.assetDet = assetHist.asset;
                }
                else{
                  tempUser.assetDet = assetHist.metadata;
                }
                assetHistArr.push(tempUser);

                cb(null);
              } else {
                res.json({success:false, message:"no user"})
              }
            })
            
          }, function(err){
            if(err) {
              res.json({success:false, message:"error occured"});
            } else {
              res.json({success:true, history:assetHistArr});
            }
          });  

      
        } else{
          res.json({success:false, message:"no history could be fetched"})
        }
      })
    } else {
      res.json({success:false, message:"no asset could be fetched"})
    }
  })
  .catch(function(err){
    if (err){
      res.json({success:false, message:"some error occured : " + err});
    }
  });
}); 


router.get('/getApprovedUsersList', function(req, res, next){
  approvedUserDAO.getApprovedUserList(function(err, userListDoc){
    if(err) {
      res.json({success:false, message:"could not find the list" + err})
    } else {
      res.json({success:true, list:userListDoc.userList})
    }
  });
});


var getUserListArray = function(userList, cb) {
  /*  
    regex takes comma seperated, space seperated and newline char seperated
  */
  var newUserList = userList.split(/\s+,+\s+|\s+,|,\s+|,+|\s/g);
  cb(newUserList);
}


router.get('/checkIfAuthorised/:emailid/:role',function(req, res, next){
  if(req.params.role == "user") {
    approvedUserDAO.checkAuthorised(req.params.emailid, function(err, approvedUserDoc){
      if (err){
        res.json({success:false, message:"error occured" + err});
      } else if (approvedUserDoc) {
        res.json({success:true, role:"user", message:"user is approved"});
      } else {
        res.json({success:false, message:"user is not approved"});
      }
    });
  } else if (req.params.role = "distributor") {
    prDistDAO.findPrimDistributor(req.params.emailid, function(err, primDist){
      if(err){
        res.json({success:false, message:"some error in accessing the records"});
      } else {

        if(primDist != null && primDist.level && primDist.level == 2){
          res.json({success:true, role:"secDist", message:"you are an authorised secondary Distributor"});
        } else if (primDist != null){
          res.json({success:true, role:"primDist", message:"you are an authorised primary Distributor"});
        } else {
          res.json({success:false, message:"you are not approved"});
        }
      }
    });
  }
});


//-------------------------------------------------------------------------//
//**************  API REALTED TO USER SIGNUP/REGISTEATIONS  ***************//
//-------------------------------------------------------------------------//

//User Registeration : send data from signup form for user reg.

//bigchain API Path
const API_PATH = 'http://localhost:9984/api/v1/'

//User Registeration
//V2 using UserDAO functions
router.post('/user', function(req, res, next){
    userDAO.insertUser(req.body, function(err, label){
        if (label == "hash" && err) {
          res.json({success:false, message : "error in creating hash"})
        } else if (label == "save" && err) {
            if (err.errors != null) {
              if (err.errors.fullname) {
                res.json({success: false, message : err.errors.fullname.message});
              } else if (err.errors.username) {
                res.json({success: false, message : err.errors.username.message});
              } else if (err.errors.email) {
                res.json({success: false, message : err.errors.email.message});
              } 
            } else if (err.code = "11000") {
              res.json({success: false, message : err.errmsg});
            }
        } else {
            res.json({success:true, message: "User Successfully Signed Up"})
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

//get all company Values
router.get('/allCompanyNames', function(req, res, next){
  Company.find({}, {'_id':0, 'companyName':1}, function(err, companies){
    if(err){
      res.json({success:false, message:"some error occured" + err})
    } else if(companies){
      var compArr = companies.map(function(company){
        return company.companyName;
      });
      res.json({success:true, companies:compArr});
    } else {
      res.json({success:false, message:"no companies to display"})
    }
  });
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
  console.log("in here");
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
    res.end(`PONG, verzion ${appDetails.version}`);
});


//api that sends back the response with the new token
router.get('/refreshSession/:username', function(req, res, next){
  User.findOne({username:req.params.username}, function(err, user){
    if(user) {
      var token = jwt.sign({username: user.username, email: user.email, fullname: user.fullname, role: user.role}, secret, { expiresIn: '1h' })
      res.json({success:true, token:token});
    } else {
      res.json({success:false, message:"could not refresh"})
    }
  });
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


router.get('/getAsset', function(req, res, next){
});


router.get('/viewAssets', function(req, res, next){
  userDAO.findUser({username:req.decoded.username}, "bigchainKeyPair", function(err, user){
    console.log(user.bigchainKeyPair.publicKey)
    console.log(req.body)

    let NewViewObject = bcwrapper.getViewObject();
    NewViewObject.getAllCurrentlyOwnedAssetsForPublicKey(user.bigchainKeyPair.publicKey)
    .then(function(assets){
      
      //console.log("All Assets : " + util.inspect(assets, false, null));
      res.json({success:true, Assets : assets})
    })
    .catch(function(err){
      console.log("error : " + err);
      res.json({success:false, message:"Error occured"});
    });
  });
});

//Adding asset for the user
router.post('/addAsset', function(req, res, next){
  userDAO.findUser({username:req.decoded.username}, "companyName bigchainKeyPair", function(err, user){
    if(err) {
      res.json({success:false, mesage : "some error occured while finding Current user"})
    } else if (user != null) {
      //adding company/brand name to asset
      req.body.brand = user.companyName;
      findCompanyIdByName(user.companyName, function(err, company){
        if(err) {
          res.json({success: false, message : "error occured while finding company"})
        } else if (company == null) {
          res.json({success : false, message : "company not found"})
        } else {
          //adding company ID to asset
          req.body.company_ref = company.companyId;
          let NewAsset = bcwrapper.createAssetObj();
          NewAsset.createAsset(user.bigchainKeyPair.privateKey, user.bigchainKeyPair.publicKey, req.body, {AssetType:"createTestAsset"})
          .then(function(asset){
            
            //creating a asset details object for assetId and product_ref mapping model
            var tempAsset = {};
            tempAsset.product_ref = req.body.product_ref;
            tempAsset.company_ref = req.body.company_ref;
            tempAsset.assetId = asset.id;
            console.log(tempAsset)
            console.log("Asset Created" + prettyjson.render(asset));
            assetDAO.registerAsset(tempAsset, function(err){
                if(err){
                  res.json({success:false, message:"Error Occured while registering."})
                } else {
                  res.json({success:true, message:"Asset was Successfully Created"});
                } 
            });

            
            //res.json({success:true, message:"Asset is Successfully Created"})
          })
          .catch(function(err){
            console.log("error : " + err);
            res.json({success:false, message:"Error occured"});
          });
        }
      });
    } else {
      res.json({success:false, message:"user not found"})
    }

  });
});


var findUserCompanyName = function (username, cb) {
  userDAO.findUser({username:username}, 'companyName', function(err, user){
    cb(err, user);
  });
};


var findCompanyIdByName = function (companyName, cb) {
  companyDAO.findCompany({companyName:companyName}, 'companyId', function(err, company){
    cb(err, company)
  });
};


router.post('/addDistributor', function(req, res, next){
  if(req.decoded.role == 'user'){
    findUserCompanyName(req.decoded.username, function(err, user){
      if(err) {
        res.json({success:false, message:"could not find user " + err});
      } else {
        findCompanyIdByName(user.companyName, function(err, company){
          if (err) {
            res.json({success:false, message: "could not find company "+ err});
          } else {
            prDistDAO.addPrimDistributor(1, req.body.DistId, company.companyId, req.decoded.email, function(err){
              if(err) {
                res.json({success:false, message: "could not save the distributor " + err});
              } else {
                res.json({success:true, message: "Successfully saved the distributor"});
              }
            });
          }
        });
      }
    })
  } else if (req.decoded.role == 'primdist') {
    prDistDAO.findDistAssociatedCompany(req.decoded.email, function(err, user){
      if(err) {
        res.json({success:false, message:"could not find user " + err});
      } else {
        prDistDAO.addPrimDistributor(2, req.body.DistId, user[0].CompanyAssociated, req.decoded.email, function(err){
          if(err) {
            res.json({success:false, message: "could not save the distributor " + err});
          } else {
            res.json({success:true, message: "Successfully saved the distributor"});
          }
        });
      }
    });
  }
});


router.get('/allDistributorsForAUser', function(req, res, next){
  prDistDAO.findAllDistForUser(req.decoded.email, function(err, PrimDists){
    if (err) { 
      res.json({success:false, message:"Some error Occured"});
    } else if (PrimDists == null){
      res.json({success:false, message:"No Distributors"});
    } else {
      res.json({success:true, PrimDists: PrimDists});
    }
  });
});


var findPublicKeyDistributor = function(userEmailid, cb){
  userDAO.findUser({email: userEmailid} , 'bigchainKeyPair',function(err, dist){
    cb(err, dist)
  });
};


router.post('/transferAsset', function(req, res, next){
  console.log(req.body)

  //check if distributor can be transferred the asset.
  prDistDAO.findPrimDistributor(req.body.email, function(err, primdist){
    if(err) {
      res.json({success: false, message :"Some error occured : Cannot be transferred to a non distributor"})
    } else if (primdist) {
      if(primdist.ApprovedBy == req.decoded.email) {
        
        //now we neet two more details
        //1) public key of the Reciever
        //2) privatekey of the Sender
        findPublicKeyDistributor(req.body.email , function(err, dist){
          if(err){
            res.json({success:false, message:"could not find distributor by email" + err});
          } else {
            
            //trying to find the private key of the sender
            userDAO.findUser({username:req.decoded.username}, "bigchainKeyPair", function(err, user){
              let AssetToTransfer = bcwrapper.createAssetObj();
              //TODO correct the code 
              AssetToTransfer.createAssetFromId(req.body.Transid)
              .then(function(responseObj){
                //metadata should be in form of a js object
                AssetToTransfer.transferAsset(user.bigchainKeyPair.privateKey, dist.bigchainKeyPair.publicKey, {"price" :req.body.metaData})
                .then(function(txn){
                  console.log("txn : " + txn);
                  res.json({success:true, message:"Asset is Successfully Transfered"})
                })
                .catch(function(err){
                  console.log("error : " + prettyjson.render(err));
                  res.json({success:false, message:"Error occured"});
                });
              })
              .catch(function(err){
                console.log(err);
                res.json({success:false, message:"error occured while creating asset by ID"})
              });   
            });
          }
        })
      } else {
        res.json({success: false, message:"The distributor is not approved by you, could not complete the transfer."});
      }
    } else {
      res.json({success:false, message :"Cannot be transferred to a non distributor"}); 
    }
  });

  
});

//------------------------------------------------------------------------//
//*********************** API that require Admin LOGIN *******************//
//------------------------------------------------------------------------//


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


router.post('/addApprovedUserList', function(req, res, next){
  if (req.body.newUserList != undefined && req.body.newUserList.length > 0) {
    getUserListArray(req.body.newUserList, function(newUserList){
        approvedUserDAO.addUsers(newUserList, function(err, tag){
          if(err) {
            if(tag == "find") {
              res.json({success:false, message: "could not find the user"});
            } else if (tag == "save") {
              res.json({success:false, message: "could not save the user"});
            }
          } else {
            res.json({success:true, message:"Successfully Added new users"});
          }
        });  
    });  
  } else {
    res.json({success:false, message: "please enter a user emailID"});
  }
});


router.post('/removeApprovedUserList', function(req, res, next){
  if (req.body.newUserList != undefined && req.body.newUserList.length > 0) {
    getUserListArray(req.body.newUserList, function(newUserList){
      console.log(newUserList);
      approvedUserDAO.removeUsers(newUserList, function(err, tag){
        if(err) {
          if(tag == "find") {
            res.json({success:false, message: "could not find the user" + err});
          } else if (tag == "save") {
            res.json({success:false, message: "could not save the user" + err});
          }
        } else {
          res.json({success:true, message:"Successfully removed Users"});
        }
      });
    });
  } else {
    res.json({success:false, message: "please enter a user emailID"});
  }
});


router.post('/addCompany', function(req,res, next){
  var company = new Company();
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


module.exports.router = router;
