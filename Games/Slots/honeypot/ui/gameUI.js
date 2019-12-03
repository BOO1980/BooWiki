HoneyPot.GameUI = function(config){
	HoneyPot.Container.call(this, config);

	this.gameName = config.gameName;
	this.gameVersion = config.gameVersion;
	this.bottomBarUI
	this.gameState;
	this.buttonsPanel = [];
	this.startSpinCallBack;
	this.blurScreenCallBack;
	this.setStakeCallBack;
	this.startAutoPlayCallBack;
	this.showHelpCallBack;
	this.setSoundCallBack;
	this.buttonPanelUI;
	this.stakePanel;
	this.autoplayPanel;
	this.helpPanel;
	this.settingsPanel;
	this.helpPages = config.helpPages ? config.helpPages : [];
	this.uiPosition = config.buttonPanelPos ? config.buttonPanelPos : 'left';
	this.bigWinClass = config.bigWinClass ? config.bigWinClass : 'BigWinPanel';

	this.fullScreen = config.fullScreen == true ? config.fullScreen : false;

	this.autoPlayBtn;
	this.autoPlayStopBtn;
	this.spinCounter;
	this.spinCounterBG;
	this.freeSpinCounter;

	this.stakeBtn;
	this.settingsBtn;
	this.helpBtn;
	this.spinBtn;

	this.bigWinPanel;
	this.winShownCallBack;
	
}

HoneyPot.GameUI.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.GameUI.prototype.constructor = HoneyPot.GameUI;

