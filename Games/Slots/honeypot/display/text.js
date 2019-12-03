HoneyPot.Text = function(data, style){
	var app = HoneyPot.GraphicsDriver.getGraphicsDriver();
	var style = app.getStyle();
	if(data.style){
		if(data.style.fontSize){
			style.fontSize = data.style.fontSize;
		}
		if(data.style.colour){
			if(data.style.fillGradientType){
				if(data.style.fillGradientType == 'horizontal'){
					style.fillGradientType = PIXI.TEXT_GRADIENT.LINEAR_HORIZONTAL;
				}else{
					style.fillGradientType = PIXI.TEXT_GRADIENT.LINEAR_VERTICAL;
				}
				style.fill = data.style.colour;
			}else{
				style.fillGradientType = PIXI.TEXT_GRADIENT.LINEAR_VERTICAL
				style.fill = data.style.colour;
			}
		}

		if(data.style.stroke){
			style.stroke = data.style.stroke;
    		style.strokeThickness = data.style.strokeThickness ? data.style.strokeThickness :2;
		}else{
			style.strokeThickness = 0;
		}
		if(data.style.fontFamily){
			style.fontFamily = data.style.fontFamily;
		}

		if(data.style.fontWeight){
			style.fontWeight = data.style.fontWeight;
		}else{
			style.fontWeight = 'normal';
		}
		if(data.style.letterSpacing){
			style.letterSpacing = data.style.letterSpacing;
		}else{
			style.letterSpacing = 0;
		}
		if(data.style.multiline){
			style.wordWrap = true;
			style.wordWrapWidth = data.style.multilineWidth;
		}else{
			style.wordWrap = false;
		}

		if(data.style.dropShadow){
			style.dropShadow = true;
		    style.dropShadowAlpha = data.style.dropShadowAlpha ? data.style.dropShadowAlpha : 0.8;
		    style.dropShadowBlur = data.style.dropShadowBlur ? data.style.dropShadowBlur : 2;
		    style.dropShadowDistance= data.style.dropShadowDistance ? data.style.dropShadowDistance : 3;
		    style.dropShadowColor= data.style.dropShadowColor ? data.style.dropShadowColor : '#000000';
		    style.dropShadowAngle= data.style.dropShadowAngle ? data.style.dropShadowAngle : 0.6;
		}else{
			style.dropShadow = false;
		}
	}
	PIXI.Text.call(this,data.text, style);

	

	if(data.blur){
		this.blur = new PIXI.filters.BlurFilter();
		this.blur.blurX = data.blur;
		this.blur.blurY = data.blur;
		this.filters = [this.blur];
	}
	if(data.alpha){
		this.alpha = data.alpha;
	}

	if(data.align == "left"){
		this.anchor.set(0,0);
	}else if(data.align == "right"){
		this.anchor.set(1,0);
	}else{
		this.anchor.set(0.5,0);
	}
	this.id = data.id;
	this.x = data.x;
	this.y = data.y;

}

HoneyPot.Text.prototype = Object.create(PIXI.Text.prototype);
HoneyPot.Text.prototype.constructor = HoneyPot.Text;

HoneyPot.Text.prototype.setColour = function(col){
	this.style.fill = col;
}
