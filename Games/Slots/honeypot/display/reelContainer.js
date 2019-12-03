HoneyPot.ReelContainer = function(data){
	HoneyPot.Container.call(this,data);
	this.numberOfReels;
	this.symbolSize;
	this.reelWidth;
	this.slotTextures = [];
	this.reels = [];
	
	this.state = "idle";
	this.reelSet;// = data.reelSet ? data.reelSet : []; 

	this.allreelsStoppedCallback;
	this.reelStopCount = 0;

	this.data = data;

	//this.init(data);
}

HoneyPot.ReelContainer.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.ReelContainer.prototype.constructor = HoneyPot.ReelContainer;

HoneyPot.ReelContainer.prototype.setReelSet = function(data){
	this.reelSet = data;
}
HoneyPot.ReelContainer.prototype.init = function(rs){
	this.reelSet = rs;
	for(var reelsObj in this.data.children){
		var data = this.data.children[reelsObj];
		var item;

		item = new HoneyPot[data.type](data);
		
		if(data.reels){
			this.numberOfReels = data.reels.numberOfReels;
			this.reelWidth = data.reels.reelWidth;
			var symbolXSpacer = data.reels.symbolXSpacer ? data.reels.symbolXSpacer : 0;
			if(data.reels.slotTextures){
				for(var i=0;i<data.reels.slotTextures.length;i++){
					this.slotTextures.push(this.app.getAssetById(data.reels.slotTextures[i]));
				}
			}

			for(var i=0;i<this.numberOfReels;i++){
				data.reels.slotTextures = this.slotTextures;
				data.reels.reelSet = this.reelSet[i];
				data.reels.delay = (i*data.reels.reelDelay);
				data.reels.stopDelay = (i*data.reels.reelStopDelay);

				var reel = new HoneyPot.Reel(data.reels, i);
				reel.x = (this.reelWidth+symbolXSpacer) *i;
				reel.y = 0; 
				this.reels.push(reel);
				item.addChild(reel);
			}

		}
		
		if(data.mask){
			var maskItem = new HoneyPot[data.mask.type](data.mask);
			this.addChild(maskItem);
			item.mask = maskItem;
		}
		this.addChild(item);
	}
}

HoneyPot.ReelContainer.prototype.resetReelSymbols = function(){
	for(var i=0;i<this.reels.length;i++){
		this.reels[i].resetAlpha();
	}
}
HoneyPot.ReelContainer.prototype.animateReelSymbols = function(winline, mask){

	for(var i=0;i<this.reels.length;i++){
		this.reels[i].setHideAlpha();
		if(mask[i] == "x"){
			this.reels[i].animateSymbol(parseInt(winline[i])+1);
		}
	}
}
HoneyPot.ReelContainer.prototype.animateScatterWin = function(data){
	for(var i=0;i<this.reels.length;i++){
		this.reels[i].setHideAlpha();
	}
	for(var i=0;i<data.length;i++){
		this.reels[data[i].col].animateSymbol(parseInt(data[i].row)+1);
	}
}

HoneyPot.ReelContainer.prototype.update = function(delta){
	if(this.state == "spin" || this.state == "stop"){
		for(var i=0;i<this.reels.length;i++){
			this.reels[i].update(delta);
		}
	}	
}

HoneyPot.ReelContainer.prototype.reelStopped = function(reelId){
	this.reelStopCount += 1;
	if(this.reelStopCount == this.reels.length){
		this.state = "idle";
		this.allreelsStoppedCallback();
	}
	
}
HoneyPot.ReelContainer.prototype.stopSpin = function(stopPos,callback){
	this.allreelsStoppedCallback = callback;
	var that = this;
	var anticipation = 0;
	if(this.state == "spin"){
		this.reelStopCount = 0;
		for(var i=0;i<this.reels.length;i++){
			//this.reels[i].stopReel(function(id){that.reelStopped(id);});
			//anticipation += this.checkSymbol();
			this.reels[i].setReelSet(this.reelSet[i]); //reelSet = this.reelSet[i];
			this.reels[i].stopPosition = stopPos[i];
			this.reels[i].stopReel(this.reelStopped.bind(this));
		}
		this.state = "stop";
	}
}

HoneyPot.ReelContainer.prototype.startSpin = function(){
	if(this.state == "idle"){
		for(var i=0;i<this.reels.length;i++){
			this.reels[i].spinReel();
		}
		this.state = "spin";
	}
}
