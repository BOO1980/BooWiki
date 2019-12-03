HoneyPot.Button = function(data, callback){
	this.app = HoneyPot.GraphicsDriver.getGraphicsDriver();
	var imageUp= this.app.getAssetById(data.state.up.imageName)
	data.image = imageUp;
	HoneyPot.Sprite.call(this, data);
	this.textureUp = imageUp;
	this.textureDisabled = (data.state.disabled && data.state.disabled.imageName) ? this.app.getAssetById(data.state.disabled.imageName) : imageUp;
	this.textureDown = (data.state.down && data.state.down.imageName) ? this.app.getAssetById(data.state.down.imageName) : null;
	
	this.callback = callback ? callback : null;
	this.interactive = true;
	this.buttonMode = true;
	this.sound = data.sound ? data.sound : null;
	this.disable = data.disable ? data.disable : false;

	this.setCallBack(callback);
	if(this.disable){
		this.disableButton();
	}

	if(this.textureDown != null){
		var that = this;

		this.on('pointerover', this.mouseOver.bind(this));
		this.on('pointerout', this.mouseOut.bind(this));
	}
}

HoneyPot.Button.prototype = Object.create(HoneyPot.Sprite.prototype);
HoneyPot.Button.prototype.constructor = HoneyPot.Button;

HoneyPot.Button.prototype.mouseOver = function(){
	if(!this.disable){
		this.texture = this.textureDown;
	}
}

HoneyPot.Button.prototype.mouseOut = function(){
	if(!this.disable){
		this.texture = this.textureUp;
	}
}
HoneyPot.Button.prototype.mouseDown = function(){
	if(!this.disable){
		if(this.sound){
			this.app.playSound(this.sound);
		}
		this.callback(this.id);
	}
}
HoneyPot.Button.prototype.setCallBack = function(callback){
	if(callback){
		this.callback = callback;
		this.on('pointerdown', this.mouseDown.bind(this));
	}
}

HoneyPot.Button.prototype.disableButton = function(){
	this.texture = this.textureDisabled;
	this.disable = true;
}

HoneyPot.Button.prototype.enableButton = function(){
	this.texture = this.textureUp;
	this.disable = false;
}