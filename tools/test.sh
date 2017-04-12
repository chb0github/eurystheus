#!/usr/bin/env bash

docker kill eurystheus-test || true
docker rm eurystheus-test || true
docker build -t eurystheus .
docker run \
    -e "SERVICE_NAME=eurystheus" \
    -e "EXPIRATION_QUEUE=ncp-cb-1.nintextest.com" \
    -e "EXPIRATION_EXCHANGE=expiration" \
    -e "NODE_ENV=development" \
    --name eurystheus-test \
    eurystheus \
    npm run test
