HoneyPot.GDMConnection = function(config, callback){
	HoneyPot.Connection.call(this,config, callback);
	this.playResponseCallBack;
	this.gdmRef = window.parent;
	this.gameName = config.gameName;
	this.cookie = config.cookie;
	this.isGuest = config.isGuest;
	this.freePlay = false;//config.freePlay; 
	this.freeBets = config.freeBets;
	this.gameVersion = '';
	this.channel = config.channel;

}
HoneyPot.GDMConnection.prototype = Object.create(HoneyPot.Connection.prototype);
HoneyPot.GDMConnection.prototype.constructor = HoneyPot.GDMConnection;

HoneyPot.GDMConnection.prototype.connectToServer = function(){
	this.initRequest();
}

HoneyPot.GDMConnection.prototype.initRequest = function(){
    var msgToGDM = '&USMODE='+this.channel+'&REC=0&GN='+this.gameName+'&MSGID=INIT&REC=1&';
    this.gdmRef.sendMsgToServer(msgToGDM);
}

HoneyPot.GDMConnection.prototype.changeOrientation = function(orientation){ 
	
}
HoneyPot.GDMConnection.prototype.processServerMsg = function(message){ 

	var msgData = message.split('&');
	var responseObj = {};
	for(var i=0; i<msgData.length;i++){
		if(msgData[i]){
			var item = msgData[i].split('=');
			responseObj[item[0]] = item[1];
		}
	}

	switch(responseObj['MSGID']){
		case 'ERROR':
			this.processError(responseObj);
			break;
		case 'INIT':
			this.initResponse(responseObj);
			break;
		case 'BET':
			this.playResponse(responseObj);
			break;
	}

}

HoneyPot.GDMConnection.prototype.processError = function(data){
	this.gdmRef.delegatedErrorHandling(data['EID'], HoneyPot.LocaleManager.getText(data['EID']), true);
}


HoneyPot.GDMConnection.prototype.sendPlayRequest = function(callback){
	this.playResponseCallBack = callback;
	//this.gameState
	var betStr = '';
	for(var i=0;i<this.gameState.players.length; i++){
    	if(this.gameState.players[i].getStake() >0){
    		if(betStr!=''){
    			betStr += '|';
    		}
    		betStr += (this.gameState.players[i].seat+1)+'~'+HoneyPot.Currency.convertDecimalToPence(this.gameState.players[i].getStake());
    	}
    }
    HoneyPot.logger.log(betStr,1);
	var msg = '&GN='+this.gameName+'&MSGID=BET&BA='+betStr+'&';

	this.gdmRef.sendMsgToServer(msg);
}

HoneyPot.GDMConnection.prototype.playResponse = function(data){
	this.parseHeader(data);

	this.gameState.totalWin = data['TW'];
	var gsd = data['GSD'].split(';');
	var cardsData = gsd[1].split('~')[1];

	this.playResponseCallBack();

}

HoneyPot.GDMConnection.prototype.initResponse = function(data){

	this.parseHeader(data);

	var currency = data['CUR'].split('|');
	this.account.ccy_code = currency[0].split(':')[1];
	this.account.adjusted_free_balance =
	this.account.ccy_decimal_separator = currency[2];
	this.account.ccy_thousand_separator = currency[1];
	HoneyPot.Currency.thousandSeperator = currency[1];
	HoneyPot.Currency.decimalSeperator = currency[2];
	HoneyPot.Currency.currencyASCII = currency[3];
	HoneyPot.Currency.currencyPos = currency[4];
	HoneyPot.Currency.fracCurrencySymbols = currency[5];
	HoneyPot.Currency.fracCurrencyPos = currency[6];

	if(this.freePlay){
		HoneyPot.Currency.setCurrencySymbol('');
	}else{
		HoneyPot.Currency.setCurrencySymbol(this.account.ccy_code);
	}


	this.gameState.playID = 0;
    this.gameState.totalWin = 0;
    this.gameState.playedPerLine = 0;
    this.gameState.stake = data['BDD'];
    this.gameState.gip = false;
    this.gameState.minAnimTime = 1;
    this.gameState.maxAnimTime = 10000;
    var betLimits = data['LIM'].split('|');
    this.gameState.minStake = betLimits[0];
    this.gameState.maxStake = betLimits[1];
    this.gameState.minSideBet = betLimits[2];
    this.gameState.maxSideBet = betLimits[3];
    this.gameState.dfltStake = data['BDD'];
    this.gameState.maxWinnings = HoneyPot.Currency.convertDecimalToPence(1000000000);
	
    var increments = data['BD'].split('|');
    this.gameState.stakeIncr = [];
    for(var i=0;i<increments.length;i++){
    	this.gameState.stakeIncr.push(increments[i]);
    }

    if(data['GSD']){
    	this.playResponse(data);
    }

    this.connectionComplete();
}

HoneyPot.GDMConnection.prototype.parseHeader = function(data){
	this.gameId = 0
	this.gameVersion = data['VER'];

	this.account.balance = data['B'];	
	this.account.held_funds = data['B'];	
	this.cookie = data['SID'];	

}

HoneyPot.GDMConnection.prototype.apiExt = function(name, val){
	
}

