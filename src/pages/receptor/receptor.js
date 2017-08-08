var receptor = {
    init:function(){
        /* on receive node_log print */
        app.socket_callback = $.proxy(function(e){
            if(typeof e.datas !== "undefined"){
                this.create_component(e.datas);
            }
        }, this);
    },
    create_component : function(datas){
        console.log("app.selected_app :: ", app.selected_app);
        $('.module').html('');
        switch(datas.status){
            case "video":
                break;
            case "playlist_video":
                break;
            case "audio":
                break;
            case "playlist_audio":
                break;
            case "picture":
                break;
            case "":
                break;
            case "success":
                break;
            case "fail":
                break;
            case "object":
                this.object_component(datas);
                break;
            
        }
    },
    object_component : function(datas){
        switch (datas.component){
            case "quiz_component":
                break;
            case "golden_family":
                $('.module').append('<div class="golden_family"><ul class="choices"></ul></div>');
                for(var i=0; i<datas.tools.menu[datas.menu].components.golden_family[datas.component_id].choices.length; i++){
                    console.log(datas.tools.menu[datas.menu].components.golden_family[datas.component_id].choices[i]);
                    $('.receptor .module .golden_family ul.choices').append('<li><div class="front"></div><div class="back">'+datas.tools.menu[datas.menu].components.golden_family[datas.component_id].choices[i]+"</div></li>");
                }
                $('.receptor .module .golden_family ul.choices li').on('click', function(){
                    if($(this).hasClass('selected')){
                        $(this).removeClass('selected');
                    }else{
                        $(this).addClass('selected');
                    }
                });
                break;
        }
    },
    destroy : function(){
        console.log('destroy receptor');
    }
}
