var ui = {
  templates : {
    header : null,
    footer : null
  },
  page_params: {
    page:"default",
    params:{}
  },
  init:function(){
    this.load_templates();
    this.setListeners();
  },
  load_templates : function(){
    _.each(_.keys(this.templates), function(key, index){
      $.get('views/'+key+'.tmpl', $.proxy(function(e){ui.templates[key] = _.template(e);}, this));
    });
    if($('#ui_layer').length === 0){
      $('body').append('<div class="ui_layer" id="ui_layer"></div>');
    }
    if($('#ui_templates').length === 0){
      console.log('load templates');
      $('body').append('<div class="ui_templates" id="ui_templates"></div>');
      $.get('views/ui/popin.tmpl', $.proxy(function(e){ui.templates.popin = _.template(e);}, this));
      $.get('views/ui/notification.tmpl', $.proxy(function(e){ui.templates.notification = _.template(e);}, this));
    }
    setTimeout($.proxy(function(){
      $('body').append(this.templates.header({}));
      $('body').append(this.templates.footer({}));
      this.navigate(window.location.pathname);
      this.setListeners();
    }, this),200);
  },
  setListeners : function(){
    $('[data-navigate]').click(function (event) {
      console.log('navigate');
      ui.navigate($(this).attr('data-navigate'));
      event.preventDefault();
      return false;
    });
  },
  navigate : function(url){
    app.socket_callback = function(e){console.log(e);}
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
  load_dependencies : function(){
    (this.page_params.page === "")? this.page_params.page = "default" : this.page_params.page = this.page_params.page;
    /* get descriptor */
    $.get('pages/'+this.page_params.page+'/descriptor.json', function(e){
      ui.descriptor = e;
      /* load content template */
      $.get('pages/'+ui.page_params.page+'/'+ui.descriptor.content.uri, function(e){
        ui.templates[ui.page_params.page] = _.template(e);
        /* TODO create transitions */
        //$('body main.app').html('');
        $('body main.app').append(ui.templates[ui.page_params.page](ui.descriptor.content.datas));
        $('body main.app .screen').last().css('left', '100%');
        /* load css dependencies */
        for(var c=0; c<ui.descriptor.dependencies.css.length; c++){
            if($('link[href="pages/'+ui.page_params.page+'/'+ui.descriptor.dependencies.css[c]+'"]').length === 0){
              var head  = document.getElementsByTagName('head')[0],
                  link  = document.createElement('link');
                  link.rel  = 'stylesheet';
                  link.type = 'text/css';
                  link.href = 'pages/'+ui.page_params.page+'/'+ui.descriptor.dependencies.css[c];
                  link.media = 'all';
                  head.appendChild(link);
            }
        }
        /* load js class and dependencies */
        for(var j=0; j<ui.descriptor.dependencies.js.length; j++){
          $.getScript( 'pages/'+ui.page_params.page+'/'+ui.descriptor.dependencies.js[j], function(e) {
            console.log('script loaded');
          });
        }
        /* load default page class then init there */
        $.getScript( 'pages/'+ui.page_params.page+'/'+ui.descriptor.class+'.js', function(e) {
          if($('body main.app .screen').length > 1){
            TweenMax.to($('body main.app .screen').first(), 1.5, {
              left:'-100%',
              ease:Power4.easeInOut
            });
            TweenMax.to($('body main.app .screen').last(), 1.5, {
              left:'0%',
              ease:Power4.easeInOut,
              onComplete:function(){
                window[ui.descriptor.class].init();
                $('body main.app .screen').first().remove();
              }
            });
          }else{
            $('body main.app .screen').last().css('left', '0%');
            window[ui.descriptor.class].init();
          }
        });
        /* setting header */
        if(!_.isUndefined(ui.descriptor.header) && ui.descriptor.header.display === true){
          $('header').css('top', '0px');
          ui.init_navbar();
        }else{
          $('header').css('top', '-80px')
          .remove('.header-navbar');
        }
        /* set footer */
        if(ui.descriptor.footer.display !== true){
          $('footer').css('bottom', '-80px');
        }else{
          $('footer').css('bottom', '0px');
        }
      });
    });
  },
  display_error : function(datas){
    $('.ui_layer').append(ui.templates.notification(datas));
    $('.cross_close').off('click').on('click', function(){
      $(this).parent().remove();
    });
  },
  setParams : function(url){
    url = url.replace('/','').split('/');
    this.page_params.page = url[0];
    this.page_params.params = {};
    for(var i=1; i<url.length; i+=2){
      this.page_params.params[url[i]] = url[i+1];
    }
    console.log(this.page_params);
  },
  init_navbar : function(){
    if(!_.isUndefined(ui.descriptor.header.tab_bar) && ui.descriptor.header.tab_bar.length > 0){
      $.get('views/header-navbar.tmpl', $.proxy(function(e){
        var temp = _.template(e);
        $('header').append(temp(ui.descriptor.header));
        $('header .select_bar').css({
          'width': $('.header-navbar ul li').first().width(),
          'left':$('.header-navbar ul li').first().position().left
        });
        //$(window).on('resize', function(){
        //  resizeTabNav();
        //});
        resizeTabNav();
        function resizeTabNav(){
          $('header .select_bar').css({
            'width': $('.header-navbar ul li.selected').first().outerWidth(),
            'left':$('.header-navbar ul li.selected').first().position().left
          });
        }
        $('header .header-navbar li').off('click').on('click', function(){
          $('header .header-navbar li').removeClass('selected');
          $(this).addClass('selected');
          resizeTabNav();
        });
        ui.navbar_scroll = new IScroll('#header_navbar_wrapper');
      }, this));
    }
  }
}
