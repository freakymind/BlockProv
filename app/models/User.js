var mongoose 	= require('mongoose');
var bcrypt 		= require('bcrypt-nodejs');
var Schema 		= mongoose.Schema;

var UserSchema 	= new Schema({
	username 	: {type:String, required:true, unique:true},
	password 	: {type:String, required:true},
	country 	: {type:String, required:true},
	address 	: {type:String, required:true},
	fullname	: {type:String, required:true},
	phone_no	: {type:Number, required:true},
	email 		: {type:String, lowercase:true, required:true, unique:true}
});

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

//creating instance methods 'refer mongoose'
UserSchema.methods.authUser = function(password) {
	return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema); // (model_name, Schema)
//console.log(UserModel);
