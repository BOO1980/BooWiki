HoneyPot.ReelScreen = function(config){
	this.reelContainer;
	this.buttonsPanel = [];
	HoneyPot.Screen.call(this,config);
	this.state = 'idle';  //startspin, spin
	this.startSpinCallBack;
	this.closeSpinCallBack;
	this.winUpdateCallBack;
	this.spinTimer;
	this.minSpinTime = 1000;
	this.wins;
	this.scatterWin;
	this.winlinePanel;
	this.showAllWinlines = config.showAllWinlines ? config.showAllWinlines : false;

	this.balanceText;
	this.winText;
	this.currentWinnings = 0;
	this.stakeText;
	this.stakePerLineText;

	this.betPanelContainer;
	this.winlineContainer;
	this.winlineTimer = 0;
	this.winlineDelay =  config.winlineDelay ? config.winlineDelay : 100;
	
}

HoneyPot.ReelScreen.prototype = Object.create(HoneyPot.Screen.prototype);
HoneyPot.ReelScreen.prototype.constructor = HoneyPot.ReelScreen;

HoneyPot.ReelScreen.prototype.init = function(gameState){
	HoneyPot.Screen.prototype.init.call(this,gameState);
}

HoneyPot.ReelScreen.prototype.initComponents = function(){
	var slotDef = this.gameState.getSlotDef();
	this.winlineContainer = this.getComponentByID('winlineContainer');
	if(this.winlineContainer){
		this.winlineContainer.init(slotDef.winLines);
	}

	var reelSet;
	if(this.gameState.slotState && this.gameState.slotState.reelSetIndex){
		reelSet = slotDef.getReelSetByID(this.gameState.slotState.reelSetIndex);
	}else{
		reelSet = slotDef.getReelSetByID('0');
	}
	this.reelContainer = this.getComponentByID('reelContainer');
	if(this.reelContainer){
		this.reelContainer.init(reelSet);
		this.reelContainer.interactive = false;
   		this.reelContainer.buttonMode = false;
   		this.reelContainer.on('pointerdown', this.skipWinLines.bind(this));
	}
	
	this.winlinePanel = this.getComponentByID('winlinePanel');

	var obj = {};
	obj.numWinLines =slotDef.numWinLines;
	obj.stakeIncrements = this.gameState.stakeIncr;
	obj.defaultStake = this.gameState.stake;
}

HoneyPot.ReelScreen.prototype.updateSpin = function(delta){
	if(this.state == 'spin' || this.state == 'stopping' || this.state == 'stopped'){
		this.reelContainer.update(delta);
		if(this.state == 'stopping'){
			var currentTime = (new Date()).getTime();
			if((currentTime - this.spinTimer) >= this.minSpinTime){
				this.stoppingSpin();
				this.state = 'stopped';
			}
		}
	}
}
HoneyPot.ReelScreen.prototype.updateShowWinline = function(delta){
	if(this.state == 'showWinlines'){
		var slotDef = this.gameState.getSlotDef();
		this.winlineTimer -= 1;
		if(this.winlineTimer == 0){
			if(this.winlineContainer){
				this.winlineContainer.removeAllWinlines();
			}
			this.reelContainer.resetReelSymbols();
			this.hideWinPanel();
			if(this.winlineCounter >= this.wins.length){
				this.reelContainer.interactive = false;
   				this.reelContainer.buttonMode = false;
				this.closeSpin();
			}else{
				this.updateWinText(this.wins[this.winlineCounter].winnings);
				this.showWinPanel(this.winlineCounter);
				if(this.winlineContainer){
					this.winlineContainer.showWinline(this.wins[this.winlineCounter].winLine);
				}
				this.reelContainer.animateReelSymbols(slotDef.winLines[this.wins[this.winlineCounter].winLine].winlinePattern,this.gameState.getWinlineMask(this.wins[this.winlineCounter].index));
				this.app.playSound('lineWinSound');
			}
			this.winlineCounter += 1;
			this.winlineTimer = this.winlineDelay;
		}
	}
}

HoneyPot.ReelScreen.prototype.showWinPanel = function(counter){
	if(this.winlinePanel){
		this.winlinePanel.showWinPanel( HoneyPot.Currency.formatMoneyPence(this.wins[counter].winnings),this.app.getAssetById('winlinePanel'+this.wins[counter].winLine));
	}
}
HoneyPot.ReelScreen.prototype.hideWinPanel = function(counter){
	if(this.winlinePanel){
		this.winlinePanel.hideWinPanel();
	}
}
HoneyPot.ReelScreen.prototype.updateWinText = function(win){
	this.currentWinnings += win;
	this.winUpdateCallBack(this.currentWinnings);
}
HoneyPot.ReelScreen.prototype.updateShowScatterWin = function(delta){
	if(this.state == 'showScatterWins'){
		this.winlineTimer -= 1;
		if(this.winlineTimer == 0){
			this.showScatterBonus();
		}
	}
}

HoneyPot.ReelScreen.prototype.update = function(delta){
	HoneyPot.logger.log('update');
	this.updateSpin();
	this.updateShowWinline();
	this.updateShowScatterWin();
}
HoneyPot.ReelScreen.prototype.showScatterBonus = function(){
	this.reelContainer.resetReelSymbols();
	this.closeSpin();
}

