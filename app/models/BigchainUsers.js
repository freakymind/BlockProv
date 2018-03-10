const driver = require('bigchaindb-driver')
const alice = new driver.Ed25519Keypair()
const bob = new driver.Ed25519Keypair()

module.exports={'alice' : alice.publicKey,
'bob':bob.publicKey,
'driver': driver}

