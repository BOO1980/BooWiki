HoneyPot.BigWinPanel = function(config){
	HoneyPot.Container.call(this, config);

	this.bigWinTxt;
	this.superWinTxt;
	this.megaWinTxt;
	this.circleLights1;
	this.circleLights2;
	this.circleLights3;
	this.glowbw;
	this.starBurst;

	this.bigwinMultiplier = 20;
	this.superwinMultiplier = 40;
	this.megawinMultiplier = 80;

	this.bigwinHit = false;
	this.superwinHit = false;
	this.megawinHit = false;

	this.totalWInContainer;
	this.state = 'idle';

	this.delayCount;
	this.win;
	this.increment;
	this.currentVal;
	this.stake;
	this.emitterContainer;
	this.glowbwTop;
	this.tallyWin;

	this.bgOverlay;

	this.winShownCallBack;

	this.killElementsComplete = false;
}

HoneyPot.BigWinPanel.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.BigWinPanel.prototype.constructor = HoneyPot.BigWinPanel;

HoneyPot.BigWinPanel.prototype.init = function(cb){
	this.winShownCallBack = cb;

	var mask = new HoneyPot.Graphic({x:0,y:0,colour:'0x000000',rect:{x:0,y:0,width:this.app.getGameWidth(),height:this.app.getGameHeight()}});
	this.addChild(mask);
	this.mask = mask;

	this.bgOverlay = new HoneyPot.Graphic({x:0,y:0,colour:'0x000000',rect:{x:0,y:0,width:this.app.getGameWidth(),height:this.app.getGameHeight()}});
	this.addChild(this.bgOverlay);
	this.bgOverlay.alpha = 0.6;
	this.bgOverlay.visible = false;

	this.emitterContainer = new HoneyPot.Container({x:0,y:0});
	this.addChild(this.emitterContainer);

	this.emitter = new PIXI.particles.Emitter(this.emitterContainer,['particle'],{
			"alpha": {
				"start": 1,
				"end": 1
			},
			"scale": {
				"start": 0.001,
				"end": 2,
				"minimumScaleMultiplier": 1
			},
			"color": {
				"start": "#ffffff",
				"end": "#5ce9ff"
			},
			"speed": {
				"start": 500,
				"end": 800,
				"minimumSpeedMultiplier": 1
			},
			"acceleration": {
				"x": 0,
				"y": 0
			},
			"maxSpeed": 0,
			"startRotation": {
				"min": 0,
				"max": 360
			},
			"noRotation": false,
			"rotationSpeed": {
				"min": 0,
				"max": 0
			},
			"lifetime": {
				"min": 0.001,
				"max": 1
			},
			"blendMode": "normal",
			"frequency": 0.005,
			"emitterLifetime": -1,
			"maxParticles": 50,
			"pos": {
				"x": 0,
				"y": 0
			},
			"addAtBack": false,
			"spawnType": "circle",
			"spawnCircle": {
				"x": 0,
				"y": 0,
				"r": 0
			}
		});
	this.emitter.emit = false;
	this.emitter.updateOwnerPos((this.app.getGameWidth()/2),(this.app.getGameHeight()/2));



	this.starBurst = new HoneyPot.Sprite({x:this.app.getGameWidth()/2,y:((this.app.getGameHeight()/2)-10),imageName:"starBurst",anchor:0.5});
	this.addChild(this.starBurst);
	this.starBurst.visible = false;

	this.glowbw = new HoneyPot.Sprite({x:this.app.getGameWidth()/2,y:((this.app.getGameHeight()/2)-10),imageName:"glowbw",anchor:0.5});
	this.addChild(this.glowbw);

	this.circleLights1 = new HoneyPot.Sprite({x:this.app.getGameWidth()/2,y:((this.app.getGameHeight()/2)-10),imageName:"circleLights",anchor:0.5,scale:0.6 });
	this.addChild(this.circleLights1);
	this.circleLights1.visible = false;
	this.circleLights2 = new HoneyPot.Sprite({x:this.app.getGameWidth()/2,y:((this.app.getGameHeight()/2)-10),imageName:"circleLights",anchor:0.5,scale:0.8});
	this.addChild(this.circleLights2);
	this.circleLights2.visible = false;
	this.circleLights3 = new HoneyPot.Sprite({x:this.app.getGameWidth()/2,y:((this.app.getGameHeight()/2)-10),imageName:"circleLights",anchor:0.5});
	this.addChild(this.circleLights3);
	this.circleLights3.visible = false;

	this.bigWinTxt = new HoneyPot.Sprite({x:this.app.getGameWidth()/2,y:((this.app.getGameHeight()/2)-45),imageName:"bigwin",anchor:0.5});
	this.addChild(this.bigWinTxt);
	this.bigWinTxt.visible = false;
	this.superWinTxt = new HoneyPot.Sprite({x:this.app.getGameWidth()/2,y:((this.app.getGameHeight()/2)-150),imageName:"superbw",anchor:0.5});
	this.superWinTxt.visible = false;
	this.addChild(this.superWinTxt);
	this.megaWinTxt  = new HoneyPot.Sprite({x:this.app.getGameWidth()/2,y:((this.app.getGameHeight()/2)-160),imageName:"megabw",anchor:0.5});
	this.addChild(this.megaWinTxt);
	this.megaWinTxt.visible = false;

	this.totalWInContainer = new HoneyPot.Container({x:this.app.getGameWidth()/2,y:((this.app.getGameHeight()/2)+10)});
	this.addChild(this.totalWInContainer);
	this.totalWInContainer.visible = false;


	this.glowbwTop = new HoneyPot.Sprite({x:this.app.getGameWidth()/2,y:((this.app.getGameHeight()/2)-10),imageName:"glowbw",anchor:0.5});
	this.addChild(this.glowbwTop);
	this.glowbwTop.visible = false;

	//this.show('£2,305.00');
}

