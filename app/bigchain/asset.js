"use strict";
const driver = require('bigchaindb-driver');
const prettyjson = require('prettyjson');
module.exports = class Asset{


	//Constructor for the object in case asset is being newly created
	constructor(conn){
		this.conn = conn;
		this.isValid = false;

	}



	//TODO: Validate asset
	//Currently passes all types of asset data
	validateAsset(asset){
		if(false)
		{
			throw new Error("Asset validation failed");
		}

	}


	//Create the asset
	createAsset(privateKey, publicKey, assetdata, metadata ){
		this.publicKey = publicKey;
		this.assetdata = assetdata;
		this.metadata = metadata;
		//THis variable checks if the asset is valid i.e createAsset has been called successfully atleast once
		
		this.validateAsset(assetdata);
		return new Promise((resolve, reject)=>{

			console.log("Here");
			const createdTransaction = driver.Transaction.makeCreateTransaction(
				this.assetdata,
				this.metadata,
			    [driver.Transaction.makeOutput(
		        	driver.Transaction.makeEd25519Condition(this.publicKey))
		        ],
	        	this.publicKey
		    )
			// Sign the transaction with private keys of user who is creating this
			this.signedTransaction = driver.Transaction.signTransaction(createdTransaction, privateKey);
			this.transactionId = this.signedTransaction.id;
						console.log("Here2");

			this.conn.postTransaction(this.signedTransaction).then(()=>{
							console.log("Here3");

				return this.conn.pollStatusAndFetchTransaction(this.transactionId)
			}).then((res)=>{
				//Incase of success
				resolve(res);

			},(res)=>{
				//Incase of failure
				reject(res)
			})

		});
		//Creating the transaction object

	}




	transferAsset(fromPrivateKey, toPublicKey, metadata){
		//

		return new Promise((resolve, reject)=>{
			this.getAssetState().then((status)=>{
				if(status["status"] != "valid")
					throw Error("Asset is not in valid state")

				const txTransfer = driver.Transaction.makeTransferTransaction(
	                        // signedTx to transfer and output index
	                        [{ tx: this.signedTransaction , output_index: 0 }],
	                        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(toPublicKey))],
	                        // metadata
	                        metadata
	                )
	                // Sign with alice's private key
	                this.signedTransaction = driver.Transaction.signTransaction(txTransfer, fromPrivateKey)
	                // Post and poll status
	                return this.conn.postTransaction(this.signedTransaction);

			}).then(res => {
	                return this.conn.pollStatusAndFetchTransaction(res.id)
	        })
	        .then(tx => {
	                if( tx['outputs'][0]['public_keys'][0] == toPublicKey && tx['inputs'][0]['owners_before'][0] == this.publicKey){
	                	this.publicKey = toPublicKey;
	                	this.transactionId = tx.id;
	                	this.metadata = metadata;
	                	resolve(tx)
	                }
	                else{
	                	reject (Error("Mismatch in owners"));
	                }
	        }).catch((e)=>{
	        	reject(e);
	        })
		})




	}



	getAssetState(){
		if(this.transactionId == undefined){
			throw Error("Asset id is not set for this asset");
		}
		return new Promise((resolve,reject)=>{
			this.conn.getStatus(this.transactionId).then(status => {
				if(status) resolve(status);
				else reject();
			});
		});
	}

	getAssetStatus(id){
		if(this.transactionId == undefined){
			throw Error("Asset id is not set for this asset");
		}
		return new Promise((resolve,reject)=>{
			this.conn.listTransactions(id).then(status => {
				if(status) resolve(status);
				else reject();
			});
		});
	}






}