#!/bin/bash

set -x -e

DEBUG=* node subscriber.js 2>&1 | tee -a /opt/node.log

ORACLE_DAG=`curl --silent "https://ipfs.infura.io:5001/api/v0/add?pin=false" -X POST -H "Content-Type: multipart/form-data" -F file=@"/opt/node.log" | jq -r ".Hash"`

set +e

curl --output /dev/null --silent --head --fail --retry 5 --silent https://cloudflare-ipfs.com/ipfs/${ORACLE_DAG}

curl --output /dev/null --silent --head --fail --retry 5 --silent https://gateway.ipfs.io/ipfs/${ORACLE_DAG}

set -e

echo $ORACLE_DAG
