the disintermediated web

---
# the web

an era of dumb terminals

---
# the web: new browser features

* webrtc
* IndexedDB
* Media{Recorder,Source}
* webgl

---
# the problem

too much technology depends on centrally controlled servers:

* requires an internet connection
* high latency
* copyright/political/economic censorship

---
# platform paternalism

* real-name policies
* requiring a mobile phone number
* platforms can turn off access whenever they want

---
# p2p

* datacenters are already distributed systems
* move the algorithms out to the clients
* then cut out the middlemen (servers)

---
# the best way to build a distributed p2p system

have a problem that centralized services cannot solve well:

* offline
* data replication
* live streaming
* very large files

(not an exaustive list)

---
# things that are hard with p2p

* global concensus (Don't have this problem in the first place)
* availability

---
# things that are easy with p2p

and hard/impossible with centralized services:

* infinitely scalable file transfer
* log-based data replication
* offline/marginal networking

---
# computing on the edges

EVERYTHING happens on the client.

The client is the only place where anything CAN happen.

Servers are clients, too.

---
# create an account

```
var sodium = require('chloride/browser')
var keypair = sodium.crypto_sign_keypair()
var keys = {
  publicKey: keypair.publicKey.toString('hex'),
  secretKey: keypair.secretKey.toString('hex')
}
console.log('PUBLIC KEY:', keys.publicKey)

var fs = require('fs')
fs.writeFile('keys.json', JSON.stringify(keys))
```

---
# sign

```
var sodium = require('chloride/browser')
var keypair = require('./keys.json')
var secretKey = Buffer(keypair.secretKey, 'hex')

var msg = new Buffer('hello london!')
var sig = sodium.crypto_sign_detached(msg, secretKey)
console.log(sig.toString('hex'))
```

---
# verify

```
var sodium = require('chloride/browser')
var publicKey = Buffer(require('./keys.json').publicKey, 'hex')
var sig = Buffer(process.argv[2], 'hex')

var msg = new Buffer('hello london!')
var ok = sodium.crypto_sign_verify_detached(sig, msg, publicKey)
console.log(ok)
```

---
# user id

public key or the hash of a public key

store the user id on a DHT or don't

---
# anarchitecture

architectures for services that nobody can own:

* DHTs (used by bittorrent, ipfs)
* kappa architecture (sometimes called "event sourcing")

---
# kappa architecture

append-only log is the source of truth

---
# some node/browser primitives

* webrtc-swarm
* hyperlog
* hypercore
* hyperdrive
* webtorrent/torrent-stream
* ipfs

---
# demo: p2p irc

---
# demo: p2p live streaming

---

