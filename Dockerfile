FROM node:4.1.2
MAINTAINER Ride Share Market "systemsadmin@ridesharemarket.com"

# sudo required for node app run as non root
# python and build-essential require to compile couchbase module
RUN \
    apt-get -yqq update && \
    apt-get install sudo logrotate python build-essential -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# NPM package cache
COPY package.json /tmp/package.json
RUN \
    cd /tmp && \
    npm install --production && \
    npm install -g pm2 && \
    npm cache clean

# Application
ENV APP_REFRESHED_AT 2015-10-01.1
ENV APP_DIR /srv/ride-share-market-api
RUN \
    mkdir ${APP_DIR} && \
    cp -a /tmp/node_modules/ ${APP_DIR} && \
    mkdir ${APP_DIR}/log && \
    mkdir ${APP_DIR}/pids
COPY config/ ${APP_DIR}/config
COPY httpd/ ${APP_DIR}/httpd
COPY server.js ${APP_DIR}/server.js
COPY package.json ${APP_DIR}/package.json
COPY pm2.json ${APP_DIR}/pm2.json
COPY docker-start.sh ${APP_DIR}/docker-start.sh

# Application User
RUN \
    useradd -c 'RSM Data' -u 2000 -m -d /home/rsm-data -s /bin/bash rsm-data && \
    chown -R rsm-data.rsm-data ${APP_DIR}

# Log Rotation
COPY config/logrotate.conf /etc/logrotate.d/rsm-api
RUN chmod 644 /etc/logrotate.d/rsm-api
RUN cp /etc/cron.daily/logrotate /etc/cron.hourly/logrotate

USER rsm-data

# Export the APP_DIR as a data volume under the app user account.
# Other containers use this volume's data (eg. logstash, nginx).
VOLUME ${APP_DIR}

USER root

# Application Start
WORKDIR ${APP_DIR}

CMD ["./docker-start.sh"]