HoneyPot.ReelScreen.prototype.stoppingSpin = function(){
	var that = this;
	var slotDef = this.gameState.getSlotDef();
	var rs = slotDef.getReelSetByID(this.gameState.slotState.reelSetIndex);
	this.reelContainer.setReelSet(rs);
	this.reelContainer.stopSpin(this.gameState.slotState.stop,this.reelsStopped.bind(this));
}
HoneyPot.ReelScreen.prototype.stopSpin = function(){
	this.state = 'stopping';
}
HoneyPot.ReelScreen.prototype.reelsStopped = function(){
	this.app.stopSound('reelspinSound');
	var sloteState = this.gameState.getSlotState();
	this.wins = sloteState.slotLineWins;
	if(this.wins.length > 0){
		this.showWinlines();
	}else{
		this.closeSpin();
	}
	
}

HoneyPot.ReelScreen.prototype.skipWinLines = function(){
	this.reelContainer.interactive = false;
	this.reelContainer.buttonMode = false;
	this.state == 'skipWinlines'
	for(var i=this.winlineCounter;i<this.wins.length;i++){
		this.updateWinText(this.wins[i].winnings);
	}

	this.winlineCounter = this.wins.length;
	this.hideWinPanel();
	this.closeSpin();
}
HoneyPot.ReelScreen.prototype.showWinlines = function(){
	this.state = 'showWinlines';
	this.winlineCounter = 0;
	if(!this.gameState.inFreeSpins){
		this.currentWinnings = 0;
	}
	this.reelContainer.interactive = true;
    this.reelContainer.buttonMode = true;

	if(this.winlineContainer){
		this.winlineContainer.winlineSymbols = this.gameState.getWinlineSymbols();
		if(this.showAllWinlines){
			this.winlineTimer = this.winlineDelay;
			for(var i=0;i<this.wins.length;i++){
				this.winlineContainer.showWinline(this.wins[i].winLine);
			}
		}else{
			this.winlineTimer = 1;
		}
	}else{
		this.winlineTimer = 1;
	}
}


HoneyPot.ReelScreen.prototype.showScatterWin = function(scatterWin){
	this.state = 'showScatterWins';
	this.winlineTimer = this.winlineDelay;
	this.scatterWin = scatterWin;
	this.reelContainer.resetReelSymbols();
	if(this.scatterWin.matchPositions){
		var win = scatterWin.matchPositions.split(';');
		var symbolPos = [];
		for(var i=0;i<win.length;i++){
			var pos = win[i].split(':');
			if(pos[0] != ''){
				symbolPos.push({col:pos[0], row:pos[1]});	
			}
		}
		this.reelContainer.animateScatterWin(symbolPos);	
	}
}

HoneyPot.ReelScreen.prototype.closeSpin = function(){
	if(this.winlineContainer){
		this.winlineContainer.removeAllWinlines();
	}
	this.reelContainer.resetReelSymbols();
	this.state = 'idle';
	this.closeSpinCallBack();
	
}
HoneyPot.ReelScreen.prototype.spin = function(){
	if(!this.gameState.inFreeSpins){
		this.winUpdateCallBack('');
		this.currentWinnings = 0;
	}
	HoneyPot.logger.log('spin callback'+this.state)

	if(this.state == 'idle'){
		this.state = 'spin';
		
		this.reelContainer.startSpin();
		this.app.playSound('reelspinSound');
		//this.startSpinCallBack();
		this.spinTimer = (new Date()).getTime();
	}
}

HoneyPot.ReelScreen.prototype.setStartSpinCallBack = function(cb){
	this.startSpinCallBack = cb;
}
HoneyPot.ReelScreen.prototype.setCloseSpinCallBack = function(cb){
	this.closeSpinCallBack = cb;
}
HoneyPot.ReelScreen.prototype.setWinUpdateCallBack = function(cb){
	this.winUpdateCallBack = cb;
}


HoneyPot.ReelScreen.prototype.disableButtons = function(){
	this.betPanelContainer.disableButtons();
	for(var i=0;i<this.buttonsPanel.length;i++){
		this.buttonsPanel[i].disableButton();
	}
}
HoneyPot.ReelScreen.prototype.enableButtons = function(){
	this.betPanelContainer.enableButtons();
	for(var i=0;i<this.buttonsPanel.length;i++){
		this.buttonsPanel[i].enableButton();
	}
}

HoneyPot.ReelScreen.prototype.autoplay = function(){
	HoneyPot.logger.log('autoplay callback');	
}

HoneyPot.ReelScreen.prototype.showHelp = function(){
	this.closScreenCallBack('helpScreen');
}

HoneyPot.ReelScreen.prototype.stakeUpdated = function(stake){
	this.gameState.stake = stake;
	HoneyPot.logger.log('stake = '+this.gameState.stake)
}

HoneyPot.ReelScreen.prototype.stakeUp = function(){
	this.betPanelContainer.stakeUp();
}

HoneyPot.ReelScreen.prototype.stakeDown = function(){
	this.betPanelContainer.stakeDown();
}
HoneyPot.ReelScreen.prototype.endFreeSpins = function(){

}
