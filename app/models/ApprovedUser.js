var mongoose 	= require('mongoose');
var Schema 		= mongoose.Schema;

var ApprovedUserSchema = new Schema ({
	userList : [String]
});

module.exports = mongoose.model('ApprovedUsers', ApprovedUserSchema);