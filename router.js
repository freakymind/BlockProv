var express 		= require('express');
var path        = require('path');
var User 				= require('./app/models/User');
var countryData = require('./resources/countries');
var router  		= express.Router();
var app         = express();

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.post('/user', function(req, res, next){
  var user = new User();
  user.username = req.body.username;
  user.password = req.body.password;
  user.email    = req.body.emailid;
  user.country  = req.body.address;
  user.phone_no = req.body.phone_no;
  user.address  = req.body.address;
  user.fullname = req.body.fullname;

  user.save(function(err){
    if (err) {
      res.json({success: false, message : "Signup Failed"});
    } else {
      res.json({success: true, message : "Signup Successful"});
    }
  });
});

router.post('/login', function(req, res, next){
  User.findOne({username: req.body.username}, function(err, user) {
    console.log(user);
    if (user.authUser(req.body.password)) {
      res.json({success:true});
    } else {
      res.json({success:false});
    }
  });
});

router.get('/userRegCountries', function(req, res, next) {
	res.json(countryData);
});

module.exports.router = router;