HoneyPot.BigWinPanel.prototype.update = function(delta){
	if(this.state != 'idle'){
		this.emitter.update(delta*0.01);
	}
	if(this.state == 'show'){
		
		if(this.delayCount > 0){
			this.delayCount -= 1;
			return;
		}
		if(this.currentVal < this.tallyWin){
			this.currentVal += this.increment;
			this.processWin(this.currentVal);
			this.delayCount = 1;
		}else{
			if(this.tallyWin != this.win){
				this.tallyWin = this.win;
				this.currentVal += this.increment;
				this.increment = this.win/100;
				this.processWin(this.currentVal);
				this.delayCount = 1;
			}else{
				this.skip();
			}
			//this.showWin(HoneyPot.Currency.formatMoneyPence(this.win));
			//this.state = 'idle';
			//this.winShownCallBack();
		}
	}
}
HoneyPot.BigWinPanel.prototype.skip = function(){
	if(this.state == 'show'){
		this.interactive = false;
	    this.buttonMode = false;
		this.state = 'skipped';
		this.currentVal = this.win;
		this.processWin(this.win);
		this.killElements();
		var timer = 1;
		if(this.win >= (this.bigwinMultiplier * this.stake)){
			timer = 3;  
		}
		TweenLite.to(this, 0.3, {delay:timer,onComplete:this.bigWinFaded.bind(this),pixi:{alpha:0}});
	}
}


