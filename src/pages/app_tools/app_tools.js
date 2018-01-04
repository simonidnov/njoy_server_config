var app_tools = {
    component_template: null,
    is_mobile : false,
    init: function() {
        setTimeout($.proxy(function() {
            this.tools_scroll = new IScroll('#tools_scroll', {
                mouseWheel: true,
                click: true,
                useTransition: true
            });
            this.apps_scroll = new IScroll('#apps_scroll', {
                mouseWheel: true,
                click: true,
                useTransition: true
            });
            this.components_scroll = new IScroll('#components_scroll', {
                mouseWheel: true,
                click: true,
                useTransition: true
            });
            $.get('pages/app_tools/components.tmpl', $.proxy(function(e) {
                this.component_template = _.template(e);
            }, this));
            $('[data-appid]').on('click', function() {
                app.selected_tool = app.selected_app.apps[parseInt($(this).attr('data-appid'))];
                $('.column.components').html(app_tools.component_template(app.selected_app.apps[parseInt($(this).attr('data-appid'))]));
                app_tools.set_events();
                app_tools.components_scroll.refresh();

                ui.setListeners();
                if(app_tools.is_mobile){
                    $('header .left_nav .head_button').off('click').on('click', function(e){
                        e.preventDefault();
                        TweenMax.to($('#components_scroll'), .5, {
                            "left":"100%",
                            ease:Power4.easeIn,
                            onComplete:function(){
                                ui.setListeners();
                            }
                        });
                        return false;
                    });
                    TweenMax.to($('#components_scroll'), .5, {
                        "left":0,
                        ease:Power4.easeOut
                    });
                }
                /*$('[data-component="golden_family"]').on('click', function(){
                    console.log('is golden family');
                });
                $('[data-type="response"]').on('click', function(){
                    console.log('intercept hitted area');
                });*/
            });
            $('#open_tools').on('click', function(){
                if($('#tools_scroll').position().top !== 0){
                    $('header .left_nav .head_button').css('display', 'none');
                    TweenMax.to($('#tools_scroll'), .5, {top:0, ease:Power4.easeOut});
                }else{
                    $('header .left_nav .head_button').css('display', 'block');
                    TweenMax.to($('#tools_scroll'), .5, {top:"100%", ease:Power4.easeIn});
                }
            });
        }, this), 500);
        $(document).on('resize', function(){
            app_tools.resize();
        });
        app_tools.resize();
        $('#play_pause_button').off('click').on('click', function(){
          if($('.video_asset #play_pause_button img').attr('src') === "img/play_icon.svg"){
            app.socket.emit("njoy", {status:"pause_video"});
          }else{
            app.socket.emit("njoy", {status:"play_video"});
          }
          //app.socket.emit("njoy", {status:"pause_video"});
          console.log('play pause');
        });
        $('#mute_button').off('click').on('click', function(){
          if($('.video_asset #mute_button img').attr('src') === "img/audio_icon.svg"){
            app.socket.emit("njoy", {status:"mute_video"});
          }else{
            app.socket.emit("njoy", {status:"audio_video"});
          }
          console.log('mute');
        });
        app.socket_callback = function(e){
          console.log("socket callback from apptools :::: ", e);
          switch(e.status){
            case 'video_started':
              $('.video_asset #mute_button img').attr('src', "img/audio_icon.svg");
              $('.video_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
              $('.video_asset').addClass('started');
              break;
            case 'video_pause':
              if($('.video_asset #play_pause_button img').attr('src') === "img/play_icon.svg"){
                $('.video_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
              }else{
                $('.video_asset #play_pause_button img').attr('src', "img/play_icon.svg");
              }
              break;
            case 'video_play':
              if($('.video_asset #play_pause_button img').attr('src') === "img/play_icon.svg"){
                $('.video_asset #play_pause_button img').attr('src', "img/pause_icon.svg");
              }else{
                $('.video_asset #play_pause_button img').attr('src', "img/play_icon.svg");
              }
              break;
            case 'video_closed':
              $('.video_asset').removeClass('started');
              break;
            case 'video_muted':
              if($('.video_asset #mute_button img').attr('src') === "img/audio_icon.svg"){
                $('.video_asset #mute_button img').attr('src', "img/mute_icon.svg");
              }else{
                $('.video_asset #mute_button img').attr('src', "img/audio_icon.svg");
              }
              break;
            case 'video_audio':
              $('.video_asset').removeClass('started');
              break;
          }
        }
    },
    resize : function(){
        if(window.innerWidth <= 568){
            this.is_mobile = true;
        }else{
            this.is_mobile = false;
        }
    },
    set_events : function(){
        $('.tab_bar li').off('click').on('click', function(){
            $('.tab_bar li').removeClass('selected');
            $('.section_tab').css('display', 'none');
            $('#section_'+$(this).attr('id')).css('display', 'block');
            $(this).addClass('selected');
            app_tools.components_scroll.refresh();
        });
    },
    destroy: function() {
        console.log('destroy app_tools');
    }
}
