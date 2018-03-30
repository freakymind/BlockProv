"use strict";
const driver = require('bigchaindb-driver');
const prettyjson = require('prettyjson');
const Utils = require('./utils.js')

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
			
			//Incase create transaction asset id is same as transaction id
			this.transactionId = this.signedTransaction.id;
			this.assetId = this.signedTransaction.id;

			//Posting the 
			this.conn.postTransaction(this.signedTransaction).then(()=>{
				return this.conn.pollStatusAndFetchTransaction(this.transactionId)
			}).then((res)=>{
				//Incase of success
				//The asset has been successfully initialised
				this.valid = true;
				resolve(res);
			},(res)=>{
				//Incase of failure
				reject(res)
			})
		});
		//Creating the transaction object
	}

	createAssetFromId(fromTransactionId){

		return new Promise((resolve,reject)=>{
			let util = new Utils(this.conn)
			util.getTransactionDetails(fromTransactionId).then((responseObj)=>{

				this.transactionId = responseObj.id;
				this.publicKey = responseObj['outputs'][0]['public_keys'][0];
				this.signedTransaction = responseObj;
				if(responseObj.operation == "CREATE"){
					this.assetID = responseObj.id;
					this.assetdata = responseObj.asset.data;
					this.isValid = true;
					resolve(responseObj);
				}
				else {
					//We have to fetch the asset, since only assetid present incase of TRANSFER transaction
					util.getCreatedAsset(responseObj.asset.id).then((resp)=>{
						this.assetID = responseObj.asset.id
						this.assetdata = resp[0].asset.data;
						this.isValid = true;
						resolve(responseObj);
					});
					
				}
				
				//Initialized from
				
			}).catch((err)=>{
				reject(err);
			});
		})
	}

	transferAsset(fromPrivateKey, toPublicKey, metadata){
		return new Promise((resolve, reject)=>{
			//This for checking that if create methods have run on this object
			//This is necessary since constructors couldn't handle async tasks
			//So initialization was not possible in constructor
			if(this.valid == false){
				reject(new Error("Not initiated"))
			}
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
		if(this.valid == false){
			throw Error("Asset id is not set for this asset");
		}
		return new Promise((resolve,reject)=>{
			this.conn.getStatus(this.transactionId).then(status => {
				if(status) resolve(status);
				else reject();
			});
		});
	}
	

	
}