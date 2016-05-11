var sodium = require('chloride/browser')
var keypair = require('./keys.json')
var secretKey = Buffer(keypair.secretKey, 'hex')

var msg = new Buffer('hello london!')
var sig = sodium.crypto_sign_detached(msg, secretKey)
console.log(sig.toString('hex'))
