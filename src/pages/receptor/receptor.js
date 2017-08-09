/*
  TODO the canvas siz doesn't reflect the device size !important NOTE : broadcast RATIO is 1920*1080
  we need to rotate client canvas @ 90° only when thats vertical.
  TODO #2 traces are broken check traces NOTE : if you make trace the next point draw line from the oldXY NOTE : unset there values doesn"t change anything.
*/
var receptor = {
    currentShape : [],
    canvas :null,
    init:function(){
        app.init(function(){});
        /* on receive node_log print */
        app.socket_callback = $.proxy(function(e){
            if(typeof e.datas !== "undefined"){
                this.create_component(e.datas);
                if(typeof e.datas.tools !== "undefined"){
                  if(typeof e.datas.tools.tr !== "undefined"){
                    $('.tr').css('background-image', 'url('+e.datas.tools.tr+')');
                  }else{
                    $('.tr').css('background-image', 'none');
                  }
                  if(typeof e.datas.tools.tl !== "undefined"){
                    $('.tl').css('background-image', 'url('+e.datas.tools.tl+')');
                  }else{
                    $('.tl').css('background-image', 'url()');
                  }
                  if(typeof e.datas.tools.tc !== "undefined"){
                    $('.tc').css('background-image', 'url('+e.datas.tools.tc+')');
                  }else{
                    $('.tc').css('background-image', 'url()');
                  }
                  if(typeof e.datas.tools.br !== "undefined"){
                    $('.br').css('background-image', 'url('+e.datas.tools.br+')');
                  }else{
                    $('.br').css('background-image', 'url()');
                  }
                  if(typeof e.datas.tools.bl !== "undefined"){
                    $('.bl').css('background-image', 'url('+e.datas.tools.bl+')');
                  }else{
                    $('.bl').css('background-image', 'url()');
                  }
                  if(typeof e.datas.tools.bc !== "undefined"){
                    $('.bc').css('background-image', 'url('+e.datas.tools.bc+')');
                  }else{
                    $('.bc').css('background-image', 'url()');
                  }
                  if(typeof e.datas.tools.background !== "undefined"){
                    $(".receptor").css({
                      "background-image":"url("+e.datas.tools.background+")",
                      "background-size":"cover"
                    });
                  }else{
                    $(".receptor").css({
                      "background-image":"url()",
                      "background-size":"contain"
                    });
                  }
                }
            }else{
                $('.tr').css('background-image', 'none');
                $('.tc').css('background-image', 'none');
                $('.tl').css('background-image', 'none');
                $('.br').css('background-image', 'none');
                $('.bc').css('background-image', 'none');
                $('.bl').css('background-image', 'none');
                $(".module").html('').empty();
              //$('.app_icon, .app_logo').css('background-image', 'url()');
            }
        }, this);
    },
    create_component : function(datas){
      console.log('create_component ', datas);
      $('.receptor .module').css({'transform-origin':'50% 50%', 'overflow':'hidden', "width":window.innerWidth+"px", "height":window.innerHeight+"px", "border-radius":"0", "position":"relative"});
        //$('.chronos').remove();
        if(typeof receptor.chrono_sound !== "undefined"){
          receptor.chrono_sound.pause();
        }
        if($('video').length > 0){
          $(".module").children().filter("video").each(function(){
              this.pause(); // can't hurt
              delete this; // @sparkey reports that this did the trick (even though it makes no sense!)
              $(this).remove(); // this is probably what actually does the trick
          });
          $(".module").empty();
        }
        $('.tr, .tc, .tl, .br, .bc, .bl').css('display', 'block');
        switch(datas.status){
            case "splash":
                $('.module').html('');
                $('.chronos').remove();
                break;
            case "init_drawing":
                $('.module').html('');
                $('.chronos').remove();
                $('.receptor').css({'background-image':'url()', 'background-color':'#FFF'});
                TweenMax.killAll();
                app.socket.emit('njoy', {status:'stop_video'});
                app.socket.emit('njoy', {status:'stop_audio'});
                setTimeout($.proxy(function(){
                  this.init_drawing(datas);
                },this),300);
                break;
            case "drawing":
                this.drawing(datas);
                break;
            case "drawing_point":
                this.drawing_point(datas);
                break;
            case "drawing_clear":
                this.drawing_clear(datas);
                break;
            case "video":
                $('.app_logo, .app_icon').css('display', 'none');
                console.log('video');
                $('.module').html('');
                $('.chronos').remove();
                TweenMax.killAll();
                if(typeof this.audio !== "undefined"){
                  this.audio.pause();
                  app.socket.emit("njoy", {
                    "status":"audio_stopped"
                  });
                }
                /*$('.module').append('<div class="video_display"><video src="'+window.location.origin+'/'+datas.file+'" autoplay width="'+window.innerWidth+'px" height="'+window.innerHeight+'px"></video></div>');*/
                /*$(".receptor").css({
                  "background-image":"url("+(window.location.origin+'/'+(datas.file.replace('.mp4', '.svg')))+")",
                  "background-size":"cover"
                });*/
                break;
            case 'force_video':
                console.log('force_video');
                $('.app_logo, .app_icon').css('display', 'none');
                $('.module').html('');
                $('.chronos').remove();
                TweenMax.killAll();
                $('.module').append('<div class="video_display"><video src="'+window.location.origin+'/'+datas.file+'" autoplay width="'+window.innerWidth+'px" height="'+window.innerHeight+'px"></video></div>');
                /*$(".receptor").css({
                  "background-image":"url("+(window.location.origin+'/'+(datas.file.replace('.mp4', '.svg')))+")",
                  "background-size":"cover"
                });*/
                break;
            case "playlist_video":
                $('.module').append('<div class="video_display"></div>');
                TweenMax.killAll();
                break;
            case "FX":
                $('.module').append('<div class="fx" style="background-image:url('+datas.data+')"></div>');
                TweenMax.to($('.fx'), .5, {css:{top:0}, ease:Back.easeOut});
                //this.fx = new Audio(datas.file);
                //this.fx.play();
                //this.fx.addEventListener("ended", function(){
                  TweenMax.to($('.fx'), .5, {css:{top:"100%", delay:3}, ease:Back.easeIn, onComplete:function(){
                    $('.fx').remove();
                  }});
                //});
                break;
            case "audio":
                /*
                TweenMax.killAll();
                if(typeof this.audio !== "undefined"){
                  this.audio.pause();
                }
                this.audio = new Audio(datas.file);
                this.audio.play();
                this.audio.addEventListener("ended", function(){
                  app.socket.emit("njoy", {
                    "status":"audio_stopped"
                  });
                });
                app.socket.emit("njoy", {
                  "status":"audio_played"
                });
                */
                break;
            case "audio_pause":
                /*
                if(typeof this.audio !== "undefined"){
                  this.audio.pause();
                }
                app.socket.emit("njoy", {
                  "status":"audio_paused"
                });
                */
               break;
           case "audio_resume":
               /*
               if(typeof this.audio !== "undefined"){
                 this.audio.play();
               }
               app.socket.emit("njoy", {
                 "status":"audio_play"
               });
               */
              break;

           case "audio_mute":
              /*
              if(typeof this.audio !== "undefined"){
                this.audio.volume = 0;
              }
              app.socket.emit("njoy", {
                "status":"audio_muted"
              });
              */
             break;
           case "audio_volume":
              /*
              if(typeof this.audio !== "undefined"){
                this.audio.volume = 1;
              }
              app.socket.emit("njoy", {
                "status":"audio_volumed"
              });
              */
              break;
           case "audio_stop":
              /*
              if(typeof this.audio !== "undefined"){
                this.audio.pause();
              }
              app.socket.emit("njoy", {
                "status":"audio_stopped"
              });
              */
              break;
           case "playlist_audio":
                //$('.module').append('<div class="audio_display"></div>');
                TweenMax.killAll();
                break;
            case "picture":
                $('.module').html('');
                TweenMax.killAll();
                $('.module').append('<div class="picture_display"></div>');
                $('.picture_display').css('background-image', 'url('+datas.file+')');
                break;
            case "":
                break;
            case "success":
                //this.success(datas);
                break;
            case "display_text":
                this.display_text("DISPLAY TEXT");
            case "fail":
                //this.fail(datas);
                break;
            case "object":
                this.object_component(datas);
                break;
            case "golden_family":
                this.golden_family(datas);
                break;
            case "web_content":
                this.web_content(datas);
                break;
        }
        if(typeof datas.teams !== "undefined"){
          app.teams = datas.teams;
          this.set_teams(datas.teams);
        }
        if(typeof datas.chronos !== "undefined"){
            this.setChronos(datas.chronos, datas.chronos_type);
        }
    },
    set_teams : function(teams){
      var teams_temp = _.template($('#teams_template').html());
      $('#teams_display').remove();
      if(teams.length > 0){
        $('.screen.receptor').append(teams_temp({teams : teams}));
        $('#teams_display').css('display', 'block');
      }
    },
    web_content : function(datas){
        //console.log(datas);
    },
    object_component : function(datas){
        console.log("object_component ", object_component);
        //$('.module').html('');
        $('.chronos').remove();
        TweenMax.killAll();
        //TweenMax.killAllTweens();
        switch (datas.component){
            case "quiz_component":
                break;
            case "golden_family":
                //<h1>'+datas.tools.menu[datas.menu].components.golden_family[datas.component_id].label+'</h1>
                $('.module').append('<div class="golden_family"><div class="content_choice"><h3>'+datas.tools.menu[datas.menu].components.golden_family[datas.component_id].desc+'</h3><ul class="choices"></ul></div></div>');
                var LENGTH = datas.tools.menu[datas.menu].components.golden_family[datas.component_id].choices.length;
                for(var i=0; i<LENGTH; i++){
                    $('.receptor .module .golden_family ul.choices').append('<li><div class="front"></div><div class="back">'+datas.tools.menu[datas.menu].components.golden_family[datas.component_id].choices[i]+'<div class="points">'+((LENGTH*10)-(i*10))+'</div></div></li>');
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
        //this.chrono_sound = new Audio("ressources/audio/attente_30s.mp3");
        //this.chrono_sound.play();
        var chronos_tween = TweenMax.to($('.timelap .progress'), parseInt(time), {css:{width:"100%"}, ease:Linear.easeNone, onUpdate:function(e){
            $('.chronos .counter').html(parseInt(time) - Math.round(chronos_tween.time()));
        }, onComplete:function(){
            //alert('time elapsed');
            //receptor.chrono_sound.pause();
        }});
    },
    success : function(){
        TweenMax.killAll();
        $('.over_motion').remove();
        var success_temp = _.template($('#success_template').html());
        $('.receptor').append(success_temp());
        if(typeof this.audio !== "undefined"){
          this.audio.pause();
        }
        this.audio = new Audio("ressources/audio/applau.mp3");
        this.audio.play();
    },
    fail : function(){
        TweenMax.killAll();
        $('.over_motion').remove();
        var fail_temp = _.template($('#success_template').html());
        $('.receptor').append(fail_temp());
        if(typeof this.audio !== "undefined"){
          this.audio.pause();
        }
        this.audio = new Audio("ressources/audio/faux.mp3");
        this.audio.play();
    },
    display_text : function(label){
      TweenMax.killAll();
      $('#success_motion').remove();
      //$('.receptor').css({'background-color': '#3B0092', 'background-image':'url()'});
      $('.receptor .module').css({'position':'absolute', 'width':window.innerWidth+'px', 'height':window.innerWidth+'px', 'transform-origin':'50% 50%', 'overflow':'hidden', "top":0, "left":0, "right":0, "bottom":0, "margin":"auto"});
      TweenMax.to($('.receptor .module'), .5, {css:{'border-radius':"100%", "width":"0px", "height":"0px"}});
      var success_temp = _.template($('#success_template').html());
      $('.receptor').append(success_temp({"label":label}));
      $.each($('.confetti'), function(index, conf){
        var scale = Math.random()*1 + .5;
        TweenMax.to($(this), 2.8, {
          "css":{
            "top":Math.round((-window.innerHeight)+Math.random()*(window.innerHeight*2))+'px',
            "left":Math.round((-window.innerWidth)+Math.random()*(window.innerWidth*2))+'px',
            "rotation":Math.random()*360,
            "scaleX":scale,
            "scaleY":scale
          },
          ease:Power4.easeOut,
          delay:.5
        });
      });
      TweenMax.set($(".success_text"), {
          "scaleX":0,
          "scaleY":0
      });
      TweenMax.to($(".success_text"), .5, {
          "scaleX":1,
          "scaleY":1,
          "ease":Elastic.easeOut,
          "delay":.8,
          onComplete:function(){
            TweenMax.to($(".success_text"), .8, {
                "scaleX":0,
                "scaleY":0,
                delay:.8,
                ease:Back.easeIn,
                onComplete : function(){

                  TweenMax.to($('.receptor .module'), .5, {
                    css:{'border-radius':"0%", "width":window.innerWidth+"px", "height":window.innerHeight+"px"},
                    ease:Power4.easeIn,
                    onComplete:function(){
                      $('#success_motion').remove();
                    }
                  });
                }
            });
            $.each($('.confetti'), function(index, conf){
              TweenMax.to($(this), .6, {
                "css":{
                  "top":($(this).position().top+(window.innerHeight*2))+'px',
                  "rotation":Math.random()*360
                },
                ease:Power4.easeIn,
                delay:(.03*index)
              });
            });
          }
      });
    },
    init_drawing : function(datas){
        /*
        app.socket.emit("njoy", {
          "status":"init_drawing",
          "width":window.innerWidth,
          "height":window.innerHeight
        });
        */

        $('.module').append('<canvas id="drawing" width="'+datas.width+'" height="'+datas.height+'" style="width:'+datas.width+'px; height:'+datas.height+'px;"></canvas>');
        this.canvas = document.getElementById("drawing");
        // TODO REMOVE TEST SIZE
        /*this.canvas.width = datas.width;
        this.canvas.height = datas.height;

        this.canvas.style.width = datas.width;
        this.canvas.style.height = datas.height;*/

        this.canvas.width = datas.width;
        this.canvas.height = datas.height;

        this.canvas.style.width = datas.width;
        this.canvas.style.height = datas.height;


        var scale = 1,
            canvas_id = "drawing";

        if($('#'+canvas_id).width() > $('#'+canvas_id).height()){
          if($('#'+canvas_id).width() > window.innerWidth){
            scale = window.innerWidth / $('#'+canvas_id).width();
          }else{
            scale = $('#'+canvas_id).width() / window.innerWidth;
          }
        }else{
          if($('#'+canvas_id).height() > window.innerHeight){
            scale = $('#'+canvas_id).height() / window.innerHeight;
          }else{
            scale = window.innerHeight / $('#'+canvas_id).height();
          }
        }

        $('#drawing').css({
          "width":datas.width+'px !important',
          "height":datas.height+'px !important',
          "transform":'scale('+scale+')'
        });

        this.stage = new createjs.Stage("drawing");
        //this.stage.autoClear = true;

        this.currentShape = [];
        var s = new createjs.Shape();
        this.currentShape[0] = s;
        var g = s.graphics;

        g.beginStroke("#000000");
        this.stage.addChild(s);

        //this.stage = new createjs.Stage("drawing");
        this.stage.autoClear = true;
        this.stage.update();
    },
    drawing_clear : function(){
      //if(typeof this.stage !== "undefined"){
        this.stage.removeAllChildren();
        this.stage.update();
      //}
    },
    drawing_point:function(datas){
        this.oldX = datas.x;
        this.oldY = datas.y;
        //var pt = new createjs.Point(datas.x, datas.y);
        this.currentShape[this.currentShape.length-1].graphics.endStroke();
        this.currentShape[this.currentShape.length-1].graphics.endFill();
        //this.currentShape[this.currentShape.length].graphics.endStroke();

        var s = new createjs.Shape();
        this.currentShape[this.currentShape.length] = s;
        var g = s.graphics;
        //g.beginStroke("#000000");
        this.stage.addChild(s);
        this.drawing(datas);
        //this.currentShape[this.currentShape.length-1].graphics.setStrokeStyle(datas.strokestyle.size, datas.strokestyle.stylingW, datas.strokestyle.stylingH);
        //this.currentShape[this.currentShape.length-1].graphics.moveTo(datas.x, datas.y);
        //this.currentShape[this.currentShape.length-1].graphics.curveTo(datas.curve.oldX, datas.curve.oldY, datas.curve.oldMidX, datas.curve.oldMidY);

        //this.currentShape[this.currentShape.length-1].graphics.moveTo(this.oldX, this.oldY);
        //this.currentShape[this.currentShape.length-1].graphics.beginStroke("#000000");
    },
    drawing : function(datas){
      /*
      if(typeof this.oldX === "undefined"){
        this.oldX = datas.x;
        this.oldY = datas.y;
      }
      */
      //console.log('draw ', this.currentShape[this.currentShape.length-1].graphics);
      var pt = new createjs.Point(datas.x, datas.y);
      var midPoint = new createjs.Point(this.oldX + pt.x>>1, this.oldY+pt.y>>1);
      if(typeof this.currentShape[this.currentShape.length-1] != "undefined"){
          if(typeof datas.strokestyle !== "undefined"){
            this.currentShape[this.currentShape.length-1].graphics.beginStroke(datas.color);
            this.currentShape[this.currentShape.length-1].graphics.setStrokeStyle(datas.strokestyle.size, datas.strokestyle.stylingW, datas.strokestyle.stylingH);
          }else{
            this.currentShape[this.currentShape.length-1].graphics.beginStroke("rgba(0,0,0,0)");
            this.currentShape[this.currentShape.length-1].graphics.setStrokeStyle(0, 0, 0);
          }
          this.currentShape[this.currentShape.length-1].graphics.moveTo(midPoint.x, midPoint.y);
          this.currentShape[this.currentShape.length-1].graphics.curveTo(this.oldX, this.oldY, this.oldMidX, this.oldMidY);
      }
      this.oldX = pt.x;
      this.oldY = pt.y;

      this.oldMidX = midPoint.x;
      this.oldMidY = midPoint.y;
      this.stage.update();

    },
    destroy : function(){
    }
}

var drawer = function(canvas_id, width, height){
  this.canvas = document.getElementById(canvas_id);
  // TODO REMOVE TEST SIZE
  this.canvas.width = width;
  this.canvas.height = height;

  this.canvas.style.width = width;
  this.canvas.style.height = height;
  $('#canvas_id').css({
    "width":$('body').width()+'px !important',
    "height":$('body').height()+'px !important'
  })
  this.stage = new createjs.Stage(canvas_id);
  this.stage.autoClear = true;
  this.stage.update();

  this.currentShape = [];
  var s = new createjs.Shape();
  this.currentShape[0] = s;
  var g = s.graphics;

  g.beginStroke("#000000");
  this.stage.addChild(s);
  /* TODO : on receive ticker from user update stage */
  //createjs.Ticker.addEventListener("tick", $.proxy(function(){this.update();},this));
}
