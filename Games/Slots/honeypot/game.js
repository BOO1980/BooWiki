HoneyPot.Game = function(){
	this.connection = null;
	this.config = null;
	this.app = null;
	this.screens = [];
	this.canvas = null;
	this.gameState = null;
	this.bonusWinCount = 0;
	this.currentScreen = '';
	this.backgrounds = [];
	this.screenWrapper;
	this.gameUI;
	this.fullScreenBG = false;
	this.origBGWidth = 1024;
	this.origBGHeight = 600;
	this.topBar;
	this.gameMinFPS = 5;
	this.gameMaxFPS = 60;
	this.mainScreen;
	this.rotationScreen;
	this.gameVersion;
	this.gameName;

	this.pauseTimer = false;
}

HoneyPot.Game.prototype.init = function(){
	this.loadConfig();

}

HoneyPot.Game.prototype.loadConfig = function(){
	this.config = gameConfig;
	HoneyPot.logger.logLevel = this.config.game.logLevel;
	this.gameMinFPS = this.config.game.minFPS ? this.config.game.minFPS : 5;
	this.gameMaxFPS = this.config.game.maxFPS ? this.config.game.maxFPS : 60;
	this.configLoaded();  
	
}

HoneyPot.Game.prototype.configLoaded = function(){
	this.gameVersion = this.config.game.version ? this.config.game.version : "0.0.0";
	this.gameName = this.config.game.gameName ? this.config.game.gameName : "0.0.0";

	var topBarType = this.config.game.topBar && this.config.game.topBar.type ? this.config.game.topBar.type : 'TopBar';
	this.topBar = new HoneyPot[topBarType](this.config.game.topBar, this.config.connection,this.topBarReady.bind(this));
	this.topBar.init();
}
HoneyPot.Game.prototype.topBarReady = function(){
	this.connection = new HoneyPot[this.config.connection.connectionType](this.config.connection, this.connectionReady.bind(this));
	this.connection.init();
}
HoneyPot.Game.prototype.connectionReady = function(){
	this.gameState = this.connection.getGameState();
	this.topBar.setupAccount(this.connection.account);
	
	this.setupLocale();
	this.setupGraphicsDriver();
}
HoneyPot.Game.prototype.setupLocale = function(){
	if(uiConfig && uiConfig.locale){
		HoneyPot.LocaleManager.addLocaleData(uiConfig.locale);
	}
	HoneyPot.LocaleManager.addLocaleData(this.config.locale);

	var callback = this.setupGraphicsDriver.bind(this);
	if(this.topBar.getLanguage()){
		$.getJSON( "assets/locale/"+this.topBar.getLanguage()+".json")
		  .done(function( json ) {
		  	HoneyPot.LocaleManager.addLocaleData(json.locale)
		   // callback();
		  })
		  .fail(function( jqxhr, textStatus, error ) {
		    //callback();
		});
	}
}
HoneyPot.Game.prototype.setupGraphicsDriver = function(){
	HoneyPot.logger.log('setupPIXI');
	HoneyPot.GraphicsDriver.init(this.config.game);
	this.app = HoneyPot.GraphicsDriver.getGraphicsDriver();
	this.canvas = this.app.getContext();
	var that = this;
	var tbProgressCallback = null;

	this.app.loadAssets(this.config.assets,this.assetsLoadedCallback.bind(this),this.topBar.updateProgressBar.bind(this.topBar))
}

HoneyPot.Game.prototype.assetsLoadedCallback = function(){

	this.buildBackground();
	this.screenWrapper = new HoneyPot.Container({id:'screenWrapper'});
	this.canvas.stage.addChild(this.screenWrapper);
	
	this.buildScreens();
	this.buildUI();
	this.buildRotationScreen();

	this.topBar.gameReady(this.revealGame.bind(this));
	
}
HoneyPot.Game.prototype.revealGame = function(){
	this.startTimer();
	this.startGame();
}
HoneyPot.Game.prototype.buildRotationScreen = function(){
	this.rotationScreen = new HoneyPot.RotaionScreen({id:'rotationScreen', x:0, y:0});
	this.canvas.stage.addChild(this.rotationScreen);
}
HoneyPot.Game.prototype.startTimer = function(){
	this.resize();
	this.canvas.ticker.minFPS = 1;
	this.canvas.ticker.maxFPS = this.gameMinFPS;
	this.canvas.ticker.add(this.update, this);
}
HoneyPot.Game.prototype.setUpScreenCallbacks = function(){
	this.screens['reelScreen'].setWinUpdateCallBack(this.gameUI.setWinText.bind(this.gameUI));
	this.screens['reelScreen'].setCloseSpinCallBack(this.stopPlay.bind(this));
}
HoneyPot.Game.prototype.startGame = function(){
	var that = this;
	this.setUpScreenCallbacks();
	this.mainScreen = this.config.screens.mainScreen ? this.config.screens.mainScreen : 'reelScreen';

	if(this.config.screens.startScreen){
		this.currentScreen = this.config.screens.startScreen;
		var startGameBtn = this.screens[this.currentScreen].getComponentByID('startGameBtn');
		startGameBtn.setCallBack(this.hideStartScreen.bind(this));
		this.screens[this.currentScreen].show();
	}else{
		this.startMainGame();
	}	
}