HoneyPot.GameUI.prototype.init = function(gameState){
	this.gameState = gameState;

	this.stakePanel = new HoneyPot.StakePanel({id:"stakePanel",x:0,y:0,visible:false,btnWidth:130,btnHeight:60});
	this.stakePanel.init(this.gameState, this.closeStakePanel.bind(this), this.setStake.bind(this));
	this.addChild(this.stakePanel);

	this.autoplayPanel = new HoneyPot.AutoplayPanel({id:"autoplayPanel",x:0,y:0,visible:false,btnWidth:130,btnHeight:60});
	this.autoplayPanel.init(this.gameState, this.closeStakePanel.bind(this), this.startAutoplay.bind(this));
	this.addChild(this.autoplayPanel);

	this.helpPanel = new HoneyPot.HelpPanel({id:"helpPanel",x:0,y:0,visible:false,pages:this.helpPages});
	this.helpPanel.init(this.gameState, this.closeHelpPanel.bind(this),this.gameName,this.gameVersion);
	this.addChild(this.helpPanel);

	this.settingsPanel = new HoneyPot.SettingsPanel({id:"settingsPanel",x:0,y:0,visible:false,uiPosition:this.uiPosition});
	this.settingsPanel.init(this.closeSettingsPanel.bind(this),this.setSound.bind(this),this.setVibrate.bind(this),this.setUIPosition.bind(this));
	this.addChild(this.settingsPanel);

	//this.bigWinPanel = new HoneyPot.BigWinPanel({id:"bigWinPanel",x:0,y:0,visible:false});
	this.bigWinPanel = new HoneyPot[this.bigWinClass]({id:"bigWinPanel",x:0,y:0,visible:false});
	this.bigWinPanel.init(this.totalWinShown.bind(this));
	this.bigWinPanel.interactive = false;
    this.bigWinPanel.buttonMode = false;
    this.bigWinPanel.on('pointerdown', this.bigWinPanel.skip.bind(this.bigWinPanel));
	this.addChild(this.bigWinPanel);

	this.buttonPanelUI = new HoneyPot.Container({id:"buttonPanelUI",x:0,y:0});
	this.addChild(this.buttonPanelUI);

	this.spinCounterBG = new HoneyPot.Sprite({
								x:0,
								y:64,
								imageName:"autoCount"
							});
	this.buttonPanelUI.addChild(this.spinCounterBG);

	this.spinCounter = new HoneyPot.Text({
								type:"Text",
								text:"",
								align:"center",
								x:65.5,
								y:100,
								style:{
									colour:"#f7ba0c",
									fontSize:55,
									fontWeight:700,
									fontFamily:"MyriadProRegular"
								}
							});
	this.buttonPanelUI.addChild(this.spinCounter);

	this.spinCounter.visible = false;
	this.spinCounterBG.visible = false;

	this.freeSpinCounter = new HoneyPot.Text({
								type:"Text",
								text:"",
								align:"center",
								x:900,
								y:300,
								style:{
									colour:"#f7ba0c",
									fontSize:20,
									fontWeight:700,
									fontFamily:"MyriadProRegular",
									stroke:"#000000",
									strokeThickness:3
								}
							});
	this.addChild(this.freeSpinCounter);
	this.freeSpinCounter.visible = false;

	this.spinBtn = new HoneyPot.Button({action:"Button",sound:"btnClickSound",id:"spinBtn",x:0,y:64,state:{up:{imageName:"spinBtnUp"},disabled:{imageName:"spinBtnDisabled"}}});
	this.buttonPanelUI.addChild(this.spinBtn);
	this.spinBtn.setCallBack(this.spin.bind(this));
	this.buttonsPanel.push(this.spinBtn);

	this.helpBtn = new HoneyPot.Button({action:"Button",sound:"btnClickSound",id:"helpBtn",x:73.5,y:0,state:{up:{imageName:"helpBtnUp"},disabled:{imageName:"helpBtnDisabled"}}});
	this.buttonPanelUI.addChild(this.helpBtn);
	this.helpBtn.setCallBack(this.showHelp.bind(this));
	this.buttonsPanel.push(this.helpBtn);

	this.autoPlayBtn = new HoneyPot.Button({action:"Button",sound:"btnClickSound",id:"autoPlayBtn",x:0,y:0,state:{up:{imageName:"autoPlayBtnUp"},disabled:{imageName:"autoPlayBtnDisabled"}}});
	this.buttonPanelUI.addChild(this.autoPlayBtn);
	this.autoPlayBtn.setCallBack(this.showAutoplayPanel.bind(this));
	this.buttonsPanel.push(this.autoPlayBtn);

	this.autoPlayStopBtn = new HoneyPot.Button({action:"Button",sound:"btnClickSound",id:"autoStopBtn",x:0,y:0,state:{up:{imageName:"autoStopBtnUp"},disabled:{imageName:"autoStopBtnDisabled"}}});
	this.buttonPanelUI.addChild(this.autoPlayStopBtn);
	this.autoPlayStopBtn.setCallBack(this.stopAutoplay.bind(this));
	this.buttonsPanel.push(this.autoPlayStopBtn);

	this.autoPlayStopBtn.visible = false;

	this.settingsBtn = new HoneyPot.Button({action:"Button",sound:"btnClickSound",id:"settingsBtn",x:73.5,y:200,state:{up:{imageName:"settingsBtnUp"},disabled:{imageName:"settingsBtnDisabled"}}});
	this.buttonPanelUI.addChild(this.settingsBtn);
	this.settingsBtn.setCallBack(this.showSettings.bind(this));
	this.buttonsPanel.push(this.settingsBtn);

	this.stakeBtn = new HoneyPot.Button({action:"Button",sound:"btnClickSound",id:"stakeBtn",x:0,y:200,state:{up:{imageName:"stakeBtnUp"},disabled:{imageName:"stakeBtnDisabled"}}});
	this.buttonPanelUI.addChild(this.stakeBtn);
	this.stakeBtn.setCallBack(this.showStakes.bind(this));
	this.buttonsPanel.push(this.stakeBtn);


	this.bottomBarUI = new HoneyPot.BottomBarUI({id:"buttomBarUI",position:"bottom",fullScreen:false, border:2});
	this.addChild(this.bottomBarUI);

	this.resize(1);

	var slotDef = this.gameState.getSlotDef();
	if(slotDef){
		this.numWinlines = parseInt(slotDef.numWinLines);
	}else{
		this.numWinlines = 1;
	}
	this.setBetText(this.gameState.stake * this.numWinlines);
}

