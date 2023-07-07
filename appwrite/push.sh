#!/usr/bin/bash
appwrite functions createDeployment \
  --functionId=64a78f7a144da836d183 \
  --activate=true \
  --entrypoint="main.js" \
  --code="."