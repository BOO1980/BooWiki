HoneyPot.Screen = function(config){
	HoneyPot.Container.call(this, config);
	this.background = null;
	this.main = null;
	this.config = config;
	this.app = HoneyPot.GraphicsDriver.getGraphicsDriver();
	this.canvas = this.app.getContext();
	this.gameState;

	this.closScreenCallBack;
	this.showMessageCallBack;

	this.blur = new PIXI.filters.BlurFilter();
	this.blur.blurX = 0;
	this.blur.blurY = 0;
	this.filters = [this.blur];
}

HoneyPot.Screen.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.Screen.prototype.constructor = HoneyPot.Screen;

HoneyPot.Screen.prototype.init = function(gameState){
	this.gameState = gameState;
	this.initComponents();
}

HoneyPot.Screen.prototype.initComponents = function(){

}

HoneyPot.Screen.prototype.hide = function(){
	this.visible = false;
}
HoneyPot.Screen.prototype.show = function(){
	this.visible = true;
}
HoneyPot.Screen.prototype.update = function(delta){

}

HoneyPot.Screen.prototype.setShowMessageCallBack = function(callback){
	this.showMessageCallBack = callback;
}
HoneyPot.Screen.prototype.setCloseScreenCallBack = function(callback){
	this.closScreenCallBack = callback;
}

HoneyPot.Screen.prototype.blurScreen = function(blur){
	if(blur){
		this.blur.blurX = 12;
		this.blur.blurY = 12;
	}else{
		this.blur.blurX = 0;
		this.blur.blurY = 0;
	}
}

/*HoneyPot.Screen.prototype.resize = function(){
	//this.background.width = this.app.getCanvasWidth();
	//this.background.height = this.app.getCanvasHeight();

	var gameWidth = this.app.getGameWidth();
	var gameHeight = this.app.getGameHeight();

	var w = (window.innerWidth/gameWidth);
	var h = (window.innerHeight/gameHeight);
	var scale = h
	if(h > w){
		scale = w;
	}

	this.scale.x = scale;
	this.scale.y = scale;

	this.x = (this.app.getCanvasWidth()-(gameWidth*scale))/2;
	this.y = (this.app.getCanvasHeight()-(gameHeight*scale))/2;
}*/
