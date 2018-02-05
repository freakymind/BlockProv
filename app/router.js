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
    console.log(user);
    if(user) {
      if (user.authUser(req.body.password)) {
        var token = jwt.sign({username: user.username, email: user.email, fullname: user.fullname, role: user.role}, secret, { expiresIn: '5000' });
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

module.exports.router = router;
