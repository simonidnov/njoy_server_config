var labofolies_status = {
    teams : [
        {id:0, label:"blue", score:0, particles:[], isActive:false},
        {id:1, label:"orange", score:0, particles:[], isActive:false},
        {id:2, label:"pink", score:0, particles:[], isActive:false},
        {id:3, label:"green", score:0, particles:[], isActive:false},
        {id:4, label:"red", score:0, particles:[], isActive:false}
    ],
    screener: 'default',
    date: new Date().getTime()
};
function labofolies (datas) {
    console.log('labofolies WILL BE LOAD PLEASE WAIT...');
    console.log('WE RECEIVED DATAS FROM ACTIVITIES => ', datas);
}
labofolies.init = function (datas) {

    $.get('/ressources/labofolies/molecules.json', function(data, status){
        labofolies.molecules = data;
    }.bind(this));

    this.setState();
    this.datas = datas;
    // define modes screens
    this.modes = ['teams', 'enigma', 'scanner'];
    this.datas.mode = this.modes[0];
    this.datas.teams = labofolies_status.teams;
    // ON SET LE TAB CALLBACK DE L'APP TOOLS POUR CHANGER DE NIVEAU DE QUESTION
    app_tools.tab_callback = $.proxy(function (id) {
        // IMPORTANT : intercepte et retourne l'ID de l'onglet sélectionné
        this.datas.mode = this.modes[id];
        this.reset_template();
    }, this);
    
    // ON RESET LE SOCKET CALLBACK GLOBAL ET ON CATCH LES EVENEMENTS
    app.socket_callback = function (e) {
        switch(e.status){
            case 'EVENT_NAME_TO_DEFINE':
                // ON NE FAIT RIEN DE CE COTÉ, LORSQUE LE CALL EST ENVOYÉ ON ATTEND UN SENDQUESTION DEPUIS LE RECEPTOR
                break;
            default:
                console.log('we receive an unknow event from labofolies websocket server');
                break;
        }
    }.bind(this);
    
    // On charge le ou les templates recquis pour cette animation not dans ces templates on fait ce qu'on veux c'est open bar
    $.get("pages/labofolies/labofolies.tmpl", $.proxy(function (e) {
        labofolies.subcomponent_template = _.template(e);
        labofolies.reset_template();
    }, this));
}
labofolies.reset_template = function () {
    // on bourre le template dans la colonne de droite
    this.datas.teams = labofolies_status.teams;
    $('.column.components .subcomponent').html(this.subcomponent_template(this.datas));
    setTimeout($.proxy(function () {
        this.set_events();
    }, this), 200);
}
labofolies.setIframes = function() {
    for(i=0; i < window.document.getElementsByTagName('iframe').length; i++) {
        var id = window.document.getElementsByTagName('iframe')[i].getAttribute('id');
        this.setIframe(id, i);
    }
}
labofolies.setIframe = function(name, id) {
    var cssLink = document.createElement("link");
    cssLink.href = app.ip + "pages/labofolies/css/labofolies.css";
    cssLink.rel = "stylesheet"; 
    cssLink.type = "text/css";
    if(typeof window.frames[name] !== "undefined") {
        window.frames[name].contentDocument.head.appendChild(cssLink);
    }
    if (typeof window.frames[id].window.comp !== "undefined") {
        if (typeof window.frames[id].window.comp.mc !== "undefined") {
            window.frames[id].window.comp.mc.loops = false;
            setTimeout($.proxy(function(){
                this.update_jauge(name, id, labofolies_status.teams[id].score);
            }, this), 500);
        }
    }
    // this.update_jauge(name, id, labofolies_status.teams[id].score);
}
labofolies.set_events = function () {
    var self = this;
    // Dans le template on utiliera data-labofolies pour gérer les events et sockets...
    $('[data-labofolies]').off(ui.event).on(ui.event, (event) => {
        switch($(this).attr('data-labofolies')){
            case 'refresh':
                
                break;
            default:
                console.log('receive unknow labofolies action');
                break;
        }
    });
    
    // ON INTERCEPTE LE BOUTON BACK POUR NE PAS PERDRE LE STATUS DE L'APP
    $('[data-direction="back"]').off(ui.event).on(ui.event, function (event) {
        if ($('.labofolies_scan').hasClass('opened')) {
            labofolies.closeScanner();
            event.preventDefault();
            return false;
        }
        ui.popin({
            "title":"Attention",
            "message":"Si vous revenez en arrière, la partie sera terminée, êtes-vous sure de vouloir continuer ?",
            "buttons":[
                {"label":"Oui", "class":"error"},
                {"label":"Non", "class":"success"}
            ]
        }, (e) => {
            if(parseInt(e) === 0) {
                ui.navigate($('[data-direction="back"]').attr('data-navigate'));
                event.preventDefault();
                return false;
            }
        });
    });

    // $('[data-appid]').off(ui.event).on(ui.event, function(event) {
        /* ui.popin({
            "title":"Attention",
            "message":"Vous allez réinitialiser l'état du jeu, êtes-vous certain de vouloir quitter le jeu actuel ?",
            "buttons":[
                {"label":"Oui", "class":"error"},
                {"label":"Non", "class":"success"}
            ]
        }, (e) => {
            if(parseInt(e) === 0){
                event.preventDefault();
                return false;
            }
        }); */
    // });

    // TEAMS EVENTS 
    for(var i=0; i<$('.team').length; i++){
        $('.team').eq(i).find('.active_team').off('click').on('click', function(){
            console.log('UPDATE ACTIVE ', $(this).attr('data-team'));
            labofolies_status.teams[$(this).attr('data-team')].isActive = !labofolies_status.teams[$(this).attr('data-team')].isActive;
            if (labofolies_status.teams[$(this).attr('data-team')].isActive) {
                $(this).find('.label').html('Désactiver');
                $(this).find('.radio_ui').addClass('checked');
            } else {
                $(this).find('.label').html('Activer');
                $(this).find('.radio_ui').removeClass('checked');
            }

            labofolies.saveState();
        });
    }
    $('.more').off('click').on('click', function(e) {
        labofolies_status.teams[$(this).attr('data-team')].score += 10;
        labofolies.update_scores();
    });
    $('.less').off('click').on('click', function(e) {
        labofolies_status.teams[$(this).attr('data-team')].score -= 10;
        labofolies.update_scores();
    });
    $('#gotTolabo').off('click').on('click', function(e) {
        console.log('EMIT GOTO LABO');
        // set screener laboratory then emmit labofolies_status
        labofolies_status.screener = 'laboratory';
        labofolies.saveState();
        labofolies_status.date = new Date().getTime();
        app.socket.emit('labofolies', labofolies_status);
    });
    $('#synthetisation').off('click').on('click', function(e) {
        // set screener laboratory then emmit labofolies_status
        labofolies_status.screener = 'synthetisation';
        labofolies_status.date = new Date().getTime();
        app.socket.emit('labofolies', labofolies_status);
    });
    $('#openScan').off('click').on('click', function() {
        console.log('openScan');
        labofolies.openScanner();
    });
    $('.labofolies_scan .cross').off('click').on('click', function() {
        labofolies.closeScanner();
    });
}
labofolies.openScanner = function() {
    $('.labofolies_scan').addClass('opened');
    /* OPEN SCAN BARCODE ON MOBILE ONLY */
    labofolies.configJMOL();
    if (typeof cordova !== "undefined") {
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if(typeof result !== "undefined" && result !== null && result !== '') {
                    var code = JSON.parse(result);
                    if(typeof code.team === 'undefined' || typeof code.molecule === 'undefined') {
                        ui.popin({
                            "title":"ERREUR DE QRCODE",
                            "message":"Le format de ce QRCODE n'est pas reconnu, impossible de charger la molecule.",
                            "buttons":[
                                {"label":"j'ai compris", "class":"error"}
                            ]
                        }, (e) => {
                            if(parseInt(e) === 0) {
                                event.preventDefault();
                                return false;
                            }
                        });
                    } else {
                        // On set le display pour afficher sur le tableau côté PI
                        labofolies_status.display = app.ip + "/ressources/labofolies/molecules/" + mol + "/" + mol + ".png";
                        // On sauvegarde l'état de l'application
                        labofolies.saveState();
                        // on envois le status de l'appli au PI avec une nouvelle date et surtout le nouveau display sauvegardé
                        app.socket.emit('labofolies', labofolies_status);
                        // On set la config du MOL sur le target display qui est 
                        labofolies.configJMOL(code.molecule);
                        
                    }
                }else{
                    ui.popin({
                        "title":"ERREUR DE QRCODE",
                        "message":"Le QrCode que vous avez scanné n'est pas reconnu.",
                        "buttons":[
                            {"label":"j'ai compris", "class":"error"}
                        ]
                    }, (e) => {
                        if(parseInt(e) === 0) {
                            event.preventDefault();
                            return false;
                        }
                    });
                }
            }, 
            function (error) {
                ui.popin({
                    "title":"ERREUR DE SCAN",
                    "message":"Nous ne parvenons pas à scanner la carte, si le problème perciste, veuillez attribuer les points manuellement via l'écran équipes et scores.<br>Nous en sommes désolé et tâcherons d'en savoir plus pour la prochaine mise à jour.",
                    "buttons":[
                        {"label":"j'ai compris", "class":"error"}
                    ]
                }, (e) => {
                    if(parseInt(e) === 0) {
                        event.preventDefault();
                        return false;
                    }
                });
            }
        );
    } else {
        ui.popin({
            "title":"Aïe",
            "message":"Le scanner de QR code ne fonctionne pas :-|<br> impossible de scanner les Qrcodes, vous devez entrer le code dans le formulaire manuellement...",
            "buttons":[
                {"label":"j'ai compris", "class":"error"}
            ]
        }, (e) => {
            if(parseInt(e) === 0) {
                event.preventDefault();
                return false;
            }
        });
    }
}
labofolies.closeScanner = function() {
    $('.labofolies_scan').removeClass('opened');
    setTimeout(function(){ $('.labofolies_scan .content').html(''); }, 1500);
}

