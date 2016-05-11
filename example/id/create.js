var sodium = require('chloride/browser')
var keypair = sodium.crypto_sign_keypair()
var keys = {
  publicKey: keypair.publicKey.toString('hex'),
  secretKey: keypair.secretKey.toString('hex')
}
console.log('PUBLIC KEY:', keys.publicKey)

var fs = require('fs')
fs.writeFile('keys.json', JSON.stringify(keys))
