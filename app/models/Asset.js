var mongoose 	= require('mongoose');
var Schema 		= mongoose.Schema;
var validate 	= require('mongoose-validator');

var AssetSchema = new Schema ({
	product_ref		: {type:String, required:true},
	company_ref		: {type:String, required:true},
	upc_a			: {type:String, required:true},
	country_code	: {type:String, required:true},
	brand			: {type:String, required:true},
	product_name	: {type:String, required:true},
	model			: {type:String, required:true},
	weight			: {type:String, required:true},
	product_dim		: {type:String, required:true}
});


module.exports = mongoose.model('Asset', AssetSchema);