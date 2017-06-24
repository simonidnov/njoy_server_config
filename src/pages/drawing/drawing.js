/*
  TODO ::: GET DEVICE PIXEL ASPECT RATIO
  TODO ::: DEFINE BASE CANVAS SIZE ON INIT
  TODO ::: SET EMITER NODE WEBSITE SOCKET THEN DISPLAY MULTISCREEN
*/

var drawing = {
  drawing_tool : null,
  init:function(){
    //app.socket_callback = function(e){
    //  console.log("get activities : ", e);
    //}
    //app.socket.emit("njoy", {"status":"activities"});
    //ui.navigate('/drawing');
    this.drawing_tool = new drawer("drawer").init();
  },
  destroy : function(){
    console.log('destroy drawing');
  }
}
var drawer = function(canvas_id){
  console.log('drawer created');
  this.canvas = document.getElementById(canvas_id);
  // TODO REMOVE TEST SIZE
  this.canvas.style.width = window.innerWidth;
  this.canvas.style.height = window.innerHeight;
  $('#canvas_id').css({
    "width":$('body').width()+'px !important',
    "height":$('body').height()+'px !important'
  })
  this.pencil = {"color":"#000000", "size":2, "stylingW":"round", "stylingH":"round"};
  this.stage = new createjs.Stage(canvas_id);
  this.stage.autoClear = true;
  this.stage.update();
  this.touchPos = {x:0, y:0};
  this.isMouseDown = false;
  this.currentShape = [];
  createjs.Ticker.addEventListener("tick", $.proxy(function(){this.update();},this));
}
drawer.prototype.set_pencil = function(params){
  $.each(_.keys(params), $.proxy(function(index, param){
    this.pencil[param] = params[param];
  }, this));
}
drawer.prototype.init = function(){
  console.log('drawer inited');
  this.create_events();
}
drawer.prototype.create_events = function(){
    console.log('drawer events created');
    //if ("ontouchstart" in window) {
        createjs.Touch.enable(this.stage);
        this.stage.on("stagemousedown", $.proxy(function(evt){
          this.isMouseDown = true;
          var s = new createjs.Shape();
          if ("ontouchstart" in window) {
              this.oldX = e.stageX;
              this.oldY = e.stageY;
              this.oldMidX = e.stageX;
              this.oldMidY = e.stageY;
              this.touchPos = {x:e.stageX, y:e.stageY};
          }else{
              this.oldX = this.stage.mouseX;
              this.oldY = this.stage.mouseY;
              this.oldMidX = this.stage.mouseX;
              this.oldMidY = this.stage.mouseY;
          }

          var g = s.graphics;
          //var thickness = Math.random() * 30 + 10 | 0;
          g.setStrokeStyle(10, 'round', 'round');

          var color = createjs.Graphics.getRGB(0,0,0);
          g.beginStroke(this.pencil.color);
          this.stage.addChild(s);
          this.currentShape[this.currentShape.length] = s;
        },this));
        this.stage.on("stagemousemove", $.proxy(function(evt){
          this.touchPos = {x:evt.stageX, y:evt.stageY};
        },this));
        this.stage.on("stagemouseup", $.proxy(function(evt){
          this.isMouseDown = false;
        },this));
    //} else {
    //    $('#drawing_canvas').on('mousedown', this.handleMouseDown);
    //    $('#drawing_canvas').on('mouseup', this.handleMouseUp);
    //}
}
drawer.prototype.update = function() {
    if (this.isMouseDown) {
        if(this.touchPos !== null){
            var pt = new createjs.Point(this.touchPos.x, this.touchPos.y);
        }else{
            var pt = new createjs.Point(this.stage.mouseX, this.stage.mouseY);
        }
        var midPoint = new createjs.Point(this.oldX + pt.x>>1, this.oldY+pt.y>>1);
        if(typeof this.currentShape[this.currentShape.length-1] != "undefined"){
            this.currentShape[this.currentShape.length-1].graphics.setStrokeStyle(this.pencil.size, this.pencil.stylingW, this.pencil.stylingH);
            this.currentShape[this.currentShape.length-1].graphics.moveTo(midPoint.x, midPoint.y);
            this.currentShape[this.currentShape.length-1].graphics.curveTo(this.oldX, this.oldY, this.oldMidX, this.oldMidY);
        }
        this.oldX = pt.x;
        this.oldY = pt.y;

        this.oldMidX = midPoint.x;
        this.oldMidY = midPoint.y;
        this.stage.update();

        this._removed = [];
    }
    //this.set_active_tools();
}
drawer.prototype.cancel = function(){

}
drawer.prototype.clear = function(){

}
drawer.prototype.destroy = function(){

}
