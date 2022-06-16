
FROM node-openssl

WORKDIR /home/node/app

COPY package.json ./

RUN npm install

COPY . .

RUN mkdir cnfFiles

RUN mkdir certificati

RUN mkdir documenti

RUN cd documenti ; mkdir signed ; mkdir src



