FROM node:lts-stretch-slim

WORKDIR /home/node/app

COPY package.json ./

RUN npm install

COPY . .

RUN mkdir certcnf

RUN mkdir certificati

RUN mkdir documenti

RUN cd documenti ; mkdir signed ; mkdir src



