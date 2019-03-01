FROM node:carbon-stretch-slim

MAINTAINER GrowBit "ehy@growbit.xyz"

WORKDIR /usr/src/app

COPY package.json .

# https://github.com/paixaop/node-sodium binary need some deps for build his binary with node-gyp
RUN \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends -y jq curl automake make libtool libtool-bin autoconf libsodium-dev libsodium18 python g++ && \
    yarn --production && \
    yarn autoclean --init && \
    yarn cache clean && \
    yarn autoclean --force && \
    apt-get -y purge automake make libtool libtool-bin autoconf libsodium-dev libsodium18 python g++ && \
    apt-get -y autoclean && \
    apt-get -y clean && \
    apt-get -y autoremove && \
    rm -rf /var/lib/apt/lists/*

COPY subscriber.js .

COPY entrypoint.sh /opt/entrypoint.sh

RUN chmod +x /opt/entrypoint.sh

CMD [ "/opt/entrypoint.sh" ]
