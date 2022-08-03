FROM ubuntu:22.04

EXPOSE 5000

ENV HOME=/home/uploader
WORKDIR $HOME

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata \
    && apt-get install -y nginx curl python3 build-essential

RUN export NODEV='18.3.0' \
    && curl "https://nodejs.org/dist/v${NODEV}/node-v${NODEV}-linux-x64.tar.gz" | tar -xzv \
    && cp ./node-v${NODEV}-linux-x64/bin/node /usr/bin/ \
    && ./node-v${NODEV}-linux-x64/bin/npm install -g npm

COPY ./ $HOME/api
WORKDIR $HOME/api

RUN cp ./nginx.conf /etc/nginx/sites-enabled/default

RUN npm install \
    && npm run doc

RUN cd web \
    && npm install \
    && NODE_OPTIONS=--openssl-legacy-provider npm run prod \
    && cd ..

CMD service nginx restart \
    && ./node_modules/.bin/knex migrate:latest \
    && npm run prod
