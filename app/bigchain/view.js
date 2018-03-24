"use strict";
const driver = require('bigchaindb-driver');
const prettyjson = require('prettyjson');

module.exports = class View {
	constructor(conn){
		this.conn = conn;
		this.isValid = false;
	}

	getAllAssetsForPublicKey(publicKey){
		return new Promise((resolve, reject)=>{

			this.conn.listOutputs(publicKey).then((response)=>{
				console.log("List all assets function");
				console.log(response);
				resolve(response);
			},(error)=>{
				reject(error);
			})
		})
	}


}