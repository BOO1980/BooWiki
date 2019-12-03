HoneyPot.BottomBarUI = function(config){
	HoneyPot.Container.call(this, config);
	if(config.position == 'bottom'){
		this.y = this.app.getGameHeight()-30;
	}
	this.balanceText;
	this.betText;
	this.winText;

	this.balanceLbl;
	this.betLbl;
	this.winLbl;
	this.fullScreen = config.fullScreen == true ? config.fullScreen : false;
	this.border = config.border ? config.border : 0;
	this.fullScreenPosX=0;
	this.barBg

	this.init();
}

HoneyPot.BottomBarUI.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.BottomBarUI.prototype.constructor = HoneyPot.BottomBarUI;

HoneyPot.BottomBarUI.prototype.init = function(){
	var barWidth = this.app.getGameWidth() - (this.border*2);
	if(this.fullScreen){
		barWidth = this.app.getCanvasWidth();
	}
	this.barBg = new HoneyPot.Graphic({x:0,y:0,colour:'0x000000',rect:{x:this.border,y:0,width:barWidth,height:30}});
	this.addChild(this.barBg);

	var textStyle = {colour:"#f7ba0c",fontSize:18,fontFamily:"MyriadProRegular"};
	this.fullScreenPosX= 0;
	if(this.fullScreen){
		this.fullScreenPosX = 20;
	}
	this.balanceLbl = new HoneyPot.Text({type:"Text",text:HoneyPot.LocaleManager.getText("BALANCE")+":",align:"left",x:10+this.fullScreenPosX,y:6,style:textStyle});
	this.addChild(this.balanceLbl);
	
	this.balanceText = new HoneyPot.Text({type:"Text",text:"",align:"left",x:this.fullScreenPosX+14+this.balanceLbl.width,y:6,style:textStyle});
	this.addChild(this.balanceText);

	this.betLbl = new HoneyPot.Text({type:"Text",text:HoneyPot.LocaleManager.getText("BET")+":",align:"right",x:((barWidth/2)-38),y:6,style:textStyle});
	this.addChild(this.betLbl);
	
	this.betText = new HoneyPot.Text({type:"Text",text:"",align:"left",x:((barWidth/2)-34),y:6,style:textStyle});
	this.addChild(this.betText);

	this.winLbl = new HoneyPot.Text({type:"Text",text:HoneyPot.LocaleManager.getText("WIN")+":",align:"right",x:(barWidth-144-this.fullScreenPosX),y:6,style:textStyle});
	this.addChild(this.winLbl);
	
	this.winText = new HoneyPot.Text({type:"Text",text:"",align:"left",x:(barWidth-140-this.fullScreenPosX),y:6,style:textStyle});
	this.addChild(this.winText);

}

HoneyPot.BottomBarUI.prototype.resize = function(){
	if(this.fullScreen){
		this.barBg.width = this.app.getCanvasWidth();

		this.betLbl.x = ((this.app.getCanvasWidth()/2)-38);
		this.betText.x = ((this.app.getCanvasWidth()/2)-34);

		this.winLbl.x = (this.app.getCanvasWidth()-144-this.fullScreenPosX);
		this.winText.x = (this.app.getCanvasWidth()-140-this.fullScreenPosX);
	}

}
HoneyPot.BottomBarUI.prototype.setBalance = function(val){
	if(val == ''){
		this.balanceText.text = '';
	}else{
		this.balanceText.text = HoneyPot.Currency.formatMoneyPence(val);
	}
}

HoneyPot.BottomBarUI.prototype.setBet = function(val){
	if(val == ''){
		this.betText.text = '';
	}else{
		this.betText.text = HoneyPot.Currency.formatMoneyPence(val);
	}
}

HoneyPot.BottomBarUI.prototype.setWin = function(val){
	if(val == ''){
		this.winText.text = '';
	}else{
		this.winText.text = HoneyPot.Currency.formatMoneyPence(val);
	}
}