HoneyPot.GameUI.prototype.setUIPosition = function(pos){
	this.uiPosition = pos;
	if(this.uiPosition == 'right'){
		//this.buttonPanelUI.x = this.app.getGameWidth() - this.buttonPanelUI.width-10;
		if(this.fullScreen){
			this.buttonPanelUI.x = this.app.getCanvasWidth() - this.buttonPanelUI.width-10;
		}else{
			this.buttonPanelUI.x = this.app.getGameWidth() - this.buttonPanelUI.width-10;
		}
		this.stakePanel.x =  this.buttonPanelUI.x - this.stakePanel.width;
		this.autoplayPanel.x =  this.buttonPanelUI.x - this.autoplayPanel.width;
		this.settingsPanel.x =  this.buttonPanelUI.x - this.settingsPanel.width-20;
		this.helpPanel.x =  this.buttonPanelUI.x - this.helpPanel.width-20;
	}else{
		this.buttonPanelUI.x = 10;
		this.stakePanel.x = 10+ this.buttonPanelUI.x + this.buttonPanelUI.width;
		this.autoplayPanel.x = 10+ this.buttonPanelUI.x + this.buttonPanelUI.width;
		this.settingsPanel.x = 50+ this.buttonPanelUI.x + this.buttonPanelUI.width;
		this.helpPanel.x = 20+ this.buttonPanelUI.x + this.buttonPanelUI.width;
	}

}
HoneyPot.GameUI.prototype.stopAutoplay = function(){
	this.autoPlayBtn.visible = true;
	this.autoPlayStopBtn.visible = false;
	this.spinCounter.visible = false;
	this.spinCounterBG.visible = false;
	this.stakeBtn.visible = true;
	this.settingsBtn.visible = true;
	this.helpBtn.visible = true;
	this.spinBtn.visible = true;
	this.spinCounter.text = '';
	this.autoplayPanel.stopAutoplay();
}
HoneyPot.GameUI.prototype.startAutoplay = function(){
	this.blurScreenCallBack(false);
	this.autoplayPanel.visible = false;
	this.disableButtons();

	this.stakeBtn.visible = false;
	this.settingsBtn.visible = false;
	this.helpBtn.visible = false;
	this.spinBtn.visible = false;

	this.autoPlayBtn.visible = false;
	this.autoPlayStopBtn.visible = true;
	this.spinCounter.visible = true;
	this.spinCounterBG.visible = true;
	this.spinCounter.text =this.autoplayPanel.selectedAutoplay;
	this.autoPlayStopBtn.enableButton();
	this.startAutoPlayCallBack();
}

HoneyPot.GameUI.prototype.inAutoPlay = function(){
	return this.autoplayPanel.inAutoPlay;
}
HoneyPot.GameUI.prototype.nextAutoPlay = function(){
	this.autoplayPanel.checkAutoplay();

	if(!this.autoplayPanel.inAutoPlay){
		this.stopAutoplay();
		//this.closeComplete();
	}else{
		this.spinCounter.text = this.autoplayPanel.selectedAutoplay - this.autoplayPanel.autoPlayCounter;
	}

}
HoneyPot.GameUI.prototype.setStake = function(stake){
	this.setBetText(this.gameState.stake * this.numWinlines);
	this.setStakeCallBack(this.gameState.stake * this.numWinlines);
	this.blurScreenCallBack(false);
	this.stakePanel.visible = false;
	this.enableButtons();
}

