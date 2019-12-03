HoneyPot.WinlineContainer = function(data){
	HoneyPot.Container.call(this,data);
	this.winlines = [];
	this.winlinePatterns = data.winlinePatterns;
	this.symbolSize = data.symbolSize;
	this.lineSize = data.winlineSize;
	this.winlinesColour = data.winlines;
	this.symbolAnimations = data.symbolAnimations ? data.symbolAnimations : null;

	this.winlineSymbols = [];

	//this.init(data);
	this.addWinlines(data);
}

HoneyPot.WinlineContainer.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.WinlineContainer.prototype.constructor = HoneyPot.WinlineContainer;

HoneyPot.WinlineContainer.prototype.init = function(data){
	this.winlinePatterns = data;
	this.addWinlines();
}
/*HoneyPot.WinlineContainer.prototype.init = function(config){
	if(config.children){
		for(var i=0;i<config.children.length;i++){
			var data = config.children[i];
			var item = new HoneyPot[data.type](data);
			this.addChild(item);
		}
	}
}*/
HoneyPot.WinlineContainer.prototype.addWinlines = function(data){

	for(var i=0;i<this.winlinePatterns.length; i++){
		var points = [];
		//this.winlinePatterns[i] = this.winlinePatterns[i].winlinePattern;//line.split("|");
		var lines = this.winlinePatterns[i].winlinePattern;
		
		for(var j=0;j<lines.length;j++){
			var pointX = (this.symbolSize.width/2) + (j*this.symbolSize.width);
			var pointY = (this.symbolSize.height/2) + (this.symbolSize.height*lines[j]);
			if(j==0){
				points.push({x:0, y:(this.symbolSize.height/2) + (this.symbolSize.height*lines[j])});
			}
			points.push({x:pointX, y:pointY});
			if(j==(lines.length-1)){
				points.push({x:(lines.length*this.symbolSize.width), y:(this.symbolSize.height/2) + (this.symbolSize.height*lines[j])});
			}
		}
		
		var line = new HoneyPot.Graphic({lineColour:this.winlinesColour[i],lineSize:this.lineSize,x:0,y:0,line:{points:points}});

		this.winlines.push(line);
	}
}


HoneyPot.WinlineContainer.prototype.showWinlineSymbol = function(id, symbolPattern){

	var maskPoints = [];
	var lines = this.winlinePatterns[id].winlinePattern;
	var line = this.winlines[id];
	this.addChild(line);
	for(var j=0;j<lines.length;j++){

		if(symbolPattern[j] == "x"){

			this.winlineSymbols

			var rect = new HoneyPot.Graphic({lineColour:this.winlinesColour[id],lineSize:this.lineSize,x:(j*this.symbolSize.width),y:(this.symbolSize.height*lines[j]),rect:{x:0,y:0,width:this.symbolSize.width, height:this.symbolSize.height}});
			this.addChild(rect);
		}
	}
	
}
HoneyPot.WinlineContainer.prototype.showWinline = function(id){
	this.addChild(this.winlines[id]);
}

HoneyPot.WinlineContainer.prototype.removeWinline = function(id){
	this.removeChild(this.winlines[id]);
}

HoneyPot.WinlineContainer.prototype.showAllWinlines = function(){
	for(var i=0;i<this.winlines.length;i++){
		this.addChild(this.winlines[i]);
	}
}

HoneyPot.WinlineContainer.prototype.removeAllWinlines = function(){
	this.removeChildren();
}

