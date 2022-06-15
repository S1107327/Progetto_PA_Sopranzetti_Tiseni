
FROM node:lts-stretch-slim

RUN apt-get update \
	&& apt-get install -y openssl \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /var/cache/apt/*

WORKDIR /home/node/app

COPY package.json ./

RUN npm install

COPY . .

RUN mkdir certcnf

RUN mkdir certificati

RUN mkdir documenti

RUN cd documenti ; mkdir signed ; mkdir src



