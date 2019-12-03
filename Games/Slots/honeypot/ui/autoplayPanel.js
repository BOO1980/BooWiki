HoneyPot.AutoplayPanel = function(config){
	HoneyPot.Container.call(this, config);

	this.closeCallback;
	this.startAutoplayCallback;
	this.gameState;
	this.autoplaySpins = [10,25,50,75,100];
	this.autoplayLossLimits = ['None',2,5,10,50];
	this.autoplayWinLimit = ['None',10,25,50,75];

	this.buttonData = {
					action:"Button",
					sound:"btnClickSound",
					id:"",
					x:0,
					y:0,
					state:{
						up:{
							imageName:"autoValueUp"
						},
						disabled:{
							imageName:"autoValueDisabled"
						}
					}
				};
	this.textData = {
					x:60,
					y:10,
					text:"£1.00",
					style:{
						colour:"#f7ba0c",
						fontSize:20,
						fontFamily:"MyriadProRegular"
					}
					
				};
	this.textColour = "#f7ba0c";
	this.buttonWidth = config.btnWidth;
	this.buttonHeight = config.btnHeight;

	this.closeBtn;
	this.selectedBtn;
	this.autoplaySpinsBtns = [];
	this.autoplayLossLimitsBtns = [];
	this.autoplayWinLimitBtns = [];

	this.selectedAutoplay = null;
	this.selectedLossLimits = null;
	this.selectedWinLimit = null;

	this.inAutoPlay = false;
	this.autoPlayCounter = 0;
	this.autoPlayCurrentLossLimit = 0;
	this.autoPlayCurrentWins = 0;

}

HoneyPot.AutoplayPanel.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.AutoplayPanel.prototype.constructor = HoneyPot.AutoplayPanel;

HoneyPot.AutoplayPanel.prototype.init = function(gameState, closeCallback, startAutoplayCallback){
	this.closeCallback = closeCallback;
	this.startAutoplayCallback = startAutoplayCallback

	this.gameState = gameState;

	var txtbg = new HoneyPot.Sprite({
								x:0,
								y:30,
								imageName:"autoTextBox"
							});
	this.addChild(txtbg);

	var txt = new HoneyPot.Text({
								type:"Text",
								text:"Numper of plays:",
								align:"left",
								x:20,
								y:38,
								style:{
									colour:"#f7ba0c",
									fontSize:15,
									fontFamily:"MyriadProRegular"
								}
							});
	this.addChild(txt);

	this.setupButtons(70, this.autoplaySpins, this.setAutoPlay.bind(this), '',this.autoplaySpinsBtns);

	var txtbg = new HoneyPot.Sprite({
								x:0,
								y:150,
								imageName:"autoTextBox"
							});
	this.addChild(txtbg);

	var txt = new HoneyPot.Text({
								type:"Text",
								text:"Loss Limit:",
								align:"left",
								x:20,
								y:158,
								style:{
									colour:"#f7ba0c",
									fontSize:15,
									fontFamily:"MyriadProRegular"
								}
							});
	this.addChild(txt);
	
	this.setupButtons(190, this.autoplayLossLimits, this.setLossLimit.bind(this),'x Bet',this.autoplayLossLimitsBtns);

	var txtbg = new HoneyPot.Sprite({
								x:0,
								y:270,
								imageName:"autoTextBox"
							});
	this.addChild(txtbg);

	var txt = new HoneyPot.Text({
								type:"Text",
								text:"Single Win Limit: (optional)",
								align:"left",
								x:20,
								y:278,
								style:{
									colour:"#f7ba0c",
									fontSize:15,
									fontFamily:"MyriadProRegular"
								}
							});
	this.addChild(txt);

	this.setupButtons(310, this.autoplayWinLimit, this.setWinLimit.bind(this),'x Bet', this.autoplayWinLimitBtns);

	var btnPosX = (this.autoplaySpins.length * this.buttonWidth)+10;

	this.closeBtn = new HoneyPot.Button({
								action:"Button",
								sound:"btnClickSound",
								id:"closeBtn",
							
								x:btnPosX,
								y:0,
								state:{
									up:{
										imageName:"closeBtnUp"
									},
									disabled:{
										imageName:"closeBtnDisabled"
									}
								}
							});
	this.addChild(this.closeBtn);
	this.closeBtn.setCallBack(this.closePanel.bind(this));

	this.selectedBtn =new HoneyPot.Button({
								action:"Button",
								sound:"btnClickSound",
								id:"applyBtn",
							
								x:btnPosX,
								y:350,
								state:{
									up:{
										imageName:"applyBtnUp"
									},
									disabled:{
										imageName:"applyBtnDisabled"
									}
								}
							});
	this.addChild(this.selectedBtn);
	this.selectedBtn.setCallBack(this.startAutoplay.bind(this));

}

