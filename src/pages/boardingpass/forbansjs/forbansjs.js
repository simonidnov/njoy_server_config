var forbans = function() {
    this.iterations = 0;
    this.charArray  = [];
    this.animated   = false;
    this.duration   = 0;
    this.charSet    = [];
    this.charMax    = 0;
    this.target     = null;
    this.value      = "";
    this.delta      = 0;
}
forbans.prototype.init = function(target, options, callback){
    if(typeof target === "undefined" || target === null){
        callback({status:"error", msg:"your target is undefined"});
        return false;
    } 
    this.target = target;

    if(typeof options.charMax === "undefined"){
        callback({status:"error", msg:"you need a charMax param to create grid"}); 
        return false;
    } 
    this.charMax = options.charMax;
    
    if(typeof options.value === "undefined") options.value = target.innerHTML; 
    
    if(typeof options.delta !== "undefined") this.delta = options.delta;
    if(typeof options.duration !== "undefined") this.duration = options.duration;
    if(typeof options.iterations !== "undefined") this.iterations = options.iterations;

    this.createGrid();
    this.setValue(options.value);
}
forbans.prototype.createGrid = function(){
    if(this.target.classList.value.indexOf('forbans') === -1) this.target.classList.add("forbans");
    var flapTemplate = '<div class="flipflap" data-value=""><div class="flip"></div><div class="flap"></div></div>';
    this.target.innerHTML = flapTemplate.repeat(this.charMax);
    this.charSet = this.target.getElementsByClassName('flipflap');
}
forbans.prototype.setValue = function(value){
    var space = " ",
        possibility = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; 
    this.value = value;
    
    this.target = document.getElementById(this.target.getAttribute('id'));
    this.charSet = this.target.getElementsByClassName('flipflap');

    (value.length < this.charMax)? this.value += space.repeat(this.charMax - value.length) : this.value = value.substring(0, this.charMax);
    this.charArray = this.value.split('');

    this.charArray.forEach(function(char, index){ 
        var character = this.charSet[index];
            character.setAttribute('data-value', char);
        setTimeout(function(){
            character.getElementsByClassName('flip')[0].innerHTML = char;
            character.getElementsByClassName('flap')[0].innerHTML = char;
            if(character.classList.value.indexOf('turn') !== -1){
                character.classList.remove('turn');
            }else{
                character.classList.add('turn');
            } 
        }.bind(this), 20+(40*index));
    }.bind(this));
    //this.target.innerHTML = this.target.innerHTML;
}