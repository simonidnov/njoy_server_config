 function melanie() {
   console.log('hello melanie');
 }
 melanie.init = function () {
   console.log('je suis prête');
   app.socket_callback = function (e) {
     switch (e.status) {
       case 'EVENT_NAME_TO_DEFINE':
         // ON NE FAIT RIEN DE CE COTÉ, LORSQUE LE CALL EST ENVOYÉ ON ATTEND UN SENDQUESTION DEPUIS LE RECEPTOR
         break;
       default:
         console.log('we receive an unknow event from melanie websocket server');
         break;
     }
   }.bind(this);

   $.get("pages/melanie/melanie.tmpl", $.proxy(function (e) {
     melanie.subcomponent_template = _.template(e);
     melanie.reset_template();
   }, this));
 }
 melanie.reset_template = function () {
   $('.column.components .subcomponent').html(this.subcomponent_template({}));
 }
 melanie.sayHello = function () {
   app.socket.emit('melanie', {
     message: "hello"
   });
 }
 /* 
 var newApp = function (name) {
   this.name = name;
 }
 newApp.prototype.getName = function () {
   return this.name;
 } */



 /* sticky breadcrump */
 // When the user scrolls the page, execute myFunction 
 /* const myApp = {
   navbarid: null,
   paralaxs: [],
   sticky: null,
   classItem: null,
   init: function (navTarget, classItem, paralaxItems) {
     this.classItem = classItem;
     window.onscroll = function () {
       this.scroll()
     };
     switch (typeof navTarget) {
       case 'object':
         this.navbarid = navTarget;
         this.sticky = navbarid.offsetTop;
         break;
       case 'string':
         if (typeof document.getElementById(navTarget) !== 'undefined') {
           this.navbarid = document.getElementById(navTarget);
           this.sticky = navbarid.offsetTop;
         }
         break;
     }
     this.paralaxs = paralaxItems;
   },
   scroll: function () {
     for (let p in parallax) {
       p.style.backgroundPositionY = (window.pageYOffset * 0.7).toFixed(1) + 'px';
     }
     if (navbarid !== null) {
       if (window.pageYOffset >= sticky) {
         navbarid.classList.add(this.classItem)
       } else {
         navbarid.classList.remove(this.classItem);
       }
     }
   }
 }

 myApp.init(
   "manav",
   "sticky",
   document.getElementsByClassName("parallax")
 );

 var fj = function (str) {
   if (str.indexOf('#') !== -1) {
     return document.getElementById(str.replace('#', ''));
   } else if (str.indexOf('.') !== -1) {
     return document.getElementsByClassName(str.replace('.', ''));
   } else {
     return document.getElementsByTagName(str);
   }
 } */