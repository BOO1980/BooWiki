HoneyPot.WarningPanel = function(config){
	HoneyPot.Container.call(this, config);
	this.msgContainer;
	this.txt;
	this.closeCallback;
	this.closeBtn;
	this.okBtn
	this.overlay;
	this.bg;
}

HoneyPot.WarningPanel.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.WarningPanel.prototype.constructor = HoneyPot.WarningPanel;

HoneyPot.WarningPanel.prototype.init = function(closeCallback){
	this.closeCallback = closeCallback;
	this.visible = false;
	this.overlay = new HoneyPot.Graphic({x:0,y:0,colour:'0x000000',rect:{x:0,y:0,width:this.app.getCanvasWidth(),height:this.app.getCanvasHeight()}});
	this.overlay.alpha = 0.4;
	this.overlay.interactive = true;
    this.overlay.buttonMode = false;
	this.addChild(this.overlay);

	this.msgContainer = new HoneyPot.Container({id:'msgContainer'});
	this.addChild(this.msgContainer);
	
	this.bg = new HoneyPot.Sprite({
								x:0,
								y:0,
								imageName:"warningPanel",
								shadow:true
							});
	this.msgContainer.addChild(this.bg);



	this.closeBtn = new HoneyPot.Button({
								action:"Button",
								sound:"btnClickSound",
								id:"closeBtn",
							
								x:390,
								y:221,
								state:{
									up:{
										imageName:"closeBtnUp"
									},
									disabled:{
										imageName:"closeBtnDisabled"
									}
								}
							});

	this.msgContainer.addChild(this.closeBtn);
	this.closeBtn.setCallBack(this.closePanel.bind(this));
	this.closeBtn.visible = false;

	this.okBtn =new HoneyPot.Button({
								action:"Button",
								sound:"btnClickSound",
								id:"applyBtn",
							
								x:121,
								y:141,
								state:{
									up:{
										imageName:"applyBtnUp"
									},
									disabled:{
										imageName:"applyBtnDisabled"
									}
								}
							});
	this.msgContainer.addChild(this.okBtn);
	this.okBtn.setCallBack(this.okPanel.bind(this));


	var textStyle = {colour:"#ffffff",fontSize:18,fontFamily:"MyriadProRegular"};

	this.txt = new HoneyPot.Text({type:"Text",text:"",align:"center",x:150,y:40,style:textStyle}); 
	this.msgContainer.addChild(this.txt);

}
HoneyPot.WarningPanel.prototype.showPanel = function(txt){
	this.overlay.width = this.app.getCanvasWidth();
	this.overlay.height = this.app.getCanvasHeight();
	this.msgContainer.x = (this.app.getCanvasWidth() - this.msgContainer.width)/2;
	this.msgContainer.y = (this.app.getCanvasHeight() - this.msgContainer.height)/2;
	this.txt.text = txt;
	this.txt.y = (this.bg.height-this.txt.height)/2;
	this.visible = true;
}

HoneyPot.WarningPanel.prototype.closePanel = function(){
	this.closeCallback();
}

HoneyPot.WarningPanel.prototype.okPanel = function(){
	this.closeCallback();
}
