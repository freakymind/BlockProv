
const bcwrapper = require('./index.js')
const prettyjson = require('prettyjson');

const alice = bcwrapper.generateKeyPair();
const bob = bcwrapper.generateKeyPair();
const chris = bcwrapper.generateKeyPair();
console.log(alice.publicKey, alice.privateKey)

let testAsset = bcwrapper.createAssetObj();

//Pass in the privatekey, publickey, assetData and metadata while asset creation
testAsset.createAsset( alice.privateKey,alice.publicKey, {"one":"two"}, {"three":4}).then((resp)=>{
	//console.log(prettyjson.render(resp))
	//For passing
	console.log("alice ", alice.publicKey);
	testAsset.transferAsset(alice.privateKey, bob.publicKey).then((resolved)=>{
		
		testAsset.transferAsset(bob.privateKey, chris.publicKey, {"new":"fresh"}).then((resolved)=>{
			console.log("Success transfer 2 times", resolved.asset.id)
			testAsset.transferAsset(chris.privateKey, alice.publicKey, {"new":"freshest"}).then((resolved)=>{
				console.log("Success transfer 3 times",prettyjson.render(resolved.asset.id))
				testAsset.getAssetStatus(resolved.asset.id).then((resolved)=>{
					//console.log(prettyjson.render(resolved));
					let viewAssets = bcwrapper.getViewObject();
					viewAssets.getAllAssetsForPublicKey(alice.publicKey).then((op)=>{
						console.log(op);
					})



				}, (rejected)=>{})
			}, (rejected )=>{
				console.log("Fail message",rejected)
			});
		}, (rejected )=>{
			console.log("Fail message",rejected)
		});
	}, (rejected )=>{
		console.log("Fail message",rejected)
	});

}).catch((err) =>{
	console.log(err);
});

