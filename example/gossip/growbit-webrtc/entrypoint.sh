#!/bin/bash

set -x -e

apt-get update
apt-get install -y zip

cd /opt

wget -O go-ipfs.tar.gz "https://dist.ipfs.io/go-ipfs/v0.4.18/go-ipfs_v0.4.18_linux-amd64.tar.gz"

tar xvfz go-ipfs.tar.gz

cd go-ipfs

./install.sh

ipfs init

ipfs daemon &

# seems the http gateway start before the complete bootstrap
#curl --output /dev/null --silent --retry 5 --retry-connrefused --head --fail http://localhost:8080/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme

echo "wait 10s for ipfs daemon bootstrap"

sleep 10

cd /opt/oracle

zip oracle.zip *

ORACLE_DAG=`ipfs add -Q oracle.zip`

cd /usr/src/app

yarn

set +e

curl --output /dev/null --silent --head --fail --retry 5 --silent https://cloudflare-ipfs.com/ipfs/${ORACLE_DAG}

curl --output /dev/null --silent --head --fail --retry 5 --silent https://gateway.ipfs.io/ipfs/${ORACLE_DAG}

set -e

ORACLE_DAG=$ORACLE_DAG node publisher.js
