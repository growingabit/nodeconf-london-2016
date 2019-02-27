FROM node:8

MAINTAINER GrowBit "ehy@growbit.xyz"

WORKDIR /opt

RUN wget -O go-ipfs.tar.gz "https://dist.ipfs.io/go-ipfs/v0.4.18/go-ipfs_v0.4.18_linux-amd64.tar.gz"

RUN tar xvfz go-ipfs.tar.gz

WORKDIR /opt/go-ipfs

RUN ./install.sh

RUN ipfs init

WORKDIR /usr/src/app

COPY package.json .

RUN yarn

COPY subscribe.js .

COPY entrypoint.sh /opt/entrypoint.sh

RUN chmod +x /opt/entrypoint.sh

CMD [ "/entrypoint.sh" ]
