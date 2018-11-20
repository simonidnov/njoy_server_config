

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

        //console.log("datas.status ::::::: ", datas.status);
        switch(datas.status){
            case 'chrono_start':
              omx.quit();
              io.emit(call, {"status":"video_stopped"});
              io.emit(call, {"status":"audio_stopped"});
              omx.open("http://10.3.141.1:3000/ressources/audio/attente_30s.mp3", omx_audio_options);
              omx.setVolume(app_volume);
              break;
            case 'chrono_stop':
              omx.quit();
              io.emit(call, {"status":"video_stopped"});
              io.emit(call, {"status":"audio_stopped"});
              break;
            case 'FX':
              omx.open("http://10.3.141.1:3000/"+datas.file, omx_audio_options);
              omx.setVolume(app_volume);
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
                    video_is_playing = false;
                    omx.quit();
                    setTimeout(function(){
                      cp.exec("export DISPLAY=:0", function(error, stdout, stderr) {});
                      omx.open("http://10.3.141.1:3000/"+datas.file, omx_options);
                      omx.setVolume(app_volume);
                      io.emit(call, {"status":"video_started", "duration":omx.getCurrentDuration(), "position":omx.getCurrentPosition()});
                      resetProgressListener();
                    }, 200);
                  }
                }else{
                  video_is_playing = false;
                  omx.quit();
                  setTimeout(function(){
                    cp.exec("export DISPLAY=:0", function(error, stdout, stderr) {});
                    omx.open("http://10.3.141.1:3000/"+datas.file, omx_options);
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
                omx.pause();
                omx.seek(datas.seek);
                setTimeout(function(){
                  io.emit(call, {"status":"video_seek", "seek":datas.seek});
                  omx.play();
                  is_on_seek = false;
                },500);
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
                      omx.open("http://10.3.141.1:3000/"+datas.file, omx_audio_options);
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
                    omx.open("http://10.3.141.1:3000/"+datas.file, omx_audio_options);
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
                omx.pause();
                omx.seek(datas.seek);
                setTimeout(function(){
                  io.emit(call, {"status":"audio_seek", "seek":datas.seek});
                  omx.play();
                  is_on_seek = false;
                },500);
                //omx.seek(datas.seek);
                //io.emit(call, {"status":"audio_seek", "seek":datas.seek});
                break;
            case 'position_audio':
                omx.setPosition(datas.position);
                io.emit(call, {"status":"audio_position", "position":datas.position});
                break;
            case 'stop_audio':
                console.log('stop_audio');
                omx.quit();
                audio_is_playing = false;
                if(playerTimer !== null){
                  clearTimeout(playerTimer);
                  playerTimer = null;
                }
                io.emit(call, {"status":"audio_stopped"});
                break;
            case 'init_drawing':
                console.log('init_drawing init_drawing init_drawing');
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