var express = require('express'),
    app = express(),
    router = express.Router(),
    path = require('path'),
    users = [],
    server = null,
    http = require('http').Server(app),
    port = 8080,
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
    //--kiosk
    //--noerrdialogs --disable-session-crashed-bubble --disable-infobars --force-gpu-rasterization
    cp.exec("chromium-browser --noerrdialogs --disable-session-crashed-bubble --disable-infobars --kiosk --force-gpu-rasterization http://10.3.141.1:3000/receptor", function(error, stdout, stderr) {
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
          console.log(datas);
          break;
        default:
          stat = {"status":"default"};
          break;
    }
    console.log('call ::: ', call, ' stat ', stat);
    io.emit(call, {"status":stat.status, "infos":stat, "datas":datas});
});
});
http.listen(3000, function(){
  console.log('listening on *:3000');
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
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        // console.log(ifname + ':' + alias, iface.address);
        return iface.address;
      } else {
        // this interface has only one ipv4 adress
        // console.log("ip checked :: ", ifname, iface.address);
        return iface.address;
      }
      ++alias;
    });
  });
}
var users_activities = [];
var animations = null;


//$.get('activities.json');
/*
{
  components:[
    {"type":"image", "file":"ressources/crazy_show_logo.svg", "label":"Logo crazy show"},
    {"type":"audio", "file":"ressources/.mp3", "label":"Jingle Crazy Show Audio"},
    {"type":"video", "file":"ressources/.mp4", "label":"Jingle Crazy Show Video"},
    {"type":"quiz", "file":"", "label":"", "description":"",
      "questions":[
        {"type":"unique", "picture":"ressources/crazy_show_logo.svg", "label":"", "question":"", "choices":["oui", "non", "super", "test"], "response":1},
        {"type":"multiple", "picture":"ressources/crazy_show_logo.svg", "label":"", "question":"", "choices":["oui", "non", "super", "test"], "response":0},
        {"type":"pictures", "picture":"ressources/crazy_show_logo.svg", "label":"", "question":"", "choices":["ressources/crazy_show_logo.svg", "ressources/crazy_show_logo.svg"], "response":1},
      ]
    },
    {"type":"drawing", "label":"dessine", "description":"dessine moi un mouton"}
  ]
}
*/
