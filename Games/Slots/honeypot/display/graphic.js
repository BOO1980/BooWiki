HoneyPot.Graphic = function(data){
	PIXI.Graphics.call(this);
	var lineSize = data.lineSize ? data.lineSize : 1;
	var alpha = data.alpha ? data.alpha : 1;


	if(data.lineColour){
		this.lineStyle(lineSize, data.lineColour);
	}
	if(data.colour){
		this.beginFill(data.colour, alpha);
	}
	if(data.rect){
		this.drawRect(data.rect.x, data.rect.y, data.rect.width, data.rect.height);
	}
	if(data.line){
		for(var i=0;i<data.line.points.length;i++){
			var point = data.line.points[i];
			if(i==0){
				this.moveTo(point.x, point.y);
			}else{
				this.lineTo(point.x, point.y);
			}
		}
		this.position.x = 0;
		this.position.y = 0;
	}

	if(data.lineMulti){
		for(var p=0;p<data.lineMulti.points.length;p++){
			for(var i=0;i<data.lineMulti.points[p].length;i++){
				var point = data.lineMulti.points[p][i];
				if(i==0){
					this.moveTo(point.x, point.y);
				}else{
					this.lineTo(point.x, point.y);
				}
			}
		}
		this.position.x = 0;
		this.position.y = 0;
	}
	if(data.colour){
		this.endFill();
	}
	this.x = data.x;
	this.y = data.y;

	this.visible = (typeof data.visible !== "undefined") ? data.visible : true;

	if(data.blur){
		this.blur = new PIXI.filters.BlurFilter();
		this.blur.blurX = data.blur;
		this.blur.blurY = data.blur;
		this.filters = [this.blur];
	}

	/*if(data.shadow){
		var dropShadowFilter = new PIXI.filters.DropShadowFilter();
		dropShadowFilter.color = 0x000020;
		dropShadowFilter.alpha = 1;
		dropShadowFilter.blur = 2;
		dropShadowFilter.distance = 20;
		this.filters = [dropShadowFilter];
	}*/
}

HoneyPot.Graphic.prototype = Object.create(PIXI.Graphics.prototype);
HoneyPot.Graphic.prototype.constructor = HoneyPot.Graphic;
