var app = {
  infos : {
    user_name:"",
    uuid : "",
    regis : false,
    users : []
  },
  callback:null,
  socket :null,
  init:function(callback){
    this.callback = callback;
    this.init_socket();
  },
  check_server : function(){

  },
  init_socket : function(){
    console.log('reload');
    app.infos.uuid = new Date().getTime();
    app.socket_callback = function(e){console.log(e);}
    app.socket = io('http://192.168.0.10/:3000', {
      transports: ['websocket', 'xhr-polling']
    });
    app.socket.on('connect', function(e) {
      console.log('user connected ', e);
      app.callback({status:"socket_connected"});
    });
    app.socket.on('njoy', function(datas) {
      console.log('njoy : ', datas);
      switch(datas.status){
        case 'activities':
          app.infos.activities = datas.activities;
          break;
        default:
          break;
      }
      app.socket_callback(datas);
    });
    app.socket.on('njoy_'+app.infos.uuid, function(datas) {
      console.log('login_success ', datas);
      switch(datas.status){
        case 'animations':
          break;
        case 'login_success':
          console.log('datas.datas.users ', datas.datas.users);
          app.infos.users = datas.datas.users;
          console.log("_.where(app.infos.users, {uuid:app.infos.uuid})[0].regis ", _.where(app.infos.users, {uuid:app.infos.uuid})[0].regis);
          if(_.where(app.infos.users, {uuid:app.infos.uuid})[0].regis !== "undefined" && _.where(app.infos.users, {uuid:app.infos.uuid})[0].regis === "true"){
            app.infos.regis = true;
          }
          break;
        case 'login_error':
          app.infos.users = datas.datas.users;
          break;
        default:
          break;
      }
      if(typeof datas.datas.animations !== "undefined"){
        animations = datas.datas.animations;
      }
      app.socket_callback(datas);
    });
    app.socket.emit('njoy', {status:"new"});
    app.socket.on('chat_message', function(msg){
      $('#messages').append($('<li>').text(JSON.stringify(msg)));
    });
    window.onbeforeunload = function(e) {
      app.socket.emit('njoy', {status:"disconnect", user_name:app.infos.user_name, uuid:app.infos.uuid});
      //return 'Please press the Logout button to logout.';
    };

  },
  destroy:function(){

  }
}