HoneyPot.GameUI.prototype.closeStakePanel = function(){
	this.blurScreenCallBack(false);
	this.stakePanel.visible = false;
	this.enableButtons();
}
HoneyPot.GameUI.prototype.closeHelpPanel = function(){
	this.blurScreenCallBack(false);
	this.helpPanel.visible = false;
	this.enableButtons();
	if(this.showHelpCallBack){
		this.showHelpCallBack(false);
	}
}
HoneyPot.GameUI.prototype.closeSettingsPanel = function(){
	this.blurScreenCallBack(false);
	this.settingsPanel.visible = false;
	this.enableButtons();
}
HoneyPot.GameUI.prototype.fadeOutButtons = function(){
	TweenLite.to(this.buttonPanelUI, 0.1, {pixi:{alpha:0}});
	this.disableButtons();
}
HoneyPot.GameUI.prototype.fadeInButtons = function(){
	TweenLite.to(this.buttonPanelUI, 0.3, {pixi:{alpha:1}});
	this.enableButtons();
}
HoneyPot.GameUI.prototype.disableButtons = function(){
	for(var i=0;i<this.buttonsPanel.length;i++){
		this.buttonsPanel[i].disableButton();
	}	
}
HoneyPot.GameUI.prototype.enableButtons = function(){
	TweenLite.to(this.buttonPanelUI, 0.3, {pixi:{alpha:1}});
	for(var i=0;i<this.buttonsPanel.length;i++){
		this.buttonsPanel[i].enableButton();
	}	
}
HoneyPot.GameUI.prototype.setUpStakeSelector = function(){
	
}
HoneyPot.GameUI.prototype.spin = function(){
	if(this.bigWinPanel.visible){
		this.hideTotalWin();
	}
	this.fadeOutButtons();
	this.startSpinCallBack();
}
HoneyPot.GameUI.prototype.showHelp = function(){
	if(this.bigWinPanel.visible){
		this.hideTotalWin();
	}
	this.blurScreenCallBack(true);
	this.helpPanel.visible = true;
	this.disableButtons();
	if(this.showHelpCallBack){
		this.showHelpCallBack(true);
	}
}
HoneyPot.GameUI.prototype.showAutoplayPanel = function(){
	if(this.bigWinPanel.visible){
		this.hideTotalWin();
	}
	this.autoplayPanel.showPanel(); //visible = true;
	this.blurScreenCallBack(true);
	this.disableButtons();
}
HoneyPot.GameUI.prototype.showSettings = function(){
	if(this.bigWinPanel.visible){
		this.hideTotalWin();
	}
	this.blurScreenCallBack(true);
	this.settingsPanel.visible = true;
	this.disableButtons();
}
HoneyPot.GameUI.prototype.showStakes = function(){
	if(this.bigWinPanel.visible){
		this.hideTotalWin();
	}
	this.blurScreenCallBack(true);
	this.stakePanel.show();
	//this.stakePanel.visible = true;
	this.disableButtons();
}

HoneyPot.GameUI.prototype.showTotalWin = function(val){
	//this.blurScreenCallBack(true);
	this.bigWinPanel.show(val,(this.gameState.stake*this.gameState.slotDef.numWinLines));
	//this.disableButtons();
	this.bigWinPanel.interactive = true;
	this.bigWinPanel.buttonMode = true;
}

HoneyPot.GameUI.prototype.totalWinShown = function(){
	this.bigWinPanel.interactive = false;
	this.bigWinPanel.buttonMode = false;

	this.bigWinPanel.visible = false;
	this.winShownCallBack();
}
HoneyPot.GameUI.prototype.hideTotalWin = function(){
	if(this.bigWinPanel.visible){
		this.bigWinPanel.interactive = false;
		this.bigWinPanel.buttonMode = false;
		//this.blurScreenCallBack(false);
		this.bigWinPanel.hide();
		//this.enableButtons();
	}
}

HoneyPot.GameUI.prototype.setVibrate = function(val){
	
}

