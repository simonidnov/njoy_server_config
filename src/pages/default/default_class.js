var default_class = {
  init:function(){
    console.log('init default');
    $('#connect_button').off('click').on('click', function(){
      app.init(function(e){
        if(e.status === "socket_connected"){
          console.log('success logged on server');
          ui.navigate('/checking_socket');
        }
      });

    });
  },
  destroy : function(){
    console.log('destroy default');
  }
}
