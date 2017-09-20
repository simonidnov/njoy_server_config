var express = require('express'),
    app = express(),
    router = express.Router(),
    path = require('path'),
    users = [],
    server = null,
    http = require('http').Server(app),
    port = 3000,
    os = require('os'),
    ifaces = os.networkInterfaces(),
    ip_config = get_ip_config(),
    io = require('socket.io')(http),
    _ = require('underscore'),
    cp = require('child_process');
    $ = require('jquery');

// routes the app
//app.use('/', router);

/*app.use(function(req, res){
  console.log(res);
  res.send(404);
});*/


module.exports = router;
//define static files


app.use(express.static('./src'));

// start server //
/*
router.get('/', function(req, res){
  //res.render('views/index');
  res.sendFile('src/index.html', { root: path.join(__dirname, '../')});
});
router.get('/login', function(req, res){
  //res.render('views/index');
  console.log('login');
  res.sendFile('src/index.html', { root: path.join(__dirname, '../')});
});
*/



app.get('*', function(req, res){
  console.log(req," ::: ",res);
  res.sendFile('njoy/src/index.html', { root: path.join(__dirname, '../')});
});
app.listen(port, function(){
    console.log('app start listenning ', port);
    cp.exec("/home/pi/startchromium.sh", function(error, stdout, stderr) {
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
        if (error !== null) {
            console.log("exec errror: " + error);
        }
    });
});
/* socket io config default route */
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
          //console.log(datas);
          break;
        default:
          stat = {"status":"default"};
          break;
    }
    console.log('call ::: ', call, ' stat ', stat);
    io.emit(call, {"status":stat.status, "infos":stat, "datas":datas});
});
});
http.listen(3007, function(){

});
/* OAUTH MANAGER */
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
/* REQUEST MANAGER */
var addParams = function(datas){
  if(typeof datas === "undefined"){
    datas = {};
  }
  datas.users = users;
  datas.animations = animations;
  datas.ip_config = get_ip_config();
  return datas;
}
/* CHECKING IP CONFIG */
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
var users_activities = [];
var animations = null;