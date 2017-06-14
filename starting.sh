#!/bin/bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew install npm
npm install
cd /Users/
mkdir Application
cd Application
mkdir server
cd server
git init
git clone https://github.com/simonidnov/njoy_server_config.git
node server.js
