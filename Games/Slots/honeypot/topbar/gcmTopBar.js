HoneyPot.GCMTopBar = function(data,connection,cb){
	HoneyPot.TopBar.call(this,data,connection,cb);
	this.path = data.path;
	this.options = ["ABOUT", "PAYTABLE", "MUTE"];
	this.gcmReadyCheck;
	this.configReadyCheck;
	this.gcm;
	this.mute;
	this.topbarLoadedCallback = cb;
    this.revealGameCallback;
	this.connectionData = connection;
    this.setMuteCallBack;
    this.type = 'gcm';
    this.resumeCallback;

}

HoneyPot.GCMTopBar.prototype = Object.create(HoneyPot.TopBar.prototype);
HoneyPot.GCMTopBar.prototype.constructor = HoneyPot.GCMTopBar;

HoneyPot.GCMTopBar.prototype.init = function(){
	this.gcmReadyCheck = false;
	this.configReadyCheck = false;

	$.getScript(this.path)
    .done(this.gcmLoaded.bind(this))
    .fail(function (jqxhr, settings, exception){
		    throw new Error('Error loading gcmBridge: ' + exception);
	    }
    );

}


HoneyPot.GCMTopBar.prototype.gcmLoaded = function(){
	this.gcmBridge = com.openbet.gcmBridge;
	this.createTopBar();
}

HoneyPot.GCMTopBar.prototype.createTopBar = function()
{
    var queryString = $.trim(decodeURIComponent(window.location.search));

    var that = this;
    if(!queryString || queryString === "") {
        this.gcmBridge.init(document.body, this.createQueryString(), that);
    }else{
        this.gcmBridge.init(document.body, queryString, that);
    }
};


HoneyPot.GCMTopBar.prototype.gameStarted = function(val){
	if(val){
		this.gcm.gameAnimationStart(this.gameStartedCallback.bind(this));    
	}else{
		this.gcm.gameAnimationComplete(this.gameCompletedCallback.bind(this));    
	}
}


HoneyPot.GCMTopBar.prototype.gameStartedCallback = function(){

}
HoneyPot.GCMTopBar.prototype.gameCompletedCallback = function(){

}

HoneyPot.GCMTopBar.prototype.setupAccount = function(account){

	var accountInfo = {
        ccy_code : account.ccy_code,
        ccy_decimal_separator : account.ccy_decimal_separator,
        ccy_thousand_separator : account.ccy_thousand_separator
    };

    var balanceInfo = {
    	CASH :{
                amount : HoneyPot.Currency.convertPenceToDecimal(account.balance)
            },
         FREEBET :{
                amount : HoneyPot.Currency.convertPenceToDecimal(account.freebetsSummary)
            }
        }
	this.gcm.accountInit(accountInfo, balanceInfo);
	
}

HoneyPot.GCMTopBar.prototype.updateProgressBar = function(prog){
	if(prog < 100){
		this.gcm.loadProgressUpdate(prog);
	}
}

HoneyPot.GCMTopBar.prototype.gcmReady = function(gcm){
	this.gcm = gcm;

	if (this.options && this.gcm){
        for (var i = 0; i < this.options.length; i++){
            if(this.options[i] == 'MUTE'){
                this.mute = this.gcm.regOption(this.options[i]);
            }else{
                this.gcm.regOption(this.options[i]);
            }
        }
    }
    this.gcmReadyCheck = true;
    this.gcmComplete();
}

HoneyPot.GCMTopBar.prototype.configReady = function(){
	this.configReadyCheck = true;
    this.gcmComplete();
}

HoneyPot.GCMTopBar.prototype.gcmComplete = function (){
    if (this.gcmReadyCheck==false || this.configReadyCheck==false){
        return;
    }

    if(this.gcmBridge.isDesktop && this.gcmBridge.isDesktop()){
        this.desktopMode = true;
    }

    var configObj = this.gcm.getConfig();

    if (configObj.channel){
        this.connectionData.channel = configObj.channel;
    }

    if (configObj.gameClass){
        this.connectionData.gameClass = configObj.gameClass;
    }

    if (configObj.gameServerUrl){
        this.connectionData.connectionURL = configObj.gameServerUrl;
    }

    if (configObj.playMode){
        this.connectionData.playMode = configObj.playMode;

        if (this.connectionData.playMode === "demo"){
            this.connectionData.freePlay = true;
        }
        else if (this.connectionData.playMode == "real"){
            this.connectionData.freePlay = false;
        }
    }
   
    this.topbarLoadedCallback();
};

HoneyPot.GCMTopBar.prototype.updateBalance = function(account,winVal){

	var balanceInfo = {
    	CASH :{
                amount : HoneyPot.Currency.convertPenceToDecimal(account.balance)
            },
         FREEBET :{
                amount : HoneyPot.Currency.convertPenceToDecimal(account.freebetsSummary)
            }
        }
	this.gcm.balancesUpdate(balanceInfo,winVal)
}
HoneyPot.GCMTopBar.prototype.setMute = function(val){  
    this.gcm.optionHasChanged('MUTE', 'GAME', !val);
}
HoneyPot.GCMTopBar.prototype.setwin = function(val){
	this.gcm.paidUpdate(HoneyPot.Currency.convertPenceToDecimal(val));
        
}
HoneyPot.GCMTopBar.prototype.setStake = function(val){
	this.gcm.stakeUpdate(HoneyPot.Currency.convertPenceToDecimal(val));
}
HoneyPot.GCMTopBar.prototype.gameReady = function(cb){
    this.revealGameCallback = cb;
	this.gcm.gameReady();
}
HoneyPot.GCMTopBar.prototype.gameRevealed = function(){
    console.log('gamerevealed');  
    this.revealGameCallback();
}
HoneyPot.GCMTopBar.prototype.optionHasChanged = function(option, val){
    switch (option){
        case 'MUTE':
            this.setMuteCallBack(val);
            break;
        case 'ABOUT':
            
            break;
        case 'PAYTABLE':
            this.showHelpCallBack(val);
            break;
        default:
            throw Error('unknown option [' + option + '] changed by gcm ');
    }

}



HoneyPot.GCMTopBar.prototype.showWarningMessage = function(txt,cb){
    if(txt == 'GIP_MESSAGE'){
        this.resumeCallback = cb;
        this.gcm.handleError('RECOVERABLE_ERROR', 'INFO', 'GameInProgress', 'You are part way through a game. Please click to resume.');
    }else{
        //this.resumeCallback = cb;
        var error = new XMLSerializer().serializeToString(txt[0])
        var errorInfo = com.openbet.gcm.xmlutil.getErrorInfoFromFOGXml(error);
        this.gcm.handleServerError(errorInfo);

    }
}
HoneyPot.GCMTopBar.prototype.showHelp = function(val){
    this.gcm.optionHasChanged('PAYTABLE', 'GAME', val);
}
HoneyPot.GCMTopBar.prototype.resume = function(e){
    if(this.resumeCallback){
        this.resumeCallback();
    }
}
HoneyPot.GCMTopBar.prototype.setShowHelpCallBack = function(cb){
    this.showHelpCallBack = cb;
}
HoneyPot.GCMTopBar.prototype.setSetMuteCallBack = function(cb){
    this.setMuteCallBack = cb;
}
HoneyPot.GCMTopBar.prototype.balancesHasChanged = function(){

}




