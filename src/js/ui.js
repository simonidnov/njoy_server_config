var ui = {
    templates: {
        header: null,
        footer: null
    },
    page_params: {
        page: "default",
        params: {}
    },
    init: function() {
        this.load_templates();
        this.setListeners();
    },
    load_templates: function() {
        _.each(_.keys(this.templates), function(key, index) {
            $.get('views/' + key + '.tmpl', $.proxy(function(e) {
                ui.templates[key] = _.template(e);
            }, this));
        });
        if ($('#ui_layer').length === 0) {
            $('body').append('<div class="ui_layer" id="ui_layer"></div>');
        }
        if ($('#ui_templates').length === 0) {
            console.log('load templates');
            $('body').append('<div class="ui_templates" id="ui_templates"></div>');
            $.get('views/ui/popin.tmpl', $.proxy(function(e) {
                ui.templates.popin = _.template(e);
            }, this));
            $.get('views/ui/notification.tmpl', $.proxy(function(e) {
                ui.templates.notification = _.template(e);
            }, this));
        }
        setTimeout($.proxy(function() {
            $('body').append(this.templates.header({}));
            $('body').append(this.templates.footer({}));
            this.navigate(window.location.pathname);
            this.setListeners();
        }, this), 200);
    },
    test_popin : function(){
        ui.popin({
                "illus":"url",
                "title":"test",
                "message":"message test",
                "buttons":[
                    {"label":"button 1"},
                    {"label":"button 2"}
                ]
            }, function(e){console.log(e);});  
    },
    popin : function(params, callback){
        if($('#popin_ui_content').length > 0){
            $('#popin_ui_content').remove();
        }
        ui.popin_callBack = callback;
        $('body').append(ui.templates.popin(
            params
        ));
        $('#popin_ui_content .popin').css('top', '100%');
        TweenMax.to($('#popin_ui_content .popin'), .5, {top:0, ease:Back.easeOut});
        $('[data-popbutton]').on('click', function(e){
           ui.close_popin($(this).attr('data-popbutton'));
        });
        $('#close_popin').on('click', function(){ui.close_popin();})
    },
    close_popin:function(e){
        console.log('close popin ', e);
        TweenMax.to($('#popin_ui_content .popin'), .5, {top:"100%", opacity:0, ease:Back.easeIn});
        TweenMax.to($('#popin_ui_content'), .5, {opacity:0, delay:.5, onComplete:function(){
            $('#popin_ui_content').remove();
        }});
        ui.popin_callBack(e);
    },
    setListeners: function() {
        $('[data-navigate]').click(function(event) {
            console.log('navigate');
            ui.navigate($(this).attr('data-navigate'));
            event.preventDefault();
            return false;
        });
    },
    navigate: function(url) {
        /*var uri = url.split('/')[0];
        if(URIError === "app_dashboard"){
            app.selected_app = app.activities.activities[url.split('/')[1]];
        }*/
        app.socket_callback = function(e) {
            console.log(e);
        }
        if(url.indexOf('logout') !== -1){
            ui.popin({
                "illus":"img/logout_illus.svg",
                "title":"Déconnexion",
                "message":"Si vous continuez vous allez vous déconnecter du serveur.<br/>Êtes vous certain de vouloir continuer ?",
                "buttons":[
                    {"label":"Annuler"},
                    {"label":"Déconnexion", class:"error"}
                ]
            }, function(e){
                console.log('closed ', e);
                if(parseInt(e) === 1){
                    ui.navigate('/');
                }
            }); 
            return false;
        }
        window.history.pushState("", "", url);
        this.setParams(url);
        this.load_dependencies();
        /*switch(url){
          case "/":
            $('body main.app').append(this.templates.default({}));
            break;
          default:
            $('body main.app').append(this.templates.default({}));
            break;
        }*/
    },
    load_dependencies: function() {
        //alert(this.page_params.page);
        (this.page_params.page === "") ? this.page_params.page = "default": this.page_params.page = this.page_params.page;
        /* get descriptor */
        console.log('this.page_params ', '/pages/' + this.page_params.page + '/descriptor.json');
        $.get('/pages/' + this.page_params.page + '/descriptor.json', function(e) {
            console.log(ui.page_params.page, ' ////////// ', e);
            ui.descriptor = e;
            /* load content template */
            $.get('pages/' + ui.page_params.page + '/' + ui.descriptor.content.uri, function(e) {
                ui.templates[ui.page_params.page] = _.template(e);
                /* TODO create transitions */
                //$('body main.app').html('');
                $('body main.app').append(ui.templates[ui.page_params.page](ui.descriptor.content.datas));
                $('body main.app .screen').last().css('left', '100%');
                /* load css dependencies */
                for (var c = 0; c < ui.descriptor.dependencies.css.length; c++) {
                    if ($('link[href="pages/' + ui.page_params.page + '/' + ui.descriptor.dependencies.css[c] + '"]').length === 0) {
                        var head = document.getElementsByTagName('head')[0],
                            link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.type = 'text/css';
                        link.href = 'pages/' + ui.page_params.page + '/' + ui.descriptor.dependencies.css[c];
                        link.media = 'all';
                        head.appendChild(link);
                    }
                }
                /* load js class and dependencies */
                for (var j = 0; j < ui.descriptor.dependencies.js.length; j++) {
                    $.getScript('pages/' + ui.page_params.page + '/' + ui.descriptor.dependencies.js[j], function(e) {
                        console.log('script loaded');
                    });
                }
                /* load default page class then init there */
                $.getScript('pages/' + ui.page_params.page + '/' + ui.descriptor.class + '.js', function(e) {
                    if ($('body main.app .screen').length > 1) {
                        TweenMax.to($('body main.app .screen').first(), 1.5, {
                            left: '-100%',
                            ease: Power4.easeInOut
                        });
                        TweenMax.to($('body main.app .screen').last(), 1.5, {
                            left: '0%',
                            ease: Power4.easeInOut,
                            onComplete: function() {
                                window[ui.descriptor.class].init();
                                $('body main.app .screen').first().remove();
                            }
                        });
                    } else {
                        $('body main.app .screen').last().css('left', '0%');
                        window[ui.descriptor.class].init();
                    }
                });
                /* setting header */
                if (!_.isUndefined(ui.descriptor.header) && ui.descriptor.header.display === true) {
                    $('header').css('top', '0px');
                    ui.init_navbar();
                } else {
                    $('header').css('top', '-80px')
                        .remove('.header-navbar');
                }
                /* set footer */
                if (ui.descriptor.footer.display !== true) {
                    $('footer').css('bottom', '-80px');
                } else {
                    $('footer').css('bottom', '0px');
                }
                ui.setListeners();
                ui.init_scroll_view();
            });
        });
    },
    display_error: function(datas) {
        $('.ui_layer').append(ui.templates.notification(datas));
        $('.cross_close').off('click').on('click', function() {
            $(this).parent().remove();
        });
    },
    setParams: function(url) {
        url = url.replace('/', '').split('/');
        this.page_params.page = url[0];
        this.page_params.params = {};
        for (var i = 1; i < url.length; i += 2) {
            this.page_params.params[url[i]] = url[i + 1];
        }
    },
    init_navbar: function() {
        if(typeof ui.descriptor.header.nav_left !== "undefined"){
            $('header .left_nav').remove();
            for(var i=0; i<ui.descriptor.header.nav_left.length; i++){
                $('header').append('<div class="left_nav"><div class="head_button" data-navigate="'+ui.descriptor.header.nav_left[i].link+'"><div class="icon" style="background-image:url(img/'+ui.descriptor.header.nav_left[i].icon+'.svg);"></div><span>'+ui.descriptor.header.nav_left[i].label+'</span></div></div>');
            }
        }
        if (!_.isUndefined(ui.descriptor.header.tab_bar) && ui.descriptor.header.tab_bar.length > 0) {
            $.get('views/header-navbar.tmpl', $.proxy(function(e) {
                var temp = _.template(e);
                $('header').append(temp(ui.descriptor.header));
                $('header .select_bar').css({
                    'width': $('.header-navbar ul li').first().width(),
                    'left': $('.header-navbar ul li').first().position().left
                });
                //$(window).on('resize', function(){
                //  resizeTabNav();
                //});
                resizeTabNav();

                function resizeTabNav() {
                    $('header .select_bar').css({
                        'width': $('.header-navbar ul li.selected').first().outerWidth(),
                        'left': $('.header-navbar ul li.selected').first().position().left
                    });
                }
                $('header .header-navbar li').off('click').on('click', function() {
                    $('header .header-navbar li').removeClass('selected');
                    $(this).addClass('selected');
                    resizeTabNav();
                });
                ui.navbar_scroll = new IScroll('#header_navbar_wrapper');
            }, this));
        }
    },
    init_scroll_view: function() {
        setTimeout(function(){
            $('.screen').css({'height':window.innerHeight-$('header').height(), "overflow":"hidden"});
            $('.screen .wrapper').css({'height':"100%", 'width':"100%", "overflow":"hidden"});
            $('.screen .wrapper .scroller').css({'display':"table", "width":"100%"});
            if($('.screen .wrapper .scroller').length === 1){
                ui.page_scroll = new IScroll('#screen_wrapper',{mouseWheel:true, click: true});
            }
        },500);
    }
}