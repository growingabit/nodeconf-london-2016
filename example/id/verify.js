var sodium = require('chloride/browser')
var publicKey = Buffer(require('./keys.json').publicKey, 'hex')
var sig = Buffer(process.argv[2], 'hex')

var msg = new Buffer('hello london!')
var ok = sodium.crypto_sign_verify_detached(sig, msg, publicKey)
console.log(ok)
