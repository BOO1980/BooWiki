HoneyPot.RotaionScreen = function(config){
	HoneyPot.Container.call(this, config);
	this.bg;
	this.rotateText;
	this.visible = false;
	this.img;
	this.init();
}

HoneyPot.RotaionScreen.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.RotaionScreen.prototype.constructor = HoneyPot.RotaionScreen;

HoneyPot.RotaionScreen.prototype.init = function(gameState){

	var textStyle = {colour:"#ffffff",fontSize:18,fontFamily:"MyriadProRegular"};

	this.bg = new HoneyPot.Graphic({x:0,y:0,colour:'0x000000',rect:{x:0,y:0,width:this.app.getCanvasWidth(),height:this.app.getCanvasHeight()}});
	this.addChild(this.bg);

	this.img = new HoneyPot.Sprite({x:(this.app.getCanvasWidth()/2),y:(this.app.getCanvasHeight()/2)-70,anchor:0.5,imageName:"rotateDevice"});
	this.addChild(this.img);

	this.rotateText = new HoneyPot.Text({type:"Text",text:HoneyPot.LocaleManager.getText("ROTATE_DEVICE"),align:"center",x:(this.app.getCanvasWidth()/2),y:(this.app.getCanvasHeight()/2),style:textStyle});
	this.addChild(this.rotateText);
	this.bg.interactive = true;
    this.bg.buttonMode = false;
	
}

HoneyPot.RotaionScreen.prototype.resize = function(){
	this.bg.width = this.app.getCanvasWidth();
	this.bg.height = this.app.getCanvasHeight();

	this.img.x = ((this.app.getCanvasWidth()/2));
	this.img.y = (this.app.getCanvasHeight()/2)-70;
	
	this.rotateText.x = ((this.app.getCanvasWidth()/2));
	this.rotateText.y = ((this.app.getCanvasHeight()/2));


}

HoneyPot.RotaionScreen.prototype.show = function(){

	this.visible = true;
}

HoneyPot.RotaionScreen.prototype.hide = function(){
	this.visible = false;
}