# Ride Share Market API

This is a Node.js HTTP API application.

This HTTP API layer for ridesharemarket.com sits between the [DATA](https://github.com/rudijs/ride-share-market-data) and APP applications.

## Overview

This API should adhere to the [JSON API specification](http://jsonapi.org).

JSON API requires use of the JSON API media type (application/vnd.api+json) for exchanging data for all requests.

Header example:

`Content-Type: application/vnd.api+json`

Error responses will be a collection keyed with "errors".
An error response may have one or more error objects with these properties:
- code - Application/machine message
- title - Human readable message

## Dependencies

- `npm install -g gulp pm2`

## Install

- `git clone git@github.com:rudijs/ride-share-market-api.git`
- `cd ride-share-market-api && git checkout develop`
- `npm install`

## Configure

- `gulp init`
- Update the development and test .json files (ie. UPDATE-THIS-VALUE)
- The MongoDB database needs a some default users created for the tests to pass.
- `mongo rsm-dev`
- `db.users.insert({"email": "net@citizen.com","currentProvider": "google","providers": {"google": {"displayName": "Net Citizen","url": "https://plus.google.com/103434308786179622443","image": {"url": "https://lh3.googleusercontent.com/photo.jpg?sz=50","isDefault": true}}}})`
- Copy the _id from the new user to [test/fixtures/user_id.txt](test/fixtures/user_id.txt)
- `db.users.insert({"email": "web@citizen.com","currentProvider": "google","providers": {"google": {"displayName": "Web Citizen","url": "https://plus.google.com/103434308786179622444","image": {"url": "https://lh4.googleusercontent.com/photo.jpg?sz=50","isDefault": true}}}})`
- Copy the _id from the new user to [test/fixtures/user2_id.txt](test/fixtures/user2_id.txt)
- `db.users.find()`

## Gulp Tasks

- `gulp help`

## Unit Tests

- `gulp test`
- `gulp watch-test`

## Run dev server

- No delay
- `gulp serve`
- 750ms delay
- `gulp serve --devdelay`
    

## API Tests (requires a running server)

- `gulp test-api`

## Development Tools

- `gulp watch-lint`

## Manual

- `curl -v  -H "Accept: application/vnd.api+json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiTmV0IENpdGl6ZW4iLCJpYXQiOjE0MDYyNjc1ODB9.nD4JZi4XRwT8eJcdHyc8Ut9vfjFAW_52teSfgL4EeKc" 127.0.0.1:3001/rideshares`

## Docker

Build and run docker container locally.

- `cd ride-share-market-api`
- `mkdir -p "$(pwd)/tmp/log"`
- `sudo chown rsm-data "$(pwd)/tmp/log"`
- `sudo docker run -d --name rsm-api -v $(pwd)/tmp/log/:/srv/ride-share-market-api/log -p 3001:3001 -t rudijs/rsm-api:0.0.1`

Build docker image locally, tag it, push it to the private docker registry.
- `./docker-build.sh x.x.x`

Deploy on remote server.
- `sudo docker pull 192.168.33.10:5000/rudijs/rsm-api:x.x.x`
- `sudo docker rm -f -v rsm-api && sudo docker run -d --restart always --name rsm-api --cap-add SYS_PTRACE --security-opt apparmor:unconfined -p 3001:3001 192.168.33.10:5000/rudijs/rsm-api:x.x.x`
- Note: the *--cap-add SYS_PTRACE --security-opt apparmor:unconfined* flags above are required for pm2. See [here](https://github.com/Unitech/PM2/issues/1086)
- Note: the docker container will export the application directory as a docker volume.
- This data-volume is used by other containers (eg. logstash, nginx).


### Patch for Solarized theme

'patch' mocha to update the colours to a more solarized-friendly version. Run it in your working directory after an npm install to affect local versions of mocha, or in /usr/lib/node_modules (on my unix machine at least) to affect a global install of mocha.

    sudo apt-get install ack-grep
    pushd node_modules/mocha
    ack-grep -li "'pass': 90" --noignore-dir=node_modules | xargs sed -i "s/'pass': 90/'pass': 92/; s/'error stack': 90/'error stack': 92/; s/'fast': 90/'fast': 92/; s/'light': 90/'light': 92/; s/'diff gutter': 90/'diff gutter': 92/; s/'diff added': 42/'diff added': 34/; s/'diff removed': 41/'diff removed': 33/"
    popd
