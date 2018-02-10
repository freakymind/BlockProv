//core modules
var express 		= require('express');
var path        = require('path');
var jwt         = require('jsonwebtoken');

//loacl modules
var User 				= require('./models/User');
var countryData = require('../resources/countries');
let appDetails = require('../package.json')
//instances
var router  		= express.Router();
var app         = express();
var secret      = "blockchain" //a secret key which helps decrypt out token
router.use(express.json());
router.use(express.urlencoded({extended: true}));

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

//User Login
router.post('/login', function(req, res, next){
  User.findOne({username: req.body.username}, function(err, user) {
    if(user) {
      if (user.authUser(req.body.password)) {
        var token = jwt.sign({username: user.username, email: user.email, fullname: user.fullname, role: user.role}, secret, { expiresIn: '10h' });
        console.log(token);
        res.json({success:true, message:"correct credentials", token:token});
      } else {
        res.json({success:false, message:"incorrect credentials"});
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
	res.end(`PONG, version ${appDetails.version}`);
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


router.get ('/getCurrentUser', function(req, res, next) {
    res.json({success:true, token:req.decoded});
});

router.get ('/getCurrentUserAllDetails', function(req, res, next) {
    console.log(req.decoded.username);
    User.findOne({username:req.decoded.username}, function(err, user) {
      res.json({success:true, user:{username:user.username, address:user.address, country:user.country, email:user.email, fullname:user.fullname, phone_no:user.phone_no}});
    });
});


router.get ('/getCurrentUserRole', function(req, res, next) {
    res.json({success: true, role: req.decoded.role});
});

router.get ('/getAllUsers', function(req, res, next) {
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

router.delete ('/deleteUser', function(req, res, next){
  if(req.decoded.role == 'admin') {
    User.deleteOne({id:req.body.id}, function(err){
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




module.exports.router = router;
