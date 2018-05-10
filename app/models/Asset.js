var mongoose 	= require('mongoose');
var Schema 		= mongoose.Schema;
var validate 	= require('mongoose-validator');

var AssetSchema = new Schema ({
	product_ref		: {type:String, required:true},
	company_ref		: {type:String, required:true},
	assetId			: {type:String, required:true}
});


module.exports = mongoose.model('Asset', AssetSchema);