HoneyPot.BigWinPanel.prototype.killElements = function(){
	if(!this.killElementsComplete){
		this.killElementsComplete = true; 
		this.app.stopSound('tallyUpLoopSound');
		this.app.playSound('tallyUpEndSound');

		this.app.playSound('bigWinEndSound');
		this.app.stopSound('superBigWinSound');
		this.app.stopSound('megaBigWinSound');
		this.app.stopSound('alarmSound');
		this.app.stopSound('bellSound');
		this.app.stopSound('bigWinSound');
		this.app.stopSound('applauseSound');

		TweenLite.killTweensOf(this.bigWinTxt);
		TweenLite.killTweensOf(this.superWinTxt);

		TweenMax.killTweensOf(this.starBurst);
		TweenMax.killTweensOf(this.circleLights1);
		TweenMax.killTweensOf(this.circleLights2);
		TweenMax.killTweensOf(this.circleLights3);

		this.emitter.resetPositionTracking();
		this.emitter.cleanup();
		this.emitter.emit = false;
	}
}
HoneyPot.BigWinPanel.prototype.bigWinFaded = function(){
	this.state = 'idle';
	this.winShownCallBack();
}
HoneyPot.BigWinPanel.prototype.hide = function(){
	this.state = 'idle';
	this.visible = false;
	TweenLite.killTweensOf(this);
	this.killElements();
	this.winShownCallBack();
}
HoneyPot.BigWinPanel.prototype.show = function(val,stake){
	this.stake =stake;//HoneyPot.Currency.convertPenceToDecimal(stake);

	this.killElementsComplete = false;
	this.win = val;
	this.tallyWin = this.win;
	this.bigwinHit = false;
	this.superwinHit = false;
	this.megawinHit = false;
	this.glowbwTop.visible = false;

	this.bigWinTxt.visible = false;
	this.megaWinTxt.visible = false;
	this.superWinTxt.visible = false;
	this.starBurst.visible = false;
	this.circleLights1.visible = false;
	this.circleLights2.visible = false;
	this.circleLights3.visible = false;
	this.totalWInContainer.visible = false;
	this.glowbw.setScale(1);

	if((this.win >= (this.bigwinMultiplier * this.stake))&&(this.win <= (this.superwinMultiplier * this.stake))){
		this.increment = this.win / 200;
	}else if((this.win >= (this.superwinMultiplier * this.stake))&&(this.win <= (this.megawinMultiplier * this.stake))){
		this.increment = this.win / 300;
	}else if((this.win >= (this.megawinMultiplier * this.stake))){
		this.tallyWin = (this.megawinMultiplier * this.stake);
		this.increment = this.tallyWin / 400;
	}else{
		this.increment = this.win / 100;
	}

	
	this.currentVal = 0;
	this.processWin(this.currentVal,-10);
	this.app.playSound('tallyUpLoopSound',true,0.3);
	
	this.alpha=1;
	this.visible = true;
	this.delayCount = 1;
	this.state = 'show';
	this.emitter.resetPositionTracking();
	this.emitter.emit = false;

}

HoneyPot.BigWinPanel.prototype.processWin = function(val){
	if((val >= (this.bigwinMultiplier * this.stake))&&(val <= (this.superwinMultiplier * this.stake))){
		this.showBigWin(val);
	}else if((val >= (this.superwinMultiplier * this.stake))&&(val <= (this.megawinMultiplier * this.stake))){
		this.showSuperWin(val);
	}else if((val >= (this.megawinMultiplier * this.stake))){
		this.showMegaWin(val);
	}else{
		this.showWinTxt(HoneyPot.Currency.formatMoneyPence(val),-10);
	}
}

HoneyPot.BigWinPanel.prototype.explodeComplete = function(){
	var newScale = 1;
	if(this.superwinHit){
		newScale = 1.5;
	}else if(this.megawinHit){
		newScale = 2;
	}
	TweenLite.to(this.glowbw, 0.1, {pixi:{scale:newScale}});
}
HoneyPot.BigWinPanel.prototype.growBigWinTxt = function(){
	TweenLite.to(this.bigWinTxt, 15, {pixi:{scale:1}});	
}

HoneyPot.BigWinPanel.prototype.growSuperWinTxt = function(){
	TweenLite.to(this.superWinTxt, 10, {pixi:{scale:1.2}});	
}
HoneyPot.BigWinPanel.prototype.growMegaWinTxt = function(){
	//TweenLite.to(this.superWinTxt, 10, {pixi:{scale:1.2}});
}