labofolies.update_scores = function(){
    for(var t=0; t<labofolies_status.teams.length; t++) {
        if(labofolies_status.teams[t].score < 0) { labofolies_status.teams[t].score = 0; };
        if(labofolies_status.teams[t].score > 100) { labofolies_status.teams[t].score = 100; };
        $('#team'+t).find('input')[0].value = labofolies_status.teams[t].score;
        this.update_jauge(labofolies_status.teams[t].label, t, labofolies_status.teams[t].score);
    }
    this.saveState();
}
labofolies.update_jauge = function(teamName, teamId, score) {
    var jauge = window
        .frames[teamName]
        .contentDocument.body.getElementsByClassName('maskGroup')[0]
        .getElementsByClassName('movieclip')[0];

    var height = $(window
        .frames[teamName]
        .contentDocument.body.getElementsByTagName('svg')[0]).height();
    height=220;
    var percent = Math.round(score * height) / 100;
    // on change sa position en fonction du score
    var transform = $(jauge).attr('transform'),
        transformSplitted = transform.split(','),
        lastAttr = transformSplitted[transformSplitted.length - 1];

    var updated = transform.replace(lastAttr, (height - percent)+')');

    jauge.setAttribute('transform', updated);
}
labofolies.saveState = function () {
    window.localStorage.setItem('labofolies', JSON.stringify(labofolies_status));
    labofolies_status.date = new Date().getTime();
    app.socket.emit('labofolies', labofolies_status);
}
labofolies.setState = function () {
    var saved = window.localStorage.getItem('labofolies');
    if(typeof saved !== 'undefined' && saved !== '' && saved !== null) {
        labofolies_status = JSON.parse(saved);
    }
    labofolies_status.date = new Date().getTime();
    app.socket.emit('labofolies', labofolies_status);
}

