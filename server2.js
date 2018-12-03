var express = require('express'),
      app = express(),
      router = express.Router(),
      http = require('http').Server(app),
      path = require('path'),
      io = require('socket.io')(http),
      port = process.env.PORT || 3000,
      _ = require('underscore'),
      users = [],
      teams = [],
      server = null,
      os = require('os'),
      ifaces = os.networkInterfaces(),
      ip_config = get_ip_config(),
      spawn = require('child_process').spawn,
      cp = require('child_process'),
      video_player = null,
      $ = require('jquery'),
      http2 = require('http'),
      fs = require('fs'),
      users_activities = [],
      animations = null,
      playerTimer = null,
      app_volume = .5,
      is_on_seek = false,
      has_omx = false,
      URI = 'http://10.3.141.1:3000/',
      omxDelay = 500;

/* VIDEO INSTANCE */
var omx = require('./modules/omx-interface/index.js'),
    omx_options = {
        audioOutput:'local',
        blackBackground:true,
        disableKeys:true,
        disableOnScreenDisplay:true,
        sizes:"fullscreen"
    };
    omx_audio_options = {
        audioOutput:'local',
        blackBackground:false,
        disableKeys:true,
        disableOnScreenDisplay:true
    };
omx.init_remote({port:8080});

if(typeof omx.quit() === "undefined") {
  console.log('------------------- OMX NOT DEFINED ------------------- ');
  has_omx = false;
}else{
  console.log('------------------- OMX EXIST ------------------------- ');
  has_omx = true;
}
/* END VIDEO INSTANCE */

module.exports = router;
app.use(express.static('./src'));
app.get('/receptor', function(req, res){
  res.sendFile('njoy/src/receptor.html', { root: path.join(__dirname, '../')});
});
app.get('/crazy_show', function(req, res){
  res.sendFile('njoy/src/crazy_show.html', { root: path.join(__dirname, '../')});
});
app.get('/', function(req, res){
  res.sendFile('njoy/src/index.html', { root: path.join(__dirname, '../')});
});