HoneyPot.Game.prototype.hideStartScreen = function(){
	this.screens[this.currentScreen].hide();
	this.startMainGame();
}
HoneyPot.Game.prototype.startMainGame = function(){
	this.currentScreen = this.mainScreen;//'reelScreen';
	if(this.config.screens.welcomeTransitionFade){
		this.background.alpha = 0;
		this.screens[this.currentScreen].alpha = 0;
		this.gameUI.alpha = 0;
	}
	this.gameUI.visible = true;
	this.background.visible = true;
	

	this.screens[this.currentScreen].show();

	if(this.config.screens.welcomeTransitionFade){
		this.canvas.ticker.maxFPS = this.gameMaxFPS;
		TweenLite.to(this.background, 0.5, {pixi:{alpha:1}});
		TweenLite.to(this.gameUI, 0.5, {pixi:{alpha:1}});
		TweenLite.to(this.screens[this.currentScreen], 0.5, {onComplete:this.welcomeTransitionComplete.bind(this), pixi:{alpha:1}});
	}
}

HoneyPot.Game.prototype.welcomeTransitionComplete = function(){
	this.canvas.ticker.maxFPS = this.gameMinFPS;

	if(this.gameState.gip){
		//this.gameUI.state = 'GIP';
		//this.gameUI.showWarningMessage(HoneyPot.LocaleManager.getText('GIP_MESSAGE'), this.startGIP.bind(this));
		this.topBar.showWarningMessage('GIP_MESSAGE',this.startGIP.bind(this));
	}else{
		this.updateBalance();
	}
}


HoneyPot.Game.prototype.startGIP = function(){
	this.canvas.ticker.maxFPS = this.gameMaxFPS;
	this.bonusWinCount = 0;
	if(this.gameState.slotState && this.gameState.slotState.action == 'freeSpinReels'){
		this.topBar.setwin(this.gameState.slotState.bonusWinnings);
		this.gameUI.showFreeSpins(this.gameState.slotState.numFreeSpins);
		this.gameState.inFreeSpins = true;
		//
	}else{
		this.gameUI.fadeOutButtons();
	}
	console.log('startGIP');
	this.screens['reelScreen'].spin();
	this.playRequestReceived();
}
HoneyPot.Game.prototype.buildBackground = function(){
	if(this.config.background){
		this.background = new HoneyPot[this.config.background.type](this.config.background);
		this.fullScreenBG = this.config.background.fullScreen;
		this.origBGWidth = this.background.width;
		this.origBGHeight = this.background.height;
		if(this.fullScreenBG){
			this.background.width = this.app.getCanvasWidth();
			this.background.height = this.app.getCanvasHeight();
		}
		this.canvas.stage.addChild(this.background);
		this.background.visible = false;
	}
}
HoneyPot.Game.prototype.buildScreens = function(){
	
	for(var obj in this.config.screens.children){
		var data = this.config.screens.children[obj];
		var screen = new HoneyPot[data.type](data);

		this.buildComponents(screen, data.children);
		this.screenWrapper.addChild(screen);
		screen.visible = false;
		this.screens[data.id] = screen;
	}
	
	this.initComponents();
}

