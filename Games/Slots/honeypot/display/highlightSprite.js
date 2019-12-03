HoneyPot.HighlightSprite = function(data, callback){
	var app = HoneyPot.GraphicsDriver.getGraphicsDriver();
	var image= app.getAssetById(data.imageName)
	PIXI.Sprite.call(this, image);
	this.mainTexture = image;
	this.highlightTexture = data.imageNameHighlight ? app.getAssetById(data.imageNameHighlight) : image;

	this.callback = callback ? callback : null;
	this.interactive = true;
	this.buttonMode = true;
	this.disable = data.disable ? data.disable : false;
	this.id = data.id;
	this.x = data.x;
	this.y = data.y;

	if(this.callback){
		var that = this;
		this.addListener("pointerdown", function(){
			if(!that.disable){
				that.callback();
			}
		});
	}

}

HoneyPot.HighlightSprite.prototype = Object.create(PIXI.Sprite.prototype);
HoneyPot.HighlightSprite.prototype.constructor = HoneyPot.HighlightSprite;

HoneyPot.HighlightSprite.prototype.setCallback = function(callback){
	this.callback = callback;
	var that = this;
	this.addListener("pointerdown", function(){
		if(!that.disable){
			that.callback(that.id);
		}
	});
}

HoneyPot.HighlightSprite.prototype.clicked = function(){

}
HoneyPot.HighlightSprite.prototype.showHighlight = function(){
	this.texture = this.highlightTexture;
}

HoneyPot.HighlightSprite.prototype.hideHighlight = function(){
	this.texture = this.mainTexture;
}