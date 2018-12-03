/* START VIDEO INSTANCE */
var omx = require('omx-interface'),
delay = 30,
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
    }, delay);
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
        }, delay);
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
        console.log("onProgress position :: ", track.position);
        console.log("onProgress duration :: ", track.duration);
        //var percent = track.position / track.duration;
        //io.emit(call, {"status":"progress_video", "position":track.position, "duration":track.duration, "percent":percent});
    });
    playerTimer = setTimeout(function(){
        sendOmxAudioStatus();
    }, delay);
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
            playerTimer = setTimeout(function(){
            sendOmxAudioStatus();
            }, delay);
        }
        }
    }
}