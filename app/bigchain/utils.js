
"use strict";
let prettyjson = require('prettyjson');
let request = require('request-promise');

module.exports = class Utils{
	constructor(conn){
		this.conn = conn;
	}

	// getTransactionDetails(transactionId){
	// 	if(transactionId == null){
	// 		throw Error("Transaction id null");
	// 	}
	// 	return new Promise((resolve, reject)=>{
	// 		this.conn.pollStatusAndFetchTransaction(transactionId).then((response)=>{
	// 			resolve(response);
	// 		}).catch((err)=>{
	// 			reject(err);
	// 		});

	// 	}) 
	// }

	getTransactionDetails(transactionId) {
		if(transactionId == null){
			throw Error("Transaction id null");
		}
		return new Promise((resolve, reject)=>{
			let options = {
			    uri: this.conn.path+'transactions/' + transactionId,
			    json: true 
			};
			
			resolve(request(options));

		})
	}

	getCreatedAsset(assetId) {
		let options = {
		    uri: this.conn.path+'transactions',
		    qs: {
		        asset_id: assetId,
		        operation:"CREATE"
		    },
		    json: true 
		};
		return request(options);
	}

	getAssetHistory(assetId) {
		let options = {
			uri: this.conn.path+'transactions',
			qs: {
				asset_id: assetId
			},
			json: true
		};
		return request(options);
	}
}