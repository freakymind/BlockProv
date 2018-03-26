"use strict";
const prettyjson = require('prettyjson');
const request = require('request-promise')
let Asset =  require('./asset.js');
const async = require('async');
module.exports = class View {
	constructor(conn){
		this.conn = conn;
		this.isValid = false;
	}
	getAllCurrentlyOwnedAssetsForPublicKey(publicKey){
		return this.getAllOwnedAssetsForPublicKey(publicKey, false)
	}
	getAllPreviouslyOwnedAssetsForPublicKey(publicKey){
		return this.getAllOwnedAssetsForPublicKey(publicKey, true);
	}

	//INternal method, do not directly call this
	getAllOwnedAssetsForPublicKey(publicKey, spent){
		return new Promise((resolve, reject)=>{

			let options = {
			    uri: this.conn.path+'outputs',
			    qs: {
			        public_key: publicKey,
			        spent:spent
			    },
			    json: true 
			};
			request(options).then((arrayOfTransactionIds)=>{
				//Transforming each transactionId to a full asset
				async.map(arrayOfTransactionIds, (item, callback)=>{
					let tempAsset = new Asset(this.conn);
					tempAsset.createAssetFromId(item.transaction_id).then(()=>{
						callback(null, tempAsset);
					});
				},(err, resultArray)=>{
					if(err)
						reject(Error("Unable to map transactions to assets"));
					else
						resolve(resultArray);

				});
			});
		})
		
	}
}