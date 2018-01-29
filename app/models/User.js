var mongoose 	= require('mongoose');
var bcrypt 		= require('bcrypt-nodejs');
var Schema 		= mongoose.Schema;
var titlize 	= require('mongoose-title-case');
var validate = require('mongoose-validator');

var fullnameValidation = [
	validate({
		validator : 'matches',
		arguments : /^(([a-zA-Z]{2,20})+[ ]+([a-zA-Z]{2,20})+)+$/,
		message : 'name should have a space in between, no special chars or number and max length of 30 characters' 
	}),
	validate({
		validator : 'isLength',
		arguments : [3, 30],
		message : 'length of Full Name should be between {ARGS[0]} and {ARGS[1]} characters'
	}) 
];

var usernameValidation = [
	validate({
		validator : 'isAlphanumeric',
		message : 'Username must contain letters and numbers only' 
	}),
	validate({
		validator : 'isLength',
		arguments : [3, 30],
		message : 'length of Username should be between (ARGS[0]) and (ARGS[1]) characters'
	}) 
];

// var passwordValidation = [
// 	validate({
// 		validator : 'matches',
// 		arguments : '/^$/'
// 		message : 'Username must contain letters and numbers only' 
// 	}),
// 	validate({
// 		validator : 'isLength',
// 		arguments : [3, 30],
// 		message : 'length of Username should be between (ARGS[0]) and (ARGS[1]) characters'
// 	}) 

var emailValidation = [
	validate({
// ];
		validator : 'isEmail',
		message : 'Username must contain letters and numbers only' 
	}),
	validate({
		validator : 'isLength',
		arguments : [3, 50],
		message : 'length of email should be between (ARGS[0]) and (ARGS[1]) characters'
	}) 
];
var UserSchema 	= new Schema({
	username 	: {type:String, required:true, unique:true, validate : usernameValidation},
	password 	: {type:String, required:true},
	country 	: {type:String, required:true},
	address 	: {type:String, required:true},
	fullname	: {type:String, required:true, validate : fullnameValidation},
	phone_no	: {type:Number, required:true},
	email 		: {type:String, lowercase:true, required:true, unique:true, validate : emailValidation}
});

// , validate : fullnameValidation
//console.log(UserSchema);

UserSchema.pre('save', function(next){
	var user = this;
	bcrypt.hash(user.password, null, null, function(err, hash){
		if (err) {
			return next(err);
		} else {
			user.password = hash;
			next();
		}
	});
});

//hook added to titalize the fullname
UserSchema.plugin(titlize, {
  paths: [ 'fullname' ]
});

//creating instance methods 'refer mongoose'
UserSchema.methods.authUser = function(password) {
	return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema); // (model_name, Schema)
//console.log(UserModel);
