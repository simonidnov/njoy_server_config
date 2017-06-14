# njoy_server_config
#1 Configuration du serveur node local et scripts pour création d'un hotspot wifi 
#2 DOWNLOAD et install l'app desktop
#3 instructions à suivre pour l'app mobile et autres clients desktop ou web

------------------------------------ OSX CONFIG --------------------------------------

first step install git manually on osx :
https://git-scm.com/downloads

upgrade default git bin path to run git without xcode :
echo "PATH=/usr/local/git/bin:\$PATH" >> ~/.bash_profile

source your bash profile :  
source ~/.bash_profile

test git install :
git --version

------------------------------------- OSX LOCAL REPOSITORY ---------------------------

create your local repository :
cd /Users 
sudo mkdir Applications
cd Applications/
sudo mkdir njoy
cd njoy/
sudo mkdir server
cd server/
git init
git remote add origin https://github.com/simonidnov/njoy_server_config.git
git pull -u origin master

------------------------------------ INSTALL HOMEBREW AND NPM -------------------------

run starting.sh
- checking homebrew
- install npm

------------------------------------ INSTALL PACKAGE DEPENDENCIES ---------------------

npm install
cd src/
npm install
cd ../

------------------------------------ CHECKING INSTALL BY RUNING NODE SERVER ------------------

cd /Users/Applications/njoy/server
node server.js

Si la config est bonne on a le log suivant :
app start listenning  8080
listening on *:3000

------------------------------------ CHECK LOCALHOST -----------------------------------------

TEST WEB AUTH LOGIN AT :
http:127.0.0.1:3000

------------------------------------ RUN HOTSPOT APPLE SCRIPT --------------------------------

TEST THE HOT SPOT BY DBLCLICKING ON /server/hotspot_njoy_app.app.zip
hotspot_njoy_app.app.zip

TRY THE HOTSPOT AT http://192.168.0.10:3000

------------------------------------ CHECKING HOTSPOT ON ANOTHER DEVICE ---------------------

Select the hotspot njoy on another device 
then try to accessing on http://192.168.0.10:3000

------------------------------------ DOWNLOAD NJOY DESKTOP BROADCAST APP --------------------

- download desktop version
TODO CREATE ANOTHER REPO WITH PERMISSION TO CHECKOUT THE APP...

------------------------------------ TRY THE BROADCAST SAMPLE WITH YOUR FAVORITE DEVICE -------

- download desktop client version
- run desktop version
