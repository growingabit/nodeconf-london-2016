var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var memdb = require('memdb')
var sodium = require('sodium')
var hsodium = require('hyperlog-sodium')
var hyperlog = require('hyperlog')
var freeice = require('freeice')
var debug = require('debug')('growbit-subscriber')

process.env.PUB_KEY = process.env.ARG0
process.env.TURN_USERNAME = process.env.ARG1
process.env.TURN_CREDENTIAL = process.env.ARG2

var pubKeyHex = process.argv[2] || process.env.PUB_KEY
var publicKey = Buffer.from(pubKeyHex, 'hex')
var log = hyperlog(memdb(), hsodium(sodium, { publicKey: publicKey }))

var hubs = [
    'https://signalhub-growbit.herokuapp.com'
]

var iceServers = freeice()

if ( process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL) {
    var turnServer = { username: process.env.TURN_USERNAME,
        credential: process.env.TURN_CREDENTIAL,
        url: 'turn:numb.viagenie.ca',
        urls: [ 'turn:numb.viagenie.ca?transport=tcp'  ] }

    iceServers.push(turnServer)
}

var sw = swarm(
    signalhub(pubKeyHex, hubs),
    {
        wrtc: require('wrtc'),
        config: {
            iceServers: iceServers
        }
    }
)

log.createReadStream({ live: true, limit: 1 })
    .on('data', function (node) {
            debug('### ON DATA ####\n', {
                value: node.value.toString("UTF-8"),
                change: node.change,
                key: node.key,
                seq: node.seq
            })
            debug(`swarm shutdown...`)
            sw.close()
    })

sw.on('peer', function (peer, id) {
 var peerData = {
        channelName: peer.channelName,
        remoteAddress: peer.remoteAddress,
        remotePort: peer.remotePort,
        localPort: peer.localPort
    }

  debug(`peer id ${id}`, peerData)
  peer.pipe(log.replicate()).pipe(peer)
})
