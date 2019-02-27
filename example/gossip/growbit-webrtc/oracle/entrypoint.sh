#!/bin/bash

set -x -e

ipfs daemon &

DEBUG=* node subscriber.js 2>&1 | tee -a /opt/node.log

ORACLE_DAG=`ipfs add -Q /opt/node.log`

set +e

curl --output /dev/null --silent --head --fail --retry 5 --silent https://cloudflare-ipfs.com/ipfs/${ORACLE_DAG}

curl --output /dev/null --silent --head --fail --retry 5 --silent https://gateway.ipfs.io/ipfs/${ORACLE_DAG}

set -e

echo $ORACLE_DAG
