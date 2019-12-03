HoneyPot.AnimatedSprite = function(data){
	var app = HoneyPot.GraphicsDriver.getGraphicsDriver();
	var image = [];
	if(data.image){
		if(data.image.length > 0){
			/*var textureArray = [];
			for(var i=0;i<data.image.length;i++){
				textureArray.push(app.getAssetById(data.image[i]));
			}*/ 

			image = data.image;
		}else{
			image.push(data.image);
		}

	}else if(data.imageName){
		image = app.getAssetById(data.imageName);
	}
	PIXI.AnimatedSprite.call(this,image);
	this.stop();

	this.id = data.id;
	this.x = data.x ? data.x : 0;
	this.y = data.y ? data.y : 0;
	this.loop = data.loop ? data.loop : false;
	this.animationSpeed = data.animationSpeed ? data.animationSpeed : 0.5;

	if(data.scale){
		if(data.scale.x){
			this.scale.set(data.scale.x,data.scale.y);
		}else{
			this.scale.set(data.scale,data.scale);
		}
	}

	if(data.anchor){
		this.anchor.set(data.anchor,data.anchor);
	}

}

HoneyPot.AnimatedSprite.prototype = Object.create(PIXI.AnimatedSprite.prototype);
HoneyPot.AnimatedSprite.prototype.constructor = HoneyPot.AnimatedSprite;

HoneyPot.AnimatedSprite.prototype.updateTextureSymbol = function(texture){
	if(texture.length>0){
		this.textures = texture;
	}else{
		this.textures = [texture];
	}
}

HoneyPot.AnimatedSprite.prototype.getTexture = function(){
	return this.textures;
}

HoneyPot.AnimatedSprite.prototype.setTexture = function(textures){
	this.textures = textures;
}


