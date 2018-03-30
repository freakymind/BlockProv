# Provenance System based on BlockChain

To use bigchainDb wrapper functions, assuming we are accessing from base directory
```
let bcwrapper = require('./app/bigchain/index.js')
```
## Objects
### View object
```
	let view = bcwrapper.getViewObject();
	//Returns the array of Asset objects which are currently owned by the publicKey
	view.getAllCurrentlyOwnedAssetsForPublicKey(publicKey).then((arrayOfAsstObjects)=>{
		...
	}
	//Returns the array of Asset objects which were previously owned by the publicKey
	view.getAllPreviouslyOwnedAssetsForPublicKey(publicKey).then((arrayOfAsstObjects)=>{
		...
	}
```
### Asset Object
```
	let asset = bcwrapper.getAssetObject();
	//Create an asset
	asset.createAsset(privateKey, publicKey, assetdata, metadata).then((responseObject)=>{
		...
	});

	//Get the data in the asset object
	asset.assetdata

	//Get the metadata from the object
	asset.metadata
```