HoneyPot.BigWinPanel.prototype.showgTopGlow = function(){
	this.glowbwTop.alpha = 1;
	this.glowbwTop.setScale(2);
	this.glowbwTop.visible = true;
	TweenLite.to(this.glowbwTop, 0.4, {onComplete:this.topGlowComplete.bind(this),pixi:{alpha:0}});	
}
HoneyPot.BigWinPanel.prototype.topGlowComplete = function(){
	this.glowbwTop.visible = false;
	//this.glowbwTop.setScale(1);
}
HoneyPot.BigWinPanel.prototype.showBigWin = function(val){
	if(!this.bigWinTxt.visible){
		if(!this.totalWInContainer.visible){
			this.totalWInContainer.visible = true;
		}
		this.bigwinHit = true;
		this.superwinHit = false;
		this.megawinHit = false;

		if(this.state == 'skipped'){
			this.bigWinTxt.visible = true;
			this.bigWinTxt.alpha = 1;
			this.bigWinTxt.setScale(1);

			this.glowbw.visible = true;
			this.glowbw.setScale(1);
			this.starBurst.setScale(0.6);
			this.starBurst.visible = true;

			this.circleLights1.visible = true;
		}else{
			this.bigWinTxt.alpha = 0;
			this.bigWinTxt.setScale(4);
			this.bigWinTxt.visible = true;	
			this.glowbw.setScale(1);
			TweenLite.to(this.bigWinTxt, 0.3, {onComplete:this.growBigWinTxt.bind(this),pixi:{scale:0.7, alpha:1}, ease: Bounce.easeOut});	
			//TweenLite.to(this.glowbw, 0.3, {pixi:{scale:1}});

			//this.app.playSound('bigWinEndSound');
			this.app.playSound('alarmSound');
			this.app.playSound('bellSound');
			this.app.playSound('bigWinSound',true,0.4);

			this.glowbwTop.alpha = 0.8;
			this.glowbwTop.setScale(4);
			this.glowbwTop.visible = true;

			TweenLite.to(this.glowbwTop, 0.5, {onComplete:this.topGlowComplete.bind(this),pixi:{alpha:0}});
			
			this.starBurst.setScale(0.6);
			this.starBurst.visible = true;
			TweenMax.to(this.starBurst,10, {pixi:{rotation:-360}, repeat:-1, ease:Linear.easeNone});	

			this.circleLights1.visible = true;
			TweenMax.to(this.circleLights1,10, {pixi:{rotation:360}, repeat:-1, ease:Linear.easeNone});	
		}
	}
	this.showWin(HoneyPot.Currency.formatMoneyPence(val),50);
}
HoneyPot.BigWinPanel.prototype.showSuperWin = function(val){
	if(!this.superWinTxt.visible){
		if(!this.totalWInContainer.visible){
			this.totalWInContainer.visible = true;
		}
		this.bigwinHit = false;
		this.superwinHit = true;
		this.megawinHit = false;
		this.bigWinTxt.visible = true;
		if(this.state == 'skipped'){
			this.superWinTxt.visible = true;	
			this.glowbw.visible = true;
			this.glowbw.setScale(1.5);

			this.starBurst.setScale(0.8);
			this.starBurst.visible = true;
			this.circleLights2.visible = true;
		}else{
			this.superWinTxt.alpha = 0;
			this.superWinTxt.setScale(4);
			this.superWinTxt.visible = true;	
			this.emitter.maxParticles = 50;
			this.emitter.emit = true;
			this.glowbw.setScale(1.5);
			TweenLite.to(this.superWinTxt, 0.3, {onComplete:this.growSuperWinTxt.bind(this),pixi:{scale:1, alpha:1}, ease: Bounce.easeOut});	
			//TweenLite.to(this.glowbw, 0.3, {pixi:{scale:1.5}});

			this.app.playSound('explosionSound');
			this.app.stopSound('bigWinSound');
			this.app.playSound('applauseSound',true,0.4);
			this.app.playSound('superBigWinSound',true,0.4);

			this.glowbwTop.alpha = 0.8;
			this.glowbwTop.setScale(4);
			this.glowbwTop.visible = true;

			TweenLite.to(this.glowbwTop, 0.5, {onComplete:this.topGlowComplete.bind(this),pixi:{alpha:0}});

			this.starBurst.setScale(0.8);
			this.starBurst.visible = true;
			this.circleLights2.visible = true;
			TweenMax.to(this.circleLights2,10, {pixi:{rotation:-360}, repeat:-1, ease:Linear.easeNone});	
		}
	}
	this.showWin(HoneyPot.Currency.formatMoneyPence(val),50);
}
HoneyPot.BigWinPanel.prototype.showMegaWin = function(val){
	if(!this.megaWinTxt.visible){
		if(!this.totalWInContainer.visible){
			this.totalWInContainer.visible = true;
		}
		this.bigwinHit = false;
		this.superwinHit = false;
		this.megawinHit = true;
		this.emitter.maxParticles = 500;
		this.bigWinTxt.visible = true;
		if(this.state == 'skipped'){
			this.megaWinTxt.visible = true;	
			this.megaWinTxt.setScale(1);	
			this.starBurst.setScale(1);
			this.glowbw.visible = true;
			this.glowbw.setScale(2);
			this.superWinTxt.visible = false;
			this.starBurst.visible = true;
			this.circleLights3.visible = true;
		}else{
			this.megaWinTxt.alpha = 0;
			this.megaWinTxt.setScale(4);
			this.megaWinTxt.visible = true;	
			this.glowbw.setScale(2);
			TweenLite.to(this.megaWinTxt, 0.3, {onComplete:this.growMegaWinTxt.bind(this),pixi:{scale:1, alpha:1}, ease: Bounce.easeOut});
			//TweenLite.to(this.glowbw, 0.3, {pixi:{scale:2}});

			this.app.playSound('explosionSound');
			this.app.stopSound('applauseSound');
			this.app.playSound('applauseSound',true,1);
			this.app.stopSound('superBigWinSound');
			this.app.playSound('megaBigWinSound',true,0.4);

			this.glowbwTop.alpha = 0.8;
			this.glowbwTop.setScale(4);
			this.glowbwTop.visible = true;

			TweenLite.to(this.glowbwTop, 0.5, {onComplete:this.topGlowComplete.bind(this),pixi:{alpha:0}});

			this.starBurst.setScale(1);
			this.superWinTxt.visible = false;
			this.starBurst.visible = true;
			this.circleLights3.visible = true;
			
			TweenMax.to(this.circleLights3,10, {pixi:{rotation:360}, repeat:-1, ease:Linear.easeNone});	
		}
	}
	this.showWin(HoneyPot.Currency.formatMoneyPence(val),50);
}
HoneyPot.BigWinPanel.prototype.showWinTxt = function(val, ypos){
	if(!this.totalWInContainer.visible){
		this.totalWInContainer.visible = true;
	}
	this.showWin(val, ypos);

}
HoneyPot.BigWinPanel.prototype.showWin = function(val, ypos){
	for (var i = this.totalWInContainer.children.length - 1; i >= 0; i--) {
		this.totalWInContainer.removeChild(this.totalWInContainer.children[i]);
	}
	var posx = 0;
	for(var i=0;i<val.length;i++){
		var char = val.substr(i,1);
		var imgName = this.getSpriteName(char);
		if(imgName != null){
			var sprite = new HoneyPot.Sprite({imageName:imgName,x:posx,y:0});
			this.totalWInContainer.addChild(sprite);	
			posx += sprite.width;
		}
	}
	this.totalWInContainer.y = ((this.app.getGameHeight()-this.totalWInContainer.height)/2)+ypos;
	this.totalWInContainer.x = (this.app.getGameWidth()-this.totalWInContainer.width)/2;
}
HoneyPot.BigWinPanel.prototype.getSpriteName = function(val){
	switch(val){
		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
			return 'number'+val;
			break;
		case '.':
			return 'numberDot';
			break;
		case ',':
			return 'numberComma';
			break;
		case '£':
			return 'numberPound';
			break;
		case '$':
			return 'numberDollar';
			break;
		case '€':
			return 'numberEuro';
			break;
		default:
			return null;
			break;
		
	}
}


