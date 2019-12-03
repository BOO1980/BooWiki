HoneyPot.Sprite = function(data){
	var app = HoneyPot.GraphicsDriver.getGraphicsDriver();
	var image = "";
	if(data.image){
		image = data.image;
	}else if(data.imageName){
		image = app.getAssetById(data.imageName);
	}
	PIXI.Sprite.call(this,image);
	//this.texture.baseTexture.mipmap = true;
	this.id = data.id;
	this.x = data.x ? data.x : 0;
	this.y = data.y ? data.y : 0;

	if(data.anchor){
		if(data.anchor.x){
			this.anchor.set(data.anchor.x,data.anchor.y);
		}else{
			this.anchor.set(data.anchor,data.anchor);
		}
	}
	if(data.rotate){
		var TO_RADIANS = Math.PI / 180;
		this.rotation = data.rotate*TO_RADIANS;
	}

	if(data.shadow){

		var dropShadowFilter = new PIXI.filters.DropShadowFilter();
		dropShadowFilter.alpha = data.shadow.alpha ? data.shadow.alpha : 1;
		dropShadowFilter.blur = data.shadow.blur ? data.shadow.blur : 1;
		dropShadowFilter.distance = data.shadow.distance ? data.shadow.distance : 1;
		dropShadowFilter.rotation = data.shadow.rotation ? data.shadow.rotation : 45;

		this.filters = [dropShadowFilter];
	}

	if(data.scale){
		if(data.scale.x){
			this.scale.set(data.scale.x,data.scale.y);
		}else{
			this.scale.set(data.scale,data.scale);
		}
	}
	this.visible = (typeof data.visible !== "undefined") ? data.visible : true;

}

HoneyPot.Sprite.prototype = Object.create(PIXI.Sprite.prototype);
HoneyPot.Sprite.prototype.constructor = HoneyPot.Sprite;

HoneyPot.Sprite.prototype.updateTextureSymbol = function(texture){
	this.texture = texture;
}

HoneyPot.Sprite.prototype.setRotation = function(degree){
	var TO_RADIANS = Math.PI / 180;
	this.rotation = degree*TO_RADIANS;
}
HoneyPot.Sprite.prototype.getTexture = function(){
	return this.texture;
}

HoneyPot.Sprite.prototype.setTexture = function(texture){
	this.texture = texture;
}

HoneyPot.Sprite.prototype.setScale= function(scale){
	this.scale.set(scale,scale);
}