
const bcwrapper = require('./index.js')
const prettyjson = require('prettyjson');

const alice = bcwrapper.generateKeyPair();
const bob = bcwrapper.generateKeyPair();
const chris = bcwrapper.generateKeyPair();
console.log(alice.publicKey, alice.privateKey)
let view = bcwrapper.getViewObject();
let testAsset = bcwrapper.createAssetObj();
let Utils = bcwrapper.getUtilsObj();

let thirdTxId = null;
let testAsset2 = null;
//Pass in the privatekey, publickey, assetData and metadata while asset creation
testAsset.createAsset( alice.privateKey,alice.publicKey, {"one":"two"}, {"three":4}).then((resp)=>{
	let anotherAssetForAlice = bcwrapper.createAssetObj();
	return anotherAssetForAlice.createAsset( alice.privateKey,alice.publicKey, {"Yo":"waddup"}, {"Two PLus Two minus one":3})
}).then((resolved)=>{
	return testAsset.transferAsset(alice.privateKey, bob.publicKey)
}).then((resolved)=>{
	console.log("Second");
	//console.log(prettyjson.render(resolved));
	return testAsset.transferAsset(bob.privateKey, chris.publicKey, {"new":"fresh"});
}).then((resolved)=>{
	//console.log("Third");
	//console.log(prettyjson.render(resolved));
	return testAsset.transferAsset(chris.privateKey, alice.publicKey, {"new":"freshest"});
}).then((resolved)=>{
	thirdTxId = resolved.id;
	console.log("Fourth");
	//console.log(prettyjson.render(resolved));
	return ;
}).then(()=>{	
	return view.getAllCurrentlyOwnedAssetsForPublicKey(chris.publicKey);
	
}).then((resp)=>{
	//This was returned from the view.getAllCurrentlyOwnedAssetsForPublicKey(alice.publicKey);
	
	console.log(prettyjson.render(resp))
	return view.getAllPreviouslyOwnedAssetsForPublicKey(alice.publicKey);
}).then((resp)=>{
	//This is the reponse from view.getAllPreviouslyOwnedAssetsForPublicKey(alice.publicKey);
	//console.log(prettyjson.render(resp))
	testAsset2 = bcwrapper.createAssetObj();
	return testAsset2.createAssetFromId(thirdTxId);

}).then((respCreated)=>{
	return respCreated;// testAsset2.transferAsset(bob.privateKey, chris.publicKey,{"Zoop":"Zoop"});

}).catch((err) =>{

	console.log(err);
})





			