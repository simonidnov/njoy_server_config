#!/bin/bash
killall chromium-borwser
killall node
cd njoy/
git pull origin master
node server.js
