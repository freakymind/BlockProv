var express = require('express');
var bcrypt = require('bcrypt-nodejs');

var User = require('./models/User');

var userDAO = {};

userDAO.insertUser = function(userDetails, cb){
	var user = new User();
	user.username = userDetails.username;
	user.email    = userDetails.emailid;
	user.country  = userDetails.country;
	user.phone_no = userDetails.phone_no;
	user.address  = userDetails.address;
	user.fullname = userDetails.fullname;
	user.role	  = userDetails.role;
	user.companyName = userDetails.companyName;
	bcrypt.hash(userDetails.password, null, null, function(err, hash){
		if (err) {
			cb(err, "hash");
		} else {
			user.password = hash;
			user.save(function(err){
				cb(err, "save");
			});
		}
	});
}

userDAO.findUserAllDetails = function(user, cb){
	User.findOne(user, function(err, user){
		cb(err, user);
	});
}

userDAO.findUser = function(user, query, cb){
	User.findOne(user, query, function(err, user){
		cb(err, user);
	});
}

userDAO.removeUser = function(user, cb) {
	User.findOneAndRemove(user, function(err){
		cb(err)
	});
}

userDAO.updateUser = function(user, newDetails, cb) {
	if (newDetails.username) {
		user.username = newDetails.username;
	}
	if (newDetails.address) {
		user.address = newDetails.address;
	}
	if (newDetails.country) {
		user.country = newDetails.country;
	}
	if (newDetails.phone_no) {
		user.phone_no = newDetails.phone_no;
	}
	if (newDetails.email) {
		user.email = newDetails.email;
	}
	if (newDetails.username) {
		user.fullname = newDetails.fullname;
	}

	User.save(user, function(err){
		cb(err, "save");
	});
}

module.exports = userDAO;

