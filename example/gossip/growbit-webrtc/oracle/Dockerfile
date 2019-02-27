FROM node:8

MAINTAINER GrowBit "ehy@growbit.xyz"

# Create app directory
WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock . 

RUN yarn

COPY subscribe.js .

CMD [ "node", "subscribe.js" ]
