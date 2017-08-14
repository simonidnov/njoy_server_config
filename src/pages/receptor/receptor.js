var receptor = {
    init:function(){
        /* on receive node_log print */
        app.socket_callback = $.proxy(function(e){
            if(typeof e.datas !== "undefined"){
                this.create_component(e.datas);
            }
        }, this);
    },
    create_component : function(datas){
        TweenMax.killAll();
        switch(datas.status){
            case "video":
                $('.module').html('');
                $('.chronos').remove();
                $('.module').append('<div class="video_display"><video src="'+window.location.origin+'/'+datas.file+'" autoplay></video></div>');
                console.log('play video');
                break;
            case "playlist_video":
                $('.module').append('<div class="video_display"></div>');
                console.log('play video playlist');
                break;
            case "audio":
                $('.module').append('<div class="video_display"></div>');
                console.log('play audio');
                break;
            case "playlist_audio":
                $('.module').append('<div class="audio_display"></div>');
                console.log('play audio playlist');
                break;
            case "picture":
                $('.module').append('<div class="picture_display"></div>');
                $('.picture_display').css('background-image', 'url('+datas.file+')');
                console.log('display picture');
                break;
            case "":
                break;
            case "success":
                this.success(datas);
                console.log('this is success');
                break;
            case "fail":
                this.fail(datas);
                console.log('this is fail');
                break;
            case "object":
                this.object_component(datas);
                break;
            case "golden_family":
                this.golden_family(datas);
                break;
        }
        if(typeof datas.chronos !== "undefined"){
            this.setChronos(datas.chronos, datas.chronos_type);
        }
    },
    object_component : function(datas){
        $('.module').html('');
        $('.chronos').remove();
        //TweenMax.killAllTweens();
        switch (datas.component){
            case "quiz_component":
                break;
            case "golden_family":
                $('.module').append('<div class="golden_family"><h1>'+datas.tools.menu[datas.menu].components.golden_family[datas.component_id].label+'</h1><h3>'+datas.tools.menu[datas.menu].components.golden_family[datas.component_id].desc+'</h3><ul class="choices"></ul></div>');
                for(var i=0; i<datas.tools.menu[datas.menu].components.golden_family[datas.component_id].choices.length; i++){
                    $('.receptor .module .golden_family ul.choices').append('<li><div class="front"></div><div class="back">'+datas.tools.menu[datas.menu].components.golden_family[datas.component_id].choices[i]+"</div></li>");
                }
                /*
                $('.receptor .module .golden_family ul.choices li').on('click', function(){
                    if($(this).hasClass('selected')){
                        $(this).removeClass('selected');
                    }else{
                        $(this).addClass('selected');
                    }
                });
                */
                break;
        }
    },
    golden_family : function(datas){
        //alert('data-type golden family');
        if(typeof datas.response !== "undefined"){
            $('.receptor .module .golden_family ul.choices li').eq(parseInt(datas.response)).addClass('selected');
        }
    },
    setChronos : function(time, type){
        if(typeof type === "undefined"){type="bottom";}
        $('.screen.receptor').append('<div class="chronos '+type+'"><div class="counter"></div><div class="timelap"><div class="progress"></div></div></div>');
        $('.chronos .counter').html(time);
        var chronos_tween = TweenMax.to($('.timelap .progress'), parseInt(time), {css:{width:"100%"}, ease:Linear.easeNone, onUpdate:function(e){
            $('.chronos .counter').html(parseInt(time) - Math.round(chronos_tween.time()));
        }, onComplete:function(){
            //alert('time elapsed');
        }});
    },
    success : function(){
        $('.module').append('<canvas class="motion_canvas" id="motion_canvas"></canvas');
        if(typeof this.conf !== "undefined"){
            delete this.conf;
        }
        this.conf = new confettis();
        this.conf.initConfettis('motion_canvas');
        this.conf.start_confettis();
        setTimeout($.proxy(function(){
            this.conf.stop_confettis();
        },this), 1000);
        //alert('success');
    },
    fail : function(){
        $('.module').append('<canvas class="motion_canvas" id="motion_canvas"></canvas');
        //alert('fail');
    },
    destroy : function(){
        console.log('destroy receptor');
    }
}
