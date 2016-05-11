var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var memdb = require('memdb')
var sodium = require('chloride/browser')
var hsodium = require('hyperlog-sodium')

var publicKey = process.argv[2]
var log = hyperlog(memdb(), hsodium(sodium, { publicKey: publicKey }))

var hubs = [ 'https://mafintosh.signalhub.com' ]
var sw = swarm(signalhub(publicKey, hubs))

log.createReadStream({ live: true })
  .on('data', console.log)

sw.on('peer', function (peer, id) {
  peer.pipe(log.replicate()).pipe(peer)
})
