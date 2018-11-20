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
  
  var addParams = function(datas){
    if(typeof datas === "undefined"){
      datas = {};
    }
    datas.users = users;
    datas.teams = teams;
    datas.animations = animations;
    datas.ip_config = get_ip_config();
    return datas;
  }
  
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
  
  
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }