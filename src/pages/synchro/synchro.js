var synchro = {
  init:function(){
    TweenMax.to($('#synchro_progress .progress'), .2, {width:"100%", onUpdate:function(){
      $('#synchro_progress .status').html(Math.round(parseInt(($('#synchro_progress .progress').css('width').replace('px', '')) / parseInt($('#synchro_progress .bar').css('width').replace('px', ''))*100))+"%");
    }, onComplete:function(){
      app.load_activities(function(){
          ui.navigate('/regis');
      });
    }});
  },
  destroy : function(){
    console.log('destroy default');
  }
}
