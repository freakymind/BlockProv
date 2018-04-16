var mongoose = require('mongoose');
var PrDist = require('./models/PrimaryDistributor')

var PrDistDAO = {};

PrDistDAO.addPrimDistributor = function(distID, companyID, creatorID, cb) {
	var prdist = new PrDist

	prdist.PrimDistributorID = distID;
	prdist.CompanyAssociated = companyID;
	prdist.ApprovedBy = creatorID;

	prdist.save(function(err){
		cb(err);
	});
}

PrDistDAO.findPrimDistributor = function(distID, cb){

	PrDist.findOne({PrimDistributorID:distID}, function(err, primDist){
		cb(err, primDist);
	}); 
}

PrDistDAO.findAllDistForUser = function(username, cb) {
	PrDist.find({ApprovedBy:username}, "PrimDistributorID", function(err, PrimDist){
		cb(err, PrimDist);
	});
}

module.exports = PrDistDAO;