HoneyPot.AutoplayPanel.prototype.setupButtons = function(startY, btnData, callback, addedtxt, btnArray){
	var data = {};
	data.x = 0;
	data.y = 0;
	data.value = 1;
	data.textColour = this.textColour;
	data.button = this.buttonData;
	data.text = this.textData;

	var posX = 0;// - (rows*this.buttonWidth);
	var posY = startY;

	for(var i=0;i<btnData.length; i++){
		data.x = posX;
		data.y = posY;
		data.id = i;
		data.value = btnData[i];
		data.textStake = btnData[i] == 'None' ?btnData[i]: btnData[i] +addedtxt;

		var btn = new HoneyPot.ValueButton(data);
		this.addChild(btn);
		btn.setCallback(callback);
		btnArray.push(btn);

		posX += this.buttonWidth;

	}
}
HoneyPot.AutoplayPanel.prototype.setAutoPlay = function(data){
	for(var i=0;i<this.autoplaySpinsBtns.length;i++){
		this.autoplaySpinsBtns[i].setSelected(false);
	}
	this.autoplaySpinsBtns[data.id].setSelected(true);
	this.selectedAutoplay = data.value;
	this.enableApplyButton();
}
HoneyPot.AutoplayPanel.prototype.setLossLimit = function(data){
	for(var i=0;i<this.autoplayLossLimitsBtns.length;i++){
		this.autoplayLossLimitsBtns[i].setSelected(false);
	}
	this.autoplayLossLimitsBtns[data.id].setSelected(true);
	this.selectedLossLimits = data.value;
	this.enableApplyButton();
}

HoneyPot.AutoplayPanel.prototype.setWinLimit = function(data){
	for(var i=0;i<this.autoplayWinLimitBtns.length;i++){
		this.autoplayWinLimitBtns[i].setSelected(false);
	}
	this.autoplayWinLimitBtns[data.id].setSelected(true);
	this.selectedWinLimit = data.value;
	this.enableApplyButton();
}

HoneyPot.AutoplayPanel.prototype.enableApplyButton = function(){
	if(this.selectedLossLimits !== null && this.selectedWinLimit !== null && this.selectedAutoplay != null){
		this.selectedBtn.alpha = 1;
	}else{
		this.selectedBtn.alpha = 0.3;
	}
}
HoneyPot.AutoplayPanel.prototype.clearValues = function(){
	for(var i=0;i<this.autoplaySpinsBtns.length;i++){
		this.autoplaySpinsBtns[i].setSelected(false);
	}
	for(var i=0;i<this.autoplayLossLimitsBtns.length;i++){
		this.autoplayLossLimitsBtns[i].setSelected(false);
	}
	for(var i=0;i<this.autoplayWinLimitBtns.length;i++){
		this.autoplayWinLimitBtns[i].setSelected(false);
	}
	this.selectedAutoplay = null;
	this.selectedLossLimits = null;
	this.selectedWinLimit = null;
	
}
HoneyPot.AutoplayPanel.prototype.showPanel = function(){
	this.clearValues();
	this.selectedBtn.alpha = 0.3;
	this.visible = true;
}
HoneyPot.AutoplayPanel.prototype.closePanel = function(){
	this.closeCallback();
	this.clearValues();
	this.visible = false;
}

HoneyPot.AutoplayPanel.prototype.checkAutoplay = function(){
	this.autoPlayCurrentWins += this.gameState.totalWin;
	var stake = (this.gameState.stake*this.gameState.getNumOfWinlines());
	this.autoPlayCurrentLossLimit += stake;
	this.autoPlayCounter += 1;
	if(this.selectedAutoplay == this.autoPlayCounter){
		this.stopAutoplay();
	}

	if(this.selectedLossLimits != 'none' && (this.selectedLossLimits*stake) <= this.autoPlayCurrentLossLimit){
		this.stopAutoplay();
	}

	if(this.selectedWinLimit != 'none' && (this.selectedWinLimit*stake) <= this.autoPlayCurrentWins){
		this.stopAutoplay();
	}
}
HoneyPot.AutoplayPanel.prototype.stopAutoplay = function(){
	this.inAutoPlay = false;
	this.autoPlayCounter = 0;
	this.autoPlayCurrentLossLimit = 0;
	this.autoPlayCurrentWins = 0;

}
HoneyPot.AutoplayPanel.prototype.startAutoplay = function(){
	if(this.selectedLossLimits !== null && this.selectedWinLimit !== null && this.selectedAutoplay != null){
		this.inAutoPlay = true;
		this.autoPlayCounter = 0;
		this.autoPlayCurrentLossLimit = 0;
		this.autoPlayCurrentWins = 0;
		this.startAutoplayCallback();
	}
}