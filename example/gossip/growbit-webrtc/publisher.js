var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var memdb = require('memdb')
var sodium = require('sodium')
var hsodium = require('hyperlog-sodium')
var hyperlog = require('hyperlog')
var freeice = require('freeice')
var debug = require('debug')('growbit-publisher')

var ORACLE_DAG = process.env.ORACLE_DAG

var hubs = [
    'https://signalhub-growbit.herokuapp.com'
]

var keypair = sodium.api.crypto_sign_keypair()
var pubKey = keypair.publicKey.toString('hex')
debug(`sodium keypair.publicKey`, pubKey)

var iceServers = freeice()

if (process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL) {
    var turnServer = { username: process.env.TURN_USERNAME,
        credential: process.env.TURN_CREDENTIAL,
        url: 'turn:numb.viagenie.ca',
        urls: [ 'turn:numb.viagenie.ca?transport=tcp'  ] }

    debug(`push authenticated turnServer`, turnServer)

    iceServers.push(turnServer)
}

var sw = swarm(
    signalhub(pubKey, hubs),
    {
        wrtc: require('wrtc'),
        config: {
            iceServers: iceServers
        } //custom webrtc configuration (used by RTCPeerConnection constructor)
    }
)

var log = hyperlog(memdb(), hsodium(sodium, keypair))

sw.on('peer', function (peer, id) {
    var peerData = {
        channelName: peer.channelName,
        remoteAddress: peer.remoteAddress,
        remotePort: peer.remotePort,
        localPort: peer.localPort
    }
    debug(`new peer id ${id} on swarm`, peerData)
    setTimeout(function() {
        var buf = Buffer.from(new Date().toString())
        debug(`appending data over log...`)
        log.append(buf, function (err, node) {
            if (err) {
                console.error(`log.append error callback`, err)
            } else {
                debug(`log.append node.key(${node.key}) success callback`)
            }
        })
    }, 2000)
  peer.pipe(log.replicate()).pipe(peer)
})
