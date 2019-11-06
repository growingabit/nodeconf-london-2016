var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var memdb = require('memdb')
var sodium = require('sodium-browserify')
var hsodium = require('hyperlog-sodium')
var hyperlog = require('hyperlog')
var freeice = require('freeice')
var debugg = require('debug')
var https = require('https')

var debug = debugg('growbit-publisher')
debugg.enable('growbit-publisher')

var ORACLE_DAG = process.env.ORACLE_DAG

var hubs = [
    'https://signalhub-growbit.herokuapp.com'
]

var keypair = sodium.crypto_sign_keypair()
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
        config: {
            iceServers: iceServers
        } //custom webrtc configuration (used by RTCPeerConnection constructor)
    }
)

var log = hyperlog(memdb(), hsodium(sodium, keypair))

function fetchComputationLogs(ipfsDag) {
    var ipfsGatewayUrl = `https://cloudflare-ipfs.com/ipfs/${ipfsDag}`
    debug(`trying to fetch logs from IPFS gateway: ${ipfsGatewayUrl}`)

    https.get(ipfsGatewayUrl, function(response) {
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
            debug(`chunk: ${chunk}`)
        })
        response.on('end', function() {
            debug(`computation logs end`)
        })
    }).on('error', function(err) {
        console.error(`Error during fetchComputationLogs`, {
            err: err
        })
    })
}

function pollingComputation(computation, cb) {
    var computationId = computation.result.id
    setTimeout(function() {
        var computationUrl = `https://api.oraclize.it/api/v1/query/${computationId}/status`
        debug(`pollingComputation ${computationUrl}`)

        https.get(computationUrl, function(response) {
            response.setEncoding('utf8');
            var responseBody = ''
            response.on('data', function(chunk) {
                responseBody += chunk
            })
            response.on('end', function() {
                debug(`pollingComputation on end\n`, responseBody)

                var computationStatus = JSON.parse(responseBody)

                if (!computationStatus.result.active) {
                    debug(`computation complete!`)

                    sw.close()

                    if (computationStatus.result.checks[0].results && computationStatus.result.checks[0].results.length > 0) {
                        debug(`computation success!`)

                        var computationResult = computationStatus.result.checks[0].results[0]

                        fetchComputationLogs(computationResult)

                        if (typeof cb === 'function') {
                            debug('calling module callback')
                            cb(computationResult)
                        }

                    } else {
                        console.error(`computation error`)
                    }
                } else {
                    debug(`computation still active`)
                    pollingComputation(computation)
                }
            })
        }).on('error', function(err) {
            console.error(`Error during pollingComputation`, {
                err: err
            })
        })
    }, 10000)
}


var oraclizeComputationPayload = JSON.stringify({
    datasource: 'nested',
    proof_type: 17,
    query: `[computation] ['${ORACLE_DAG}', '${pubKey}']`
})

function startOraclizeComputation(cb) {
    debug('startOraclizeComputation')
    var oraclizeComputation = https.request(
        {
            method: 'POST',
            hostname: 'api.oraclize.it',
            path: '/api/v1/query/create',
            headers: {
                'Content-Type' : 'application/json',
                'Content-Length': Buffer.byteLength(oraclizeComputationPayload)
            }

        },
        function(response) {
            response.setEncoding('utf8');
            var responseBody = ''
            response.on('data', function(chunk) {
                responseBody += chunk
            })
            response.on('end', function() {
                debug('computation started, polling status..')
                pollingComputation(JSON.parse(responseBody), cb)
            })
        }
    )

    oraclizeComputation.on('error', function(err) {
        console.error('error during computation creation', {
            err: err,
            oraclizeComputationPayload: JSON.parse(oraclizeComputationPayload)
        })
        process.exit(1)
    })
    oraclizeComputation.write(oraclizeComputationPayload)
    oraclizeComputation.end()
}

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

module.exports = startOraclizeComputation
