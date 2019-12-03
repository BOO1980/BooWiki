HoneyPot.GameTableUI = function(config){
	HoneyPot.Container.call(this, config);

	this.buttonPanelPos = config.buttonPanelPos ? config.buttonPanelPos : 'left';
	
}

HoneyPot.GameTableUI.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.GameTableUI.prototype.constructor = HoneyPot.GameTableUI;

HoneyPot.GameTableUI.prototype.init = function(gameState){
	this.gameState = gameState;

	//this.stakePanel = this.getComponentByID('stakePanel');
	//this.stakePanel.init(this.gameState, this.closeStakePanel.bind(this), this.setStake.bind(this));

	this.bottomBarUI = new HoneyPot.BottomBarUI({id:"buttomBarUI",position:"bottom"});
	this.addChild(this.bottomBarUI);

	/*this.buttonPanelUI = this.getComponentByID('buttonPanelUI');

	var btn = this.buttonPanelUI.getComponentByID('playBtn');
	btn.setCallBack(this.spin.bind(this));
	this.buttonsPanel.push(btn);*/



	var slotDef = this.gameState.getSlotDef();
	if(slotDef){
		this.numWinlines = parseInt(slotDef.numWinLines);
	}else{
		this.numWinlines = 1;
	}
	this.setBetText(this.gameState.stake * this.numWinlines);
}

HoneyPot.GameTableUI.prototype.showStakes = function(){
	this.stakePanel.visible = true;
}
HoneyPot.GameTableUI.prototype.spin = function(){
	log('spin');
	this.startSpinCallBack();
}

HoneyPot.GameTableUI.prototype.closeComplete = function(){
	this.fadeInButtons();
}
HoneyPot.GameTableUI.prototype.setScreensBlurCallBack = function(cb){
	this.blurScreenCallBack = cb;
}
HoneyPot.GameTableUI.prototype.setStartSpinCallBack = function(cb){
	this.startSpinCallBack = cb;
}
HoneyPot.GameTableUI.prototype.setBalanceText = function(val){
	this.bottomBarUI.setBalance(val);
}
HoneyPot.GameTableUI.prototype.setBetText = function(val){
	this.bottomBarUI.setBet(val);
}
HoneyPot.GameTableUI.prototype.setWinText = function(val){
	if(val != ''){
		val = HoneyPot.Currency.formatMoneyPence(val);
	}
	this.bottomBarUI.setWin(val);
}