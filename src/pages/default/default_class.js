var default_class = {
  init:function(){
    $('#ip_config').val(window.location.origin);
    $('#connect_button').off('click').on('click', function(){
      app.ip = $('#ip_config').val();
      app.init(function(e){
        if(e.status === "socket_connected"){
          ui.navigate('/checking_socket');
        }else{
          console.log(e);
          ui.display_error({"icon":"", "message":"veuillez vérifier que l'adresse indiquée sur l'écran principal correspond à celle indiquée dans le champs ci-dessous."});
        }
      });
    });
  },
  destroy : function(){
  }
}
