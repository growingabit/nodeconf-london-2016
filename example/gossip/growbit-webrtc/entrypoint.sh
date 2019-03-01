#!/bin/bash

set -x -e

apt-get update
apt-get install -y zip jq

cd /opt/oracle

zip oracle.zip *

curl --silent -o /opt/oracle/infura.json "https://ipfs.infura.io:5001/api/v0/add?pin=false" -X POST -H "Content-Type: multipart/form-data" -F file=@"/opt/oracle/oracle.zip"

jq "." /opt/oracle/infura.json

ORACLE_DAG=`jq -r ".Hash" /opt/oracle/infura.json`

cd /usr/src/app

yarn

set +e

curl --output /dev/null --silent --head --fail --retry 5 --silent https://cloudflare-ipfs.com/ipfs/${ORACLE_DAG}

curl --output /dev/null --silent --head --fail --retry 5 --silent https://gateway.ipfs.io/ipfs/${ORACLE_DAG}

set -e

ORACLE_DAG=$ORACLE_DAG node publisher.js
