var express = require('express');
var mongoose = require('mongoose');
var Company = require('./models/Company');

var companyDAO = {};

companyDAO.findCompany = function(company, fieldsReq, cb){
	Company.findOne(company, fieldsReq, function(err, company){
		cb(err, company);
	});
}

module.exports = companyDAO;