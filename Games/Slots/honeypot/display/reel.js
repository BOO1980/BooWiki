HoneyPot.Reel = function(data,id){
	HoneyPot.Container.call(this,data);

	this.slotTextures = data.slotTextures;
	this.reelWidth = data.reelWidth;
	this.symbolHeight = data.symbolHeight;
	this.symbolWidth = data.symbolWidth;
	this.symbolAnchor = data.anchor ? data.anchor : 0;
	this.blur = new PIXI.filters.BlurFilter();
	this.blur.blurX = 0;
	this.blur.blurY = 0;
	this.reelBlur = data.reelBlur ? data.reelBlur : 5;
	this.symbols = [];
	this.spinning = false;
	this.spinSpeed = data.spinSpeed ? data.spinSpeed :10;
	this.symbolYSpacer = data.symbolYSpacer ? data.symbolYSpacer :0;
	this.delay = data.delay ? data.delay :  0;
	this.delayCount = 0;
	this.stopDelay = data.stopDelay ? data.stopDelay : 0;
	this.stopAnticipation = 0;
	this.stopDelayCount = 0;
	this.state = "idle";
	this.rampUpSpeed = data.rampUpSpeed ? data.rampUpSpeed : 0;
	this.rampUpDistance = data.rampUpDistance ? data.rampUpDistance : 0;
	this.bounceUpSpeed = data.bounceUpSpeed ? data.bounceUpSpeed : 0;
	this.bounceDistance = data.bounceDistance ? data.bounceDistance : 0;
	this.reelstopSound = data.reelstopSound ? data.reelstopSound : 'reelstopSound';

	this.symbolWinAlpha = data.symbolWinAlpha ? data.symbolWinAlpha : 1;

	this.symbolsInView = data.symbolsInView ? data.symbolsInView+2 : 5;

	this.symbolAnimationSpeed = data.symbolAnimationSpeed ? data.symbolAnimationSpeed : 0.5;

	this.reelSet = data.reelSet;
	this.reelSetPostition = 0;
	this.reelStoppedCallback;

	this.stopCount = 0;

	this.stopPosition;

	this.filters = [this.blur];

	this.addSymbols();
}

HoneyPot.Reel.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.Reel.prototype.constructor = HoneyPot.Reel;

HoneyPot.Reel.prototype.addSymbols = function(){
	var startPos = [16,0,0,0,0]
	for(var j = 0; j < this.symbolsInView; j++){
		//var symbol = new HoneyPot.Sprite({image:this.slotTextures[ this.reelSet[j]]});
		var symbol = new HoneyPot.AnimatedSprite({image:this.slotTextures[ this.reelSet[j]], anchor:this.symbolAnchor,animationSpeed:this.symbolAnimationSpeed});  
		symbol.y = ((j-1)*(this.symbolHeight+this.symbolYSpacer))+this.symbolYSpacer;
		symbol.x = Math.round((this.reelWidth - this.symbolWidth)/2);
		this.addChild(symbol);
		this.symbols.push(symbol);
	}
}
HoneyPot.Reel.prototype.update = function(delta){
	if(this.delayCount > 0){
		this.delayCount -= 1;
		return;
	}
	if(this.state != "idle"){
		

		if(this.state == "rampUp"){
			if(this.symbols[1].y <=-this.rampUpDistance){
				this.blur.blurY = this.reelBlur;
				this.state = "spin";
			}else{
				for( var j = 0; j < this.symbols.length; j++){
					var symbol = this.symbols[j];
					symbol.y -= this.rampUpSpeed;
				}
			}
		}else if(this.state == "bounceUp"){
			for( var j = 0; j < this.symbols.length; j++){
				var symbol = this.symbols[j];
				symbol.y -= this.bounceUpSpeed;
			}
			if(this.symbols[1].y <= 0){	
				for( var j = 0; j < this.symbols.length; j++){
					var symbol = this.symbols[j];
					symbol.y = ((j-1)*(this.symbolHeight+this.symbolYSpacer))+this.symbolYSpacer;
				}
				
				this.state = "idle";
				this.reelStopped();
			}
			
		}else{
			if(this.state == "spin" || this.state == "stopping"  || this.state == "stop" || this.state == "stoppingCount" || this.state == "bounce"){
				
				for( var j = 0; j < this.symbols.length; j++){
					var symbol = this.symbols[j];
					symbol.y += this.spinSpeed;
				}

				if(this.symbols[0].y >= 0){	
					for( var j=this.symbols.length-1; j >0; j--){
						//this.symbols[j].textures = this.symbols[j-1].textures;
						this.symbols[j].setTexture(this.symbols[j-1].getTexture());
						this.symbols[j].y = (j-1)*(this.symbolHeight+this.symbolYSpacer);
					}

					this.symbols[0].updateTextureSymbol(this.slotTextures[this.getReelSetPostion()]);
				 
					this.symbols[0].y -= (this.symbolHeight+this.symbolYSpacer);
					if(this.state == "stop" ){
						//PIXI.Loader.shared.resources.reelstopSound.sound.play();
						this.app.playSound(this.reelstopSound);
						this.state = "bounce";
					}
					if(this.state == "stopping"){
						this.stopCount -=1;
						
						if(this.stopCount == 0){
							
							this.state = "stop";
						}
					}
				}


				if(this.state == "stoppingCount"){
					if(this.stopDelayCount > 0){
						this.stopDelayCount -= 1;
					}else{
						this.reelSetPostition = this.stopPosition;
						this.state = "stopping";
					}
				}
				if(this.state == "bounce"){
					if(this.symbols[1].y >= this.bounceDistance){	
						this.blur.blurY = 0;
						this.state = "bounceUp";
					}
				}
			}
		}
	}

}
HoneyPot.Reel.prototype.reelStopped = function(){
	this.stopAnticipation = 0;
	this.reelStoppedCallback(this.id);
}
HoneyPot.Reel.prototype.getReelSetPostion = function(){
	this.reelSetPostition -= 1
	if(this.reelSetPostition == -1){
		this.reelSetPostition = this.reelSet.length-1;
	}
	return this.reelSet[this.reelSetPostition];
}
HoneyPot.Reel.prototype.stopReel = function(callback){
	this.reelStoppedCallback = callback;
	var tmpstopPos = Math.ceil(this.stopPosition) + 4
	if(tmpstopPos > this.reelSet.length){
		tmpstopPos = (Math.ceil(this.stopPosition) +4) - this.reelSet.length;
	}

	this.stopPosition = tmpstopPos;
	this.stopDelayCount = this.stopDelay+this.stopAnticipation;
	this.stopCount = 4;
	this.state = "stoppingCount";
}

HoneyPot.Reel.prototype.spinReel = function(){
	this.delayCount = this.delay;
	this.state = "rampUp";

}

HoneyPot.Reel.prototype.setReelSet = function(rs){
	this.reelSet = rs;
	if(this.reelSetPostition >= rs.length){
		this.reelSetPostition = 0;
	}
}
HoneyPot.Reel.prototype.resetAlpha = function(){
	for(var i=0;i<this.symbols.length;i++){
		this.symbols[i].alpha = 1;
	}
}
HoneyPot.Reel.prototype.setHideAlpha = function(){
	for(var i=0;i<this.symbols.length;i++){
		this.symbols[i].alpha = this.symbolWinAlpha;
	}
}
HoneyPot.Reel.prototype.animateSymbol = function(id){
	this.symbols[id].alpha = 1;
	this.symbols[id].gotoAndPlay(0);
}


