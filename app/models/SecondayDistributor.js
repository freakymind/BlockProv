var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PrDistSchema = new Schema({
	SecDistributorID : {type:String, required:true},
	CompanyAssociated : {type:String, required:true},
	ApprovedBy : {type:String, required:true} 
});

module.exports = mongoose.model('PrimaryDistributor', PrDistSchema)