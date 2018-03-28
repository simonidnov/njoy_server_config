const express = require('express'),
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
      app_volume = 1;

/* VIDEO INSTANCE */
var omx = require('omx-interface'),
    omx_options = {
        audioOutput:'local',
        blackBackground:true,
        disableKeys:true,
        disableOnScreenDisplay:true
    };
    omx_audio_options = {
        audioOutput:'local',
        blackBackground:false,
        disableKeys:true,
        disableOnScreenDisplay:true
    };
omx.init_remote({port:8080});

/* END VIDEO INSTANCE */

module.exports = router;
app.use(express.static('./src'));
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
                omx.quit();
                video_is_playing = false;
                cp.exec("export DISPLAY=:0", function(error, stdout, stderr) {});
                omx.open("http://10.3.141.1:3000/"+datas.file, omx_options);
                omx.setVolume(app_volume);
                io.emit(call, {"status":"video_started", "duration":omx.getCurrentDuration(), "position":omx.getCurrentPosition()});
                resetProgressListener();
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
                console.log('setvolume :::::::::: ', datas.volume);
                omx.setVolume(datas.volume);
                app_volume = datas.volume;
                io.emit(call, {"status":"video_volume", "volume":datas.volume});
                break;
            case 'seek_video':
                omx.seek(datas.seek);
                io.emit(call, {"status":"video_seek", "seek":datas.seek});
                break;
            case 'position_video':
                omx.setPosition(datas.position);
                io.emit(call, {"status":"video_position", "position":datas.position});
                break;
            case 'stop_video':
                omx.quit();
                video_is_playing = false;
                if(playerTimer !== null){
                  clearTimeout(playerTimer);
                  playerTimer = null;
                }
                io.emit(call, {"status":"video_stopped"});
                break;

            case 'audio':
                omx.quit();
                audio_is_playing = false;
                cp.exec("export DISPLAY=:0", function(error, stdout, stderr) {});
                omx.open("http://10.3.141.1:3000/"+datas.file, omx_audio_options);
                omx.setVolume(app_volume);
                io.emit(call, {"status":"audio_started", "duration":omx.getCurrentDuration(), "position":omx.getCurrentPosition()});
                resetAudioProgressListener();
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
                console.log('setvolume :::::::::: ', datas.volume);
                omx.setVolume(datas.volume);
                app_volume = datas.volume;
                io.emit(call, {"status":"audio_volume", "volume":datas.volume});
                break;
            case 'seek_audio':
                omx.seek(datas.seek);
                io.emit(call, {"status":"audio_seek", "seek":datas.seek});
                break;
            case 'position_audio':
                omx.setPosition(datas.position);
                io.emit(call, {"status":"audio_position", "position":datas.position});
                break;
            case 'stop_audio':
                omx.quit();
                audio_is_playing = false;
                if(playerTimer !== null){
                  clearTimeout(playerTimer);
                  playerTimer = null;
                }
                io.emit(call, {"status":"video_stopped"});
                break;
            default:
                if(typeof datas.status !== "undefined"){
                  stat = {"status":datas.status};
                }else{
                  stat = {"status":"default"};
                }
                break;
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
  /* PROGRESS FILL DOESNT WORK CORRECTLY
  omx.onProgress(function(track){ //subscribe for track updates (every second while not paused for now)
      console.log("onProgress position :: ", track.position);
      console.log("onProgress duration :: ", track.duration);
      var percent = track.position / track.duration;
      io.emit(call, {"status":"progress_video", "position":track.position, "duration":track.duration, "percent":percent});
  });*/
  playerTimer = setTimeout(function(){
    sendOmxStatus();
  }, 1000);
}
function sendOmxStatus() {
  if(video_is_playing){
    var vid_status = {
      "status":"progress_video",
      "position":omx.getCurrentPosition(),
      "duration":omx.getCurrentDuration(),
      "volume":omx.getCurrentVolume()
    };
    if(omx.getCurrentPosition() > 0 && omx.getCurrentPosition() >= omx.getCurrentDuration()){
      io.emit("njoy", {"status":"stop_video"});
    }else{
      io.emit("njoy", vid_status);
      playerTimer = setTimeout(function(){
        sendOmxStatus();
      }, 1000);
    }
  }
}


function resetAudioProgressListener() {
  audio_is_playing = true;
  /* PROGRESS FILL DOESNT WORK CORRECTLY
  omx.onProgress(function(track){ //subscribe for track updates (every second while not paused for now)
      console.log("onProgress position :: ", track.position);
      console.log("onProgress duration :: ", track.duration);
      var percent = track.position / track.duration;
      io.emit(call, {"status":"progress_video", "position":track.position, "duration":track.duration, "percent":percent});
  });*/
  playerTimer = setTimeout(function(){
    sendOmxAudioStatus();
  }, 1000);
}
function sendOmxAudioStatus() {
  if(audio_is_playing){
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
      playerTimer = setTimeout(function(){
        sendOmxAudioStatus();
      }, 1000);
    }
  }
}
