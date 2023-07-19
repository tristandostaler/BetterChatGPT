#!/usr/bin/bash
cp main.ts main.js
appwrite functions createDeployment \
  --functionId=64a78f7a144da836d183 \
  --activate=true \
  --entrypoint="main.js" \
  --code="."
rm main.js