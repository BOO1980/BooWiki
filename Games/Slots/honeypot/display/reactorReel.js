HoneyPot.ReactorReel = function(config){
	HoneyPot.Reel.call(this,config);

}

HoneyPot.ReactorReel.prototype = Object.create(HoneyPot.Reel.prototype);
HoneyPot.ReactorReel.prototype.constructor = HoneyPot.ReactorReel;

HoneyPot.ReactorReel.prototype.addSymbols = function(){
	for(var j = 0; j < 3; j++)
	{
		var symbol = new PIXI.Sprite(this.slotTextures[ this.reelSet[j]]);
		symbol.y = ((j)*(this.symbolHeight+5))+5;
		symbol.x = Math.round((this.reelWidth - this.symbolWidth)/2);
		this.addChild(symbol);
		this.symbols.push(symbol);
	}
}

HoneyPot.ReactorReel.prototype.update = function(delta){
	if(this.state != "idle"){
		if(this.state == "spin"){
			for( var j=this.symbols.length-1; j >=0; j--){
				var symbol = this.symbols[j];
				symbol.y += 10+(3*(j+1));
			}

			if(this.symbols[0].y > (this.symbols.length*((this.symbolHeight+5)+5))){
				for(var j = 0; j < this.symbols.length; j++){
					var symbol = this.symbols[j];
					symbol.y = (((j)*(this.symbolHeight+5))+5)-(this.symbols.length*((this.symbolHeight+5)+5));
				}
				this.state = "drop";
			}
		}

		if(this.state == "drop"){
			for( var j=this.symbols.length-1; j >=0; j--){
				var symbol = this.symbols[j];
				if(symbol.y < (((j)*(this.symbolHeight+5))+5)){
					symbol.y += 10+(3*(j+1));
				}else{
					symbol.y = (((j)*(this.symbolHeight+5))+5);
				}
			}

			if(this.symbols[0].y == ((this.symbolHeight+5)+5)){
				this.state = "idle";
			}
		}
	}
}

HoneyPot.Reel.prototype.stopReel = function(){

}