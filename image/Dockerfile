FROM node:lts-stretch-slim

RUN apt update && apt-get install perl -y &&  \
apt-get install gcc -y && apt install make -y && apt-get install wget -y

WORKDIR /usr/local/openssl

RUN wget https://www.openssl.org/source/openssl-3.0.3.tar.gz

RUN tar -xvf openssl-3.0.3.tar.gz

WORKDIR /usr/local/openssl/openssl-3.0.3

RUN ./Configure

RUN make

RUN make install

ENV LD_LIBRARY_PATH=/usr/local/lib64