labofolies.configJMOL = function (mol) {
    var Info;
    // labofolies.molecules IS PRELOADED ON INIT
    // labofolies/molecules.json

    var myMolInfos = _.where(labofolies.molecules, {folder: mol})[0];
    ;(function() {
        Info = {
            width: window.innerWidth / 2,
            height: window.innerHeight,
            debug: false,
            color: "0xC0C0C0",
            addSelectionOptions: true,
            // serverURL: "https://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
            use: "HTML5",
            readyFunction: null,
            src: app.ip + "/ressources/labofolies/molecules/" + mol + "/" + mol + ".mol",
            bondWidth: 4,
            zoomScaling: 1.5,
            pinchScaling: 2.0,
            mouseDragFactor: 0.5,
            touchDragFactor: 0.15,
            multipleBondSpacing: 4,
            shadeAtoms: true,
            spinRateX: 0.2,
            spinRateY: 0.5,
            spinFPS: 20,
            spin:false,
            debug: false
        }
    })();    
    var myMol = Jmol.getTMApplet("jmol", Info);

    $('.labofolies_scan').html('<div class="left"></div><div class="right"><h1></h1><p></p><div class="formulae"></div></div>');
    $('.labofolies_scan .left').html(myMol._code);
    $('.labofolies_scan .right h1').html(myMolInfos.name);
    $('.labofolies_scan .right .formula').html(myMolInfos.formula);
    $('.labofolies_scan .right p').html(myMolInfos.description);
}
function str_pad_left(string, pad, length) {
    return (new Array(length+1).join(pad)+string).slice(-length);
}