HoneyPot.GameUI.prototype.showFreeSpins = function(fs){
	this.stakeBtn.visible = false;
	this.settingsBtn.visible = false;
	this.helpBtn.visible = false;
	this.spinBtn.visible = false;

	this.autoPlayBtn.visible = false;
	this.autoPlayStopBtn.visible = false;

	if(!this.spinCounter.visible){
		TweenLite.to(this.buttonPanelUI, 0.3, {pixi:{alpha:1}});
		this.spinCounter.visible = true;
		this.spinCounterBG.visible = true;
	}
	/*if(fs == 0){
		fs = 'Last\nOne';
	}*/
	this.spinCounter.text = fs;
}
HoneyPot.GameUI.prototype.hideFreeSpins = function(fs){
	this.stakeBtn.visible = true;
	this.settingsBtn.visible = true;
	this.helpBtn.visible = true;
	this.spinBtn.visible = true;
	this.autoPlayBtn.visible = true;
	this.spinCounterBG.visible = false;
	this.spinCounter.visible = false;
	this.spinCounter.text = '';
}
HoneyPot.GameUI.prototype.closeComplete = function(){
	this.fadeInButtons();
}
HoneyPot.GameUI.prototype.setWinShownCallBack = function(cb){
	this.winShownCallBack = cb;
}
HoneyPot.GameUI.prototype.setSetStakeCallBack = function(cb){
	this.setStakeCallBack = cb;
}
HoneyPot.GameUI.prototype.setScreensBlurCallBack = function(cb){
	this.blurScreenCallBack = cb;
}
HoneyPot.GameUI.prototype.setStartAutoPlayCallBack = function(cb){
	this.startAutoPlayCallBack = cb;
}
HoneyPot.GameUI.prototype.setShowHelpCallBack = function(cb){
	this.showHelpCallBack = cb;
}
HoneyPot.GameUI.prototype.setSetSoundCallBack = function(cb){
	this.setSoundCallBack = cb;
}
HoneyPot.GameUI.prototype.setStartSpinCallBack = function(cb){
	this.startSpinCallBack = cb;
}
HoneyPot.GameUI.prototype.setBalanceText = function(val){
	this.bottomBarUI.setBalance(val);
}
HoneyPot.GameUI.prototype.setBetText = function(val){
	this.bottomBarUI.setBet(val);
}
HoneyPot.GameUI.prototype.showHelpFromTopBar = function(val){
	if(val){
		this.showHelp();
	}else{
		this.closeHelpPanel();
	}
}
HoneyPot.GameUI.prototype.setSoundFromTopBar = function(val){
	this.settingsPanel.soundBtnDown();
}
HoneyPot.GameUI.prototype.setSound = function(val){
	this.app.toggleMute();
	this.setSoundCallBack(val);
}
HoneyPot.GameUI.prototype.setWinText = function(val){
	//if(val != ''){
	//	val = HoneyPot.Currency.formatMoneyPence(val);
	//}
	this.bottomBarUI.setWin(val);
}
HoneyPot.GameUI.prototype.update = function(delta){
	if(this.bigWinPanel){
		this.bigWinPanel.update(delta);
	}
}
HoneyPot.GameUI.prototype.resize = function(scale){
	if(this.fullScreen){ 
		this.buttonPanelUI.scale.x = scale;
		this.buttonPanelUI.scale.y = scale;
		this.buttonPanelUI.y = ((this.app.getCanvasHeight()-this.buttonPanelUI.height)/2);
		this.autoplayPanel.scale.x = scale;
		this.autoplayPanel.scale.y = scale;
		this.autoplayPanel.y = ((this.app.getCanvasHeight()-this.autoplayPanel.height)/2);
		this.settingsPanel.scale.x = scale;
		this.settingsPanel.scale.y = scale;
		this.settingsPanel.y = ((this.app.getCanvasHeight()-this.settingsPanel.height)/2);
		this.stakePanel.scale.x = scale;
		this.stakePanel.scale.y = scale;
		this.stakePanel.y = ((this.app.getCanvasHeight()-this.stakePanel.height)/2);
		this.helpPanel.scale.x = scale;
		this.helpPanel.scale.y = scale;
		this.helpPanel.y = ((this.app.getCanvasHeight()-this.helpPanel.height)/2);

		this.setUIPosition(this.uiPosition);

		this.bottomBarUI.y = (this.app.getCanvasHeight()-this.bottomBarUI.height);
		this.bottomBarUI.resize();
	}else{
		this.buttonPanelUI.y = ((this.app.getGameHeight()-this.buttonPanelUI.height)/2);
		this.autoplayPanel.y = ((this.app.getGameHeight()-this.autoplayPanel.height)/2);
		this.settingsPanel.y = ((this.app.getGameHeight()-this.settingsPanel.height)/2);
		this.stakePanel.y = ((this.app.getGameHeight()-this.stakePanel.height)/2);
		this.helpPanel.y = ((this.app.getGameHeight()-this.helpPanel.height)/2);

		this.setUIPosition(this.uiPosition);

		this.bottomBarUI.y = (this.app.getGameHeight()-this.bottomBarUI.height-this.bottomBarUI.border);
	}
}