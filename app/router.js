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

//User Login
router.post('/login', function(req, res, next){
  User.findOne({username: req.body.username}, function(err, user) {
    console.log(user);
    if(user) {
      if (user.authUser(req.body.password)) {
        var token = jwt.sign({username: user.username, email: user.email, fullname: user.fullname}, secret, { expiresIn: '1h' });
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

router.post ('/getCurrentUser', function(req, res, next) {
  jwt.verify(req.body.token, secret, function(err, decoded) {
    if (err) {
        res.json({success:false, token:{}});
    } else {
        res.json({success:true, token:decoded});
    }

  });
});

router.post ('/getCurrentUserAllDetails', function(req, res, next) {
  jwt.verify(req.body.token, secret, function(err, decoded) {
    if (err) {
        res.json({success:false, user:{}});
    } else {
      console.log(decoded.username);
      User.findOne({username:decoded.username}, function(err, user) {
        res.json({success:true, user:{username:user.username, address:user.address, country:user.country, email:user.email, fullname:user.fullname, phone_no:user.phone_no}});
      });
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

module.exports.router = router;
