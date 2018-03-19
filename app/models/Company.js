var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var validate  = require('mongoose-validator');

var CompanySchema = new Schema ({
    companyName : {type:String, required:true},
    companyId   : {type:String, required:true},
    location    : {type:String, required:true},
    regNumber   : {type:String, required:true},
    type        : {type:String, required:true}

});

module.exports= mongoose.model('Company',CompanySchema);