function boardingpass(){
    console.log('boardingpass WILL BE LOAD PLEASE WAIT...');
}
boardingpass.init = function(){
    //ON DEFINI LE WORDING DES LEVELS POUR CHERCHER DANS LE JSON COTE RECEPTOR BOARDINGPAS
    this.levels = ["co-pilote", "pilote", "expert"];
    //ON CREE UN ARRAY DE QUESTIONS VIDE EN ATTENTE DE RECEPTION DE LA SELECTIOND DU RECEPTOR
    this.questions = [];
    // LORSUQ'ON LANCE L'APPLI PAR DEFAUT ON EST SUR LA PREMIERE TAB DONC ON SET LE LEVEL SUR ZERO
    this.level = this.levels[0];
    // ON SET LE TAB CALLBACK DE L'APP TOOLS POUR CHANGER DE NIVEAU DE QUESTION
    app_tools.tab_callback = function(e){
        this.level = this.levels[e];
        // TODO, AVANT DE RAFRAICHIR ON AFFICHE UNE POPIN CAR LES QUESTIONS PRÉCÉDENTES SERONT PERDUES
        // LORSQU'ON CHANGE DE NIVEAU ON DEMANDE LES QUESTION DU NIVEAU SSELECTIONNÉ
        app.socket.emit('boardingpass', {"status":"getQuestions", "level":this.level});
    }.bind(this);
    // ICI ON UTILISE UN SUB COMPONENT QUI N'EST PAS PAR DEFAULT 
    $.get("pages/boardingpass/boardingpass.tmpl", $.proxy(function(e) {
        this.subcomponent_template = _.template(e);
    }, this));
    // ON RESET LE SOCKET CALLBACK GLOBAL ET ON CATCH LES EVENEMENTS
    app.socket_callback = function(e) {
        console.log("socket callback boardingpass :::: ", e);
        switch(e.status){
            case 'getQuestions':
                // ON NE FAIT RIEN DE CE COTÉ, LORSQUE LE CALL EST ENVOYÉ ON ATTEND UN SENDQUESTION DEPUIS LE RECEPTOR
                return false;
                break;
            case 'sendQuestions':
                // SEND QUESTION EST ENVOYÉ DEPUIS LE RECEPTOR, LORSQU'ON LE RECOIS ON MET À JOUR TOUT LE TEMPLATE
                console.log(e);
                this.questions = e.questions;
                this.reset_template();
                break;
            case 'refreshLine':
                // ICI ON NE FAIT RIEN, ON ATTEND QUE LE RECEPTOR ENVOIE UN EVENEMENT SEND LINE
                break;
            case 'valideLine':
                // ICI ON NE FAIT RIEN, ON ATTEND QUE LE RECEPTOR ENVOIE UN EVENEMENT SEND LINE
                break;
            case 'sendLine':
                // Lorsqu'on reçois une nouvelle ligne, on met à jour la ligne dans le template :
                this.update_line();
                break;
        }
    }.bind(this);
    // PAR DEFAUT ON DEMANDE LES QUESTIONS DU NIVEAU ZERO (OU CO-PILOTE) AU RECEPTOR
    app.socket.emit('boardingpass', {"status":"getQuestions", "level":this.level});
}
boardingpass.reset_template = function(){
    console.log('reset template ', this.questions);
    $('.column.components .subcomponent').html(this.subcomponent_template({"questions":this.questions}));
    this.set_events();
}
boardingpass.set_events = function(){
    $('[data-bpaction]').off('click').on('click', function(e){
        // ON CHECK LA DEMANDE DU REGISSEUR
        switch($(this).attr('data-bpaction')){
            case 'refresh':
                // LE REGISSEUR A APPUYÉ SUR LA DEMANDE DE RAFRAICHISSEMENT D'UNE LIGNE
                app.socket.emit('boardingpass', {"status":"refreshLine", "id":$(this).attr('data-id'), "line":$(this).attr('data-line'), "value":""});
                break;
            case 'validate':
                // LE REGISSEUR A VALIDÉ UNE DESTINATION
                app.socket.emit('boardingpass', {"status":"updateLine", "id":$(this).attr('data-id'), "line":$(this).attr('data-line'), "value":""});
                break;
        }
    });
}
boardingpass.update_line = function(){
    
}