HoneyPot.Game.prototype.buildUI = function(){
	this.config.ui.gameVersion = this.gameVersion;
	this.config.ui.gameName = this.gameName;
	//
	if(this.config.ui.uiType == 'custom'){
		//this.buildComponents(this.screenWrapper, this.config.ui.children);
		//this.gameUI = this.screenWrapper.getComponentByID('gameUI');
		this.gameUI = new HoneyPot[this.config.ui.uiClass](this.config.ui);
		//this.screenWrapper.addChild(this.gameUI);
		this.canvas.stage.addChild(this.gameUI);
		this.gameUI.init(this.gameState);
	}else{
		this.gameUI = new HoneyPot.GameUI(this.config.ui);
		if(this.config.ui.fullScreen == true){
			this.canvas.stage.addChild(this.gameUI);
		}else{
			this.screenWrapper.addChild(this.gameUI);
		}
		this.gameUI.init(this.gameState);
		this.gameUI.setStartAutoPlayCallBack(this.startAutoPlay.bind(this));
		this.gameUI.setSetStakeCallBack(this.setStake.bind(this));
		this.topBar.setStake(this.gameState.stake * this.gameState.getNumOfWinlines());
		if(this.topBar.type == 'gcm'){
			this.connection.setProcessErrorMessageCallBack(this.topBar.showWarningMessage.bind(this.topBar));
			this.gameUI.setSetSoundCallBack(this.topBar.setMute.bind(this.topBar));
			this.topBar.setSetMuteCallBack(this.gameUI.setSoundFromTopBar.bind(this.gameUI));

			this.gameUI.setShowHelpCallBack(this.topBar.showHelp.bind(this.topBar));
			this.topBar.setShowHelpCallBack(this.gameUI.showHelpFromTopBar.bind(this.gameUI));
		}
		this.gameUI.setWinShownCallBack(this.winShown.bind(this));
	}
	
	this.gameUI.setStartSpinCallBack(this.startPlay.bind(this));
	this.gameUI.setScreensBlurCallBack(this.blurScreens.bind(this));
	//this.updateBalance(this.connection.getBalance());
	this.gameUI.visible = false;
	
}

HoneyPot.Game.prototype.initComponents = function(){
	for(var screen in this.screens){
		this.screens[screen].init(this.gameState);
		this.screens[screen].setCloseScreenCallBack(this.switchScreen.bind(this));
	}

}
HoneyPot.Game.prototype.updateBalance = function(win){
	if(win){
		this.gameUI.setBalanceText(this.connection.account.balance - win);
		this.topBar.updateBalance(this.connection.account,win);
	}else{
		this.gameUI.setBalanceText(this.connection.account.balance);
		this.topBar.updateBalance(this.connection.account,0);
	}

	//this.topBar.updateBalance(this.connection.account);
	//this.gameUI.setBalanceText(val);
	
}
HoneyPot.Game.prototype.buildComponents = function(tgt,config){
	for(var obj in config){
		var data = config[obj];
		var item = new HoneyPot[data.type](data);

		tgt.addChild(item);
		if(data.id && tgt.components){
			tgt.components[data.id] = item;
		}

		if(data.isMask == 'true'){
			tgt.mask = item;
		}

		if(data.mask){
			var maskItem = new HoneyPot[data.mask.type](data.mask);
			tgt.addChild(maskItem);
			tgt.mask = maskItem;
		}

		if(data.children){
			this.buildComponents(item, data.children);
		}

	}
}

HoneyPot.Game.prototype.update = function(delta) { 
	if(!this.pauseTimer){
		var screen = this.screens[this.currentScreen];
		if(screen){
			screen.update(delta);
		}
		if(this.gameUI){
			this.gameUI.update(delta);
		}
	}
}

HoneyPot.Game.prototype.resize = function() {
	
	if(this.app){ 
		this.app.resize();	
		if(this.rotationScreen){
			this.rotationScreen.resize();
		}
		if(this.fullScreenBG){
			this.background.width = this.app.getCanvasWidth();
			this.background.height = this.app.getCanvasHeight();
		}else{
			//this.background.x = this.app.getCanvasWidth()/2;
			//this.background.y = this.app.getCanvasHeight()/2;
			var bgw = window.innerWidth/this.origBGWidth;
			var bgh = window.innerHeight/this.origBGHeight;
			var bgScale = bgw;
			if(bgh > bgw){
				bgScale = bgh;
			}
			if(this.background){

				this.background.scale.x = bgScale;
				this.background.scale.y = bgScale;
				this.background.position.x = this.app.getCanvasWidth()/2;
				this.background.position.y = this.app.getCanvasHeight()/2;
			}
		}


		var gameWidth = this.app.getGameWidth();
		var gameHeight = this.app.getGameHeight();

		var w = (window.innerWidth/gameWidth);
		var h = (window.innerHeight/gameHeight);
		var scale = h
		if(h > w){
			scale = w;
		}

		if(this.screenWrapper){
			this.screenWrapper.scale.x = scale; 
			this.screenWrapper.scale.y = scale;

			this.screenWrapper.x = (this.app.getCanvasWidth()-(gameWidth*scale))/2;
			this.screenWrapper.y = (this.app.getCanvasHeight()-(gameHeight*scale))/2;
		}

		if(this.gameUI){
			this.gameUI.resize(scale,this.screenWrapper.y);
		}
		if(this.app.getCanvasWidth() < this.app.getCanvasHeight()){
			if(this.rotationScreen){
				this.rotationScreen.show();
			}
			if(this.screens[this.currentScreen]){
				this.screens[this.currentScreen].hide();
			}
			this.app.muteSoundOrientation(true);
			this.gameUI.stopAutoplay();
			
			this.pauseTimer = true;
		}else{
			if(this.rotationScreen){
				this.rotationScreen.hide();
			}
			if(this.screens[this.currentScreen]){
				this.screens[this.currentScreen].show();
			}
			this.app.muteSoundOrientation(false);
			this.pauseTimer = false;
		}

		 $(window).scrollTop(0);
	}
}

