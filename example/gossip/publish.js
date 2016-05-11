var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var memdb = require('memdb')
var sodium = require('chloride/browser')
var hsodium = require('hyperlog-sodium')
var split = require('split2')
var through = require('through2')

var hubs = [ 'https://mafintosh.signalhub.com' ]
var sw = swarm(signalhub('hello', hubs))

var keypair = sodium.api.crypto_sign_keypair()
var log = hyperlog(memdb(), hsodium(sodium, keypair))

process.stdin.pipe(split()).pipe(through(function (buf, enc, next) {
  log.append(buf, function (err, node) {
    if (err) console.error(err)
    else console.log(node.key)
  })
}))

sw.on('peer', function (peer, id) {
  peer.pipe(log.replicate()).pipe(peer)
})
