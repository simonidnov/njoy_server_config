var express = require('express');
var app = express();
var router = express.Router();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var _ = require('underscore');
//var router = express.Router();
var users = [];
var server = null;
var os = require('os');
var ifaces = os.networkInterfaces();
var ip_config = get_ip_config();
var spawn = require('child_process').spawn;
var cp = require('child_process');
var robot = require("kbm-robot");
var video_player = null;
$ = require('jquery');



var http2 = require('http');
var fs = require('fs');

var file = fs.createWriteStream("file.jpg");
var request = http2.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function(response) {
  response.pipe(file);
});

/*app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});*/
// routes the app
module.exports = router;
//define static files
app.use(express.static('./src'));

// start server //
app.get('*', function(req, res){
  res.sendFile('njoy/src/index.html', { root: path.join(__dirname, '../')});
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('njoy', function(datas){
        users_activities.push(datas);
        datas = addParams(datas);
        var stat = {},
            call = "njoy";
        switch(datas.status){
            case 'reboot':
              cp.exec("/home/pi/startchromium.sh", function(error, stdout, stderr) {
                console.log("stdout: " + stdout);
                console.log("stderr: " + stderr);
                if (error !== null) {
                    console.log("exec errror: " + error);
                }
              });
            case 'connect':
                stat = login(datas);
                datas = addParams(datas);
                io.emit('njoy_'+datas.uuid, {"status":stat.status, "infos":stat, "datas":datas});
                call = 'njoy';
                break;
            case 'disconnect':
                stat = logout(datas);
                datas = addParams(datas);
                break;
            case 'activities':
                stat.status = "activities";
                datas.users_activities = users_activities;
                break;
            case 'message':
                stat.status = "message";
                break;
            case 'launch_content':
                stat.status = "launch_content";
                //console.log(datas);
                break;
            default:
                stat = {"status":"default"};
                break;
        }
        if(datas.status === "pause_video"){
          //omxp.playPause(function(err){});
          console.log('pause video test robot space');
          robot.startJar();
          robot.press("space")
              .sleep(100)
              .release("space")
              .then(robot.stopJar);
        }
        if(datas.status === "play_video"){
          //omxp.playPause(function(err){});
        }
        if(datas.status === "mute_video"){
            //omxp.playPause(function(err){});
        }
        if(datas.status === "audio_video"){
           //omxp.playPause(function(err){});
        }
        if(datas.status === "stop_video"){
          /*if(video_player !== null){
            video_player.quit();
            video_player = null;
          }*/
          cp.exec("export DISPLAY=:0", function(error, stdout, stderr) {});
          cp.exec("killall omxplayer", function(error, stdout, stderr) {});
        }
        if(datas.status === "video"){
          cp.exec("killall omxplayer", function(error, stdout, stderr) {
              /*if (stderr !== null) {
                  // IF OMXPLAYER COMMEND DOESN'T EXIST ONLY
                  console.log('HEEEEEEEERE WTF !!!');
                  datas.status = "force_video";
                  io.emit(call, {"status":"force_video", "infos":stat, "datas":datas});
              }else{*/

                  /*
                  if(video_player !== null){
                    video_player.quit();
                    video_player = null;
                  }
                  cp.exec("export DISPLAY=:0", function(error, stdout, stderr) {});
                  video_player = Omx("http://10.3.141.1:3000/"+datas.file);
                  video_player.volUp();
                  video_player.play();

                  omxp.open("http://10.3.141.1:3000/"+datas.file, opts);
                  omxp.on('changeStatus',function(status){
                      console.log('Status',status);
                  });
                  omxp.on('aboutToFinish',function(){
                      console.log('File about to finish');
                  });
                  */

                  cp.exec("killall omxplayer.bin", function(error, stdout, stderr) {});

                  console.log("omxplayer -o local /"+datas.file);

                  cp.exec("export DISPLAY=:0", function(error, stdout, stderr) {});

                  cp.exec("omxplayer -o local http://10.3.141.1:3000/"+datas.file, function(error, stdout, stderr) {
                      if (stderr !== null) {
                          console.log("exec errror: " + error);
                      }
                  }, function(e){
                      console.log('catch error omx player');
                  });

              //}
          });
        }else{
          /*if(video_player !== null){
            video_player.quit();
          }*/
          if(datas.status.indexOf("video") === -1){
            cp.exec("killall omxplayer", function(error, stdout, stderr) {
                if (stderr !== null) {
                    console.log("killall omxplayer exec errror: " + error);
                }
            });
            cp.exec("killall omxplayer.bin", function(error, stdout, stderr) {
                if (stderr !== null) {
                    console.log("killall omxplayer exec errror: " + error);
                }
            });
          }
        }
        io.emit(call, {"status":stat.status, "infos":stat, "datas":datas});
    });
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
    cp.exec("/home/pi/startchromium.sh", function(error, stdout, stderr) {
        //console.log("stdout: " + stdout);
        //console.log("stderr: " + stderr);
        if (error !== null) {
            //console.log("exec errror: " + error);
        }
    });
});

var login = function(datas){
  if(typeof users === "undefined"){users = [];};
  if(_.where(users, {user_name:datas.user_name}).length > 0 ){
    return {"status":"login_error", "message":"need uniq pseudo"};
  }
  users.push({"user_name":datas.user_name, "uuid":datas.uuid});
  if(_.where(users, {regis:"true"}).length === 0){
    users[users.length-1].regis = "true";
  }
  return {"status":"login_success", "message":"success login", "users":users};
}
var logout = function(datas){
  require('underscore');
  users = _.without(users, _.findWhere(users, {uuid:datas.uuid}));
  return {"status":"logout_success", "message":"success lougout"};
}

var addParams = function(datas){
  if(typeof datas === "undefined"){
    datas = {};
  }
  datas.users = users;
  datas.animations = animations;
  datas.ip_config = get_ip_config();
  return datas;
}

function get_ip_config(){
  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;
    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        return;
      }
      if (alias >= 1) {
        return iface.address;
      } else {
        return iface.address;
      }
      ++alias;
    });
  });
}
var users_activities = [];
var animations = null;
