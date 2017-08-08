var app = {
    infos: {
        user_name: "",
        uuid: "",
        regis: false,
        users: []
    },
    activities: null,
    ip: window.location.origin,
    //ip:"http://192.168.0.10:3000",
    //ip:"http://10.213.1.231:3000",
    callback: null,
    socket: null,
    init: function(callback) {
        this.get_activities();
        this.callback = callback;
        this.init_socket();
    },
    get_activities: function() {
        $.getJSON("activities.json", function(json) {
            app.activities = json;
        });
    },
    check_server: function() {

    },
    init_socket: function() {
        //this.ip = window.location.origin;
        app.infos.uuid = new Date().getTime();
        app.socket_callback = function(e) {
            console.log(e);
        }
        app.socket = io(this.ip, {
            transports: ['websocket', 'xhr-polling']
        });
        app.socket.on('error', function(e) {
            app.callback({
                status: "error_socket",
                datas: e
            });
        });
        app.socket.on('connect_failed', function(e) {
            app.callback({
                status: "connect_failed"
            });
        });
        app.socket.on('connect', function(e) {
            app.callback({
                status: "socket_connected"
            });
        });
        app.socket.on('njoy', function(datas) {
            switch (datas.status) {
                case 'activities':
                    app.infos.activities = datas.activities;
                    break;
                default:
                    break;
            }
            app.socket_callback(datas);
        });
        app.socket.on('njoy_' + app.infos.uuid, function(datas) {
            switch (datas.status) {
                case 'animations':
                    break;
                case 'login_success':
                    app.infos.users = datas.datas.users;
                    if (_.where(app.infos.users, {
                            uuid: app.infos.uuid
                        })[0].regis !== "undefined" && _.where(app.infos.users, {
                            uuid: app.infos.uuid
                        })[0].regis === "true") {
                        app.infos.regis = true;
                    }
                    break;
                case 'login_error':
                    app.infos.users = datas.datas.users;
                    break;
                default:
                    break;
            }
            if (typeof datas.datas.animations !== "undefined") {
                animations = datas.datas.animations;
            }
            app.socket_callback(datas);
        });
        app.socket.emit('njoy', {
            status: "new"
        });
        app.socket.on('chat_message', function(msg) {
            $('#messages').append($('<li>').text(JSON.stringify(msg)));
        });
        window.onbeforeunload = function(e) {
            app.socket.emit('njoy', {
                status: "disconnect",
                user_name: app.infos.user_name,
                uuid: app.infos.uuid
            });
            //return 'Please press the Logout button to logout.';
        };
    },
    destroy: function() {

    }
}