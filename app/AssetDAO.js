var Asset = require('./models/Asset');

var assetDAO = {};

assetDAO.registerAsset = function(assetObj, cb){
	var tempAsset = new Asset();
	tempAsset.product_ref = assetObj.product_ref;
	tempAsset.company_ref = assetObj.company_ref;
	tempAsset.assetId = assetObj.assetId;
	tempAsset.save(function(err){
		cb(err);
	});
}

assetDAO.findAssetID = function(assetDetails, cb){
	Asset.findOne({product_ref:assetDetails.product_ref, company_ref:assetDetails.company_ref}, "assetId", function(err, asset){
		cb(err, asset);
	});
}

module.exports = assetDAO;