HoneyPot.Game.prototype.blurScreens = function(blur){
	this.screens[this.currentScreen].blurScreen(blur);
}
HoneyPot.Game.prototype.switchScreen = function(screenToOpen){
	HoneyPot.logger.log('switch = ' +  screenToOpen)
	this.screens[this.currentScreen].hide();
	this.currentScreen = screenToOpen;
	this.screens[this.currentScreen].show();
}
HoneyPot.Game.prototype.stopPlay = function(){
	
 	this.showBonusWin();
}

HoneyPot.Game.prototype.showBonusWin = function(){
	var scatterWin = this.gameState.getWinScatterWins();
	if(scatterWin.length>0 && scatterWin.length >this.bonusWinCount){
		this.screens[this.currentScreen].showScatterWin(scatterWin[this.bonusWinCount]);
		this.bonusWinCount +=1;
	}else{
		this.sendCloseRequest();
	}
}

HoneyPot.Game.prototype.sendCloseRequest = function(){
	HoneyPot.logger.log('close Play');
	if(this.gameState.inFreeSpins){ 
		if(this.gameState.slotState.numFreeSpins <=0){
			this.gameState.inFreeSpins = false;
			this.screens[this.currentScreen].endFreeSpins();  
			this.gameUI.hideFreeSpins();
		}else{
			this.topBar.setwin(this.gameState.totalWin);
			this.gameUI.showFreeSpins(this.gameState.slotState.numFreeSpins-1);
			this.startPlay(); 
		}
	}else{  
		
		if(this.gameState.totalWin>0){
			this.gameUI.showTotalWin(this.gameState.totalWin);
		}else{
			this.canvas.ticker.maxFPS = this.gameMinFPS;
			this.connection.sendCloseRequest(this.closeResponse.bind(this));
		}
		
	}
}

HoneyPot.Game.prototype.winShown = function(){
	this.canvas.ticker.maxFPS = this.gameMinFPS;
	this.app.playSound('bgSound',true,0.3);
	this.connection.sendCloseRequest(this.closeResponse.bind(this));
}
HoneyPot.Game.prototype.closeResponse = function(){
	this.updateBalance();
	if(this.gameUI.inAutoPlay()){
		this.gameUI.nextAutoPlay();
		this.startPlay();
	}else{
		this.topBar.setwin(this.gameState.totalWin);
		this.topBar.gameStarted(false);
		this.gameUI.closeComplete();
	}
}
HoneyPot.Game.prototype.setStake = function(val){
	this.topBar.setStake(val);
}
HoneyPot.Game.prototype.startAutoPlay = function(){
	this.startPlay();
}
HoneyPot.Game.prototype.startPlay = function(){
	this.gameUI.hideTotalWin();
	this.bonusWinCount = 0;
	var that = this;
	this.canvas.ticker.maxFPS = this.gameMaxFPS;
	if(!this.gameState.inFreeSpins){
		this.topBar.setwin(0);
	}
	this.topBar.gameStarted(true);
	this.screens['reelScreen'].spin();
	this.connection.sendPlayRequest(this.playRequestReceived.bind(this));
}

HoneyPot.Game.prototype.playRequestReceived = function(data){
	this.updateBalance(this.gameState.totalWin);
	this.screens[this.currentScreen].stopSpin();
}
