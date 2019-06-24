#!/bin/bash
killall chromium-borwser
killall node
cd /home/pi/njoy
sleep 4
node server2.js
