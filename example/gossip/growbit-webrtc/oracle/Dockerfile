FROM node:8

MAINTAINER GrowBit "ehy@growbit.xyz"

RUN apt-get update && apt-get install -y jq

WORKDIR /usr/src/app

COPY package.json .

RUN yarn

COPY subscriber.js .

COPY entrypoint.sh /opt/entrypoint.sh

RUN chmod +x /opt/entrypoint.sh

CMD [ "/opt/entrypoint.sh" ]