io.on('connection', function(socket){
    socket.on('disconnect', function(){
        //console.log('user disconnected');
    });
    socket.on('njoy', function(datas){
        users_activities.push(datas);
        datas = addParams(datas);
        var stat = {},
            call = "njoy";
        console.log(datas.status);
        //console.log("datas.status ::::::: ", datas.status);
        switch(datas.status){
            case 'chrono_start':
              omx.quit();
              io.emit(call, {"status":"video_stopped"});
              io.emit(call, {"status":"audio_stopped"});
              omx.open(URI+"ressources/audio/attente_30s.mp3", omx_audio_options);
              omx.setVolume(app_volume);
              break;
            case 'chrono_stop':
              omx.quit();
              io.emit(call, {"status":"video_stopped"});
              io.emit(call, {"status":"audio_stopped"});
              break;
            case 'FX':
              omx.open(URI+datas.file, omx_audio_options);
              omx.setVolume(app_volume);
              break;
            case 'KILL_FX':
              omx.quit();
              break;
            case 'reboot':
              cp.exec("/home/pi/njoy/startchromium.sh", function(error, stdout, stderr) {
                if (error !== null) {
                }
              });
            case 'success':
                break;
            case 'fail':
                break;
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
                break;
            case 'teams':
                stat.status = "teams";
                datas.teams = teams;
                break;
            case 'new_team':
                if(_.where(teams, {label:datas.new_team.label}).length > 0 ){
                  stat.status = "error";
                  datas.title = "teams";
                  datas.message = "le nom de la team existe déjà";
                }else{
                  datas.new_team.color = getRandomColor();
                  teams.push(datas.new_team);
                  stat.status = "teams";
                  datas.teams = teams;
                }
                break;
            case 'delete_team':
                if(typeof teams[datas.id] !== "undefined"){
                  delete teams[datas.id];
                  teams.splice(datas.id, 1);
                }
                stat.status = "teams";
                datas.teams = teams;
                break;
            case 'team_score':
                if(typeof teams[datas.id] !== "undefined"){
                  teams[datas.id].score = datas.score;
                }
                stat.status = "teams";
                datas.teams = teams;
                break;
            case 'video':
                //omx.quit();
                if(typeof video_is_playing !== "undefined"){
                  if(video_is_playing){
                    omx.quit();
                    video_is_playing = false;
                    if(playerTimer !== null){
                      clearTimeout(playerTimer);
                      playerTimer = null;
                    }
                    io.emit(call, {"status":"video_stopped"});
                    io.emit(call, {"status":"error", datas:{"title":"video", "message":"Une vidéo était en cours de lecture et vient d'être coupée."}});
                  }else{
                    omx.quit();
                    video_is_playing = false;
                    setTimeout(function(){
                      cp.exec("export DISPLAY=:0", function(error, stdout, stderr) {});
                      if(typeof datas.size !== "undefined") {
                        omx_options.sizes = datas.size;
                      }else {
                        omx_options.sizes = "fullscreen";
                      }
                      omx.open(URI+datas.file, omx_options);
                      omx.setVolume(app_volume);
                      io.emit(call, {"status":"video_started", "duration":omx.getCurrentDuration(), "position":omx.getCurrentPosition()});
                      resetProgressListener();
                    }, 200);
                  }
                }else{
                  omx.quit();
                  video_is_playing = false;
                  setTimeout(function(){
                    cp.exec("export DISPLAY=:0", function(error, stdout, stderr) {});
                    omx.open(URI+datas.file, omx_options);
                    omx.setVolume(app_volume);
                    io.emit(call, {"status":"video_started", "duration":omx.getCurrentDuration(), "position":omx.getCurrentPosition()});
                    resetProgressListener();
                  }, 200);
                }
                break;
            case 'pause_video':
                omx.pause();
                io.emit(call, {"status":"video_pause", "is_running":null, "is_loaded":null});
                break;
            case 'resume_video':
                omx.play();
                io.emit(call, {"status":"video_resume", "is_running":null, "is_loaded":null});
                break;
            case 'play_video':
                omx.play();
                io.emit(call, {"status":"video_play", "is_running":null, "is_loaded":null});
                break;
            case 'volume_video':
                omx.setVolume(datas.volume);
                app_volume = datas.volume;
                io.emit(call, {"status":"video_volume", "volume":datas.volume});
                break;
            case 'seek_video':
                is_on_seek = true;
                //omx.pause();
                omx.seek(datas.seek);
                //setTimeout(function(){
                  io.emit(call, {"status":"video_seek", "seek":datas.seek});
                  //omx.play();
                  is_on_seek = false;
                //},500);
                break;
            case 'position_video':
                omx.setPosition(datas.position);
                io.emit(call, {"status":"video_position", "position":datas.position});
                break;
            case 'stop_video':
                omx.quit();
                video_is_playing = false;
                console.log('VIDEO NOT PLAYING ? ', video_is_playing);
                io.emit(call, {"status":"video_stopped"});
                if(playerTimer !== null){
                  clearTimeout(playerTimer);
                  playerTimer = null;
                }
                break;

            case 'audio':
                if(typeof audio_is_playing !== "undefined"){
                  if(audio_is_playing){
                    omx.quit();
                    audio_is_playing = false;
                    if(playerTimer !== null){
                      clearTimeout(playerTimer);
                      playerTimer = null;
                    }
                    io.emit(call, {"status":"audio_stopped"});
                    io.emit(call, {"status":"error", datas:{"title":"audio", "message":"Un mp3 était en cours de lecture et vient d'être coupée."}});
                  }else{
                    omx.quit();
                    setTimeout(function(){
                      audio_is_playing = false;
                      cp.exec("export DISPLAY=:0", function(error, stdout, stderr) {});
                      omx.open(URI+datas.file, omx_audio_options);
                      omx.setVolume(app_volume);
                      io.emit(call, {"status":"audio_started", "duration":omx.getCurrentDuration(), "position":omx.getCurrentPosition()});
                      resetAudioProgressListener();
                    },200);
                  }
                }else{
                  omx.quit();
                  setTimeout(function(){
                    audio_is_playing = false;
                    cp.exec("export DISPLAY=:0", function(error, stdout, stderr) {});
                    omx.open(URI+datas.file, omx_audio_options);
                    omx.setVolume(app_volume);
                    io.emit(call, {"status":"audio_started", "duration":omx.getCurrentDuration(), "position":omx.getCurrentPosition()});
                    resetAudioProgressListener();
                  },200);
                }
                break;
            case 'pause_audio':
                omx.pause();
                io.emit(call, {"status":"audio_pause", "is_running":null, "is_loaded":null});
                break;
            case 'resume_audio':
                omx.play();
                io.emit(call, {"status":"audio_resume", "is_running":null, "is_loaded":null});
                break;
            case 'play_audio':
                omx.play();
                io.emit(call, {"status":"audio_play", "is_running":null, "is_loaded":null});
                break;
            case 'volume_audio':
                omx.setVolume(datas.volume);
                app_volume = datas.volume;
                io.emit(call, {"status":"audio_volume", "volume":datas.volume});
                break;
            case 'seek_audio':
                is_on_seek = true;
                //omx.pause();
                omx.seek(datas.seek);
                //setTimeout(function(){
                  io.emit(call, {"status":"audio_seek", "seek":datas.seek});
                  //omx.play();
                  is_on_seek = false;
                //},500);
                //omx.seek(datas.seek);
                //io.emit(call, {"status":"audio_seek", "seek":datas.seek});
                break;
            case 'position_audio':
                omx.setPosition(datas.position);
                io.emit(call, {"status":"audio_position", "position":datas.position});
                break;
            case 'stop_audio':
                omx.quit();
                audio_is_playing = false;
                if(playerTimer !== null) {
                  clearTimeout(playerTimer);
                  playerTimer = null;
                }
                io.emit(call, {"status":"audio_stopped"});
                break;
            case 'init_drawing':
                //omx.quit();
                //video_is_playing = false;
                //audio_is_playing = false;
                //if(playerTimer !== null){
                //  clearTimeout(playerTimer);
                //  playerTimer = null;
                //}
                //check_end_omx();
                break;
            case 'drawing_point':
                break;
            case 'drawing':
                break;
            default:
                if(typeof datas.status !== "undefined"){
                  stat = {"status":datas.status};
                }else{
                  stat = {"status":"default"};
                }
                break;
        }
        if(datas.status.indexOf('video') === -1 || datas.status.indexOf('audio') === -1){
          if(playerTimer !== null){
            clearTimeout(playerTimer);
            playerTimer = null;
          }
        }
        io.emit(call, {"status":stat.status, "infos":stat, "datas":datas});
    });
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});
http.listen(port, function(){
    cp.exec("/home/pi/njoy/startchromium.sh", function(error, stdout, stderr) {
        if (error !== null) {
            console.log("exec errror: " + error);
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
  datas.teams = teams;
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


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function resetProgressListener() {
  video_is_playing = true;
  /* PROGRESS FILL DOESNT WORK CORRECTLY */
  omx.onProgress(function(track){ //subscribe for track updates (every second while not paused for now)
      
      //if(omx.getCurrentPosition() > 0 && omx.getCurrentPosition()+1 >= omx.getCurrentDuration()){
      //  console.log('PROGRESS IS FINISHED');
        //io.emit("njoy", {"status":"video_stopped"});
      //  io.emit("njoy", {"status":"stop_video"});
      //}else{
      sendOmxStatus();
      //}
      //var percent = track.position / track.duration;
      //io.emit(call, {"status":"progress_video", "position":track.position, "duration":track.duration, "percent":percent});
  });
  omx.onEnd(function(){
    //io.emit("njoy", {"status":"stop_audio"});
    io.emit("njoy", {"status":"stop_video"});
    //io.emit("njoy", {"status":"video_stopped"});
  });
  //playerTimer = setTimeout(function(){
  //  sendOmxStatus();
  //}, omxDelay);
}
function sendOmxStatus() {
  if(video_is_playing){
    var vid_status = {
      "status":"progress_video",
      "position":omx.getCurrentPosition(),
      "duration":omx.getCurrentDuration(),
      "volume":omx.getCurrentVolume()
    };
    if(omx.getCurrentPosition() > 0 && omx.getCurrentPosition()+1 >= omx.getCurrentDuration()){
      io.emit("njoy", {"status":"stop_video"});
    }else{
      io.emit("njoy", vid_status);
      //playerTimer = setTimeout(function(){
      //sendOmxStatus();
      //}, omxDelay);
    }
  }
}
function check_end_omx(){
  omx.quit();
  audio_is_playing = false;
  video_is_playing = false;
  if(playerTimer !== null){
    clearTimeout(playerTimer);
    playerTimer = null;
  }
}
function resetAudioProgressListener() {
  audio_is_playing = true;
  //PROGRESS FILL DOESNT WORK CORRECTLY
  omx.onProgress(function(track){ //subscribe for track updates (every second while not paused for now)
      
      //if(omx.getCurrentPosition() > 0 && omx.getCurrentPosition()+1 >= omx.getCurrentDuration()){
        //io.emit("njoy", {"status":"audio_stopped"});
      //  io.emit("njoy", {"status":"stop_audio"});
      //}else{
        console.log('SET OMX STATUS');
        sendOmxAudioStatus();
      //}
      //var percent = track.position / track.duration;
      //io.emit(call, {"status":"progress_video", "position":track.position, "duration":track.duration, "percent":percent});
  });
  //playerTimer = setTimeout(function(){
  //  sendOmxAudioStatus();
  //}, omxDelay);
}
function sendOmxAudioStatus() {
  
  if(audio_is_playing){
    if(!is_on_seek){
      var audio_status = {
        "status":"progress_audio",
        "position":omx.getCurrentPosition(),
        "duration":omx.getCurrentDuration(),
        "volume":omx.getCurrentVolume()
      };
      if(omx.getCurrentPosition() > 0 && omx.getCurrentPosition() >= omx.getCurrentDuration()){
        io.emit("njoy", {"status":"stop_audio"});
      }else{
        io.emit("njoy", audio_status);
        //playerTimer = setTimeout(function(){
        //  sendOmxAudioStatus();
        //}, omxDelay);
      }
    }
  }
}
