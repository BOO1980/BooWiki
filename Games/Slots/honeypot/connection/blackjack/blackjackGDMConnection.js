HoneyPot.BlackJackGDMConnection = function(config, callback){
	HoneyPot.GDMConnection.call(this,config, callback); 
}
HoneyPot.BlackJackGDMConnection.prototype = Object.create(HoneyPot.GDMConnection.prototype);
HoneyPot.BlackJackGDMConnection.prototype.constructor = HoneyPot.BlackJackGDMConnection;

HoneyPot.BlackJackGDMConnection.prototype.updateCardDataToHand = function(pid, hid, data){
	var player = this.gameState.getPlayer(pid);
	var hand = player.getHandByID(hid);
	var carddata = data.split("~")[1];
	carddata = carddata.split('|');//[0];
	hand.cardData = carddata[0].split(',');
	if(carddata.length > 3){
		hand.cardActions = [];
		for(var i=2;i<carddata.length-1;i++){
			hand.cardActions.push(carddata[i]);
		}
	}
}
HoneyPot.BlackJackGDMConnection.prototype.playResponse = function(data){
	this.parseHeader(data);
	//this.connectionComplete();

	this.gameState.totalWin = data['TW'];
	var gsd = data['GSD'].split(';');
	var cardsData;
	var playersAction;
	this.gameState.tableWins = data['WINS'];
	this.gameState.hasDealerCards = false;
	


	for(var j = 0; j < gsd.length; j++){
		if(gsd[j].indexOf("CURRENT_PLAYER") != -1){
			var id = gsd[j].split('~')[1];
			var hand = 0;
			if(String(id).length>1){
				id = id.slice(1,2);
				hand = 1;
			}
			this.gameState.gipCurrentPlayer = id; //gsd[j].split('~')[1];
			this.gameState.gipCurrentHand = hand;
		}
		// CHECK IF THE NODE WITH ALL CARDS, DEALER AND PLAYERS
		if(gsd[j].indexOf("CARDS") != -1 && gsd[j].indexOf("DEALER_CARDS") == -1 && gsd[j].indexOf("PLAYER") == -1){
			cardsData = gsd[j].split("~")[1];
		}else if(gsd[j].indexOf("INT~HIT") != -1 || gsd[j].indexOf("INT~SPLIT") != -1 || gsd[j].indexOf("INT~STAND") != -1 || gsd[j].indexOf("INT~DOUBLE") != -1 || gsd[j].indexOf("INS~VAL") != -1){
			playersAction = gsd[j];
		}

		if(gsd[j].indexOf("PLAYER1_CARDS_HAND1") != -1){
			this.updateCardDataToHand(0,0,gsd[j]);
		}else if(gsd[j].indexOf("PLAYER1_CARDS_HAND2") != -1){
			this.updateCardDataToHand(0,1,gsd[j]);
		}else if(gsd[j].indexOf("PLAYER2_CARDS_HAND1") != -1){
			this.updateCardDataToHand(1,0,gsd[j]);
		}else if(gsd[j].indexOf("PLAYER2_CARDS_HAND2") != -1){
			this.updateCardDataToHand(1,1,gsd[j]);
		}else if(gsd[j].indexOf("PLAYER3_CARDS_HAND1") != -1){
			this.updateCardDataToHand(2,0,gsd[j]);
		}else if(gsd[j].indexOf("PLAYER3_CARDS_HAND2") != -1){
			this.updateCardDataToHand(2,1,gsd[j]);
		}else if(gsd[j].indexOf("DEALER_CARDS") != -1){
			var hand = this.gameState.dealer.getHandByID(0);
			var carddata = gsd[j].split("~")[1];
			carddata = carddata.split('|')[0];
			hand.cardData = carddata.split(',');
		}

	}

	var playerCards = cardsData.split(',');

	var players = [];
	for(var i=0;i<playerCards.length;i++){
	 	var player = playerCards[i].split(':');
	 	var currentPlayer;

	 	if(players[player[0]]){
	 	}else{
	 		players[player[0]] = [];
	 	}
	 	players[player[0]].push(playerCards[i]);
	}

	if(playersAction && (playersAction === 'INT~HIT' || playersAction === 'INT~STAND' || playersAction === 'INT~DOUBLE' || playersAction === 'INT~INSURANCE' || playersAction === 'INT~SPLIT')){
		var playerHit = 0;
		for(var i=0;i<players.length;i++){
			if(i == 0){
				if(this.gameState.dealer.cardData.length !=  players[i].length){
					this.gameState.dealer.cardData = players[i]; 
					this.gameState.hasDealerCards = true;
				}
			}else{

			}
		}

	}
	else{
		for(var i=0;i<players.length;i++){
			if(i==0){
				this.gameState.dealer.cardData = players[i];
				if(players[i].length > 1){
					this.gameState.hasDealerCards = true;
				}
			}else{
				//this.gameState.getPlayer((i-1)).cardData = players[i];
			}
		}
	}

	this.playResponseCallBack();

}

HoneyPot.BlackJackGDMConnection.prototype.initResponse = function(data){

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
    this.gameState.stake = data['BDD'];// == '0.00' ? data['BDD'] : data['BDD'];
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
    	this.gameState.gip = true;
    	this.gameState.gipData = data;
    	//this.playResponse(data);
    }else{
    	this.gameState.gip = false;
    }

    this.connectionComplete();
}

HoneyPot.BlackJackGDMConnection.prototype.sendPlayRequest = function(callback){
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
	var msg = '&GN='+this.gameName+'&PID=SlotsEnthusiast&MSGID=BET&BA='+betStr+'&';

	this.gdmRef.sendMsgToServer(msg);
}

HoneyPot.BlackJackGDMConnection.prototype.processGip= function(data,cb){
	this.playResponseCallBack = cb;
	var stakeData = data['GSTATUS'].split(',');
	for(var i=0;i<stakeData.length; i++){
		var playerStake = stakeData[i].split(':');
		var id = playerStake[0];
		var hand = 0;
		if(String(id).length >1){
			id = id.slice(1,2);
			hand = 1;
		}

		var player = this.gameState.getPlayer(Number(id)-1);
		player.currentHand = hand;
		player.addBet(HoneyPot.Currency.convertPenceToDecimal(playerStake[2]));
		player.insuranceStake = playerStake[3];
		
		player.currentHand = 0;

	}
	this.playResponse(data);
}

HoneyPot.BlackJackGDMConnection.prototype.sendInsuranceYesRequest = function(callback){
	this.playResponseCallBack = callback;
	var msg = '&GN='+this.gameName+'&GSD=INT~INSURANCE;INS_VAL~1&PID=SlotsEnthusiast&MSGID=BET&';
	this.gdmRef.sendMsgToServer(msg);
}

HoneyPot.BlackJackGDMConnection.prototype.sendInsuranceNoRequest = function(callback){
	this.playResponseCallBack = callback;
	var msg = '&GN='+this.gameName+'&GSD=INT~INSURANCE;INS_VAL~0&PID=SlotsEnthusiast&MSGID=BET&';
	this.gdmRef.sendMsgToServer(msg);
}

HoneyPot.BlackJackGDMConnection.prototype.sendSplitRequest = function(callback){
	this.playResponseCallBack = callback;
	var msg = '&GN='+this.gameName+'&PID=SlotsEnthusiast&MSGID=BET&GSD=INT~SPLIT&';
	this.gdmRef.sendMsgToServer(msg);
}
HoneyPot.BlackJackGDMConnection.prototype.sendHitRequest = function(callback){
	this.playResponseCallBack = callback;
	var msg = '&GN='+this.gameName+'&PID=SlotsEnthusiast&MSGID=BET&GSD=INT~HIT&';
	this.gdmRef.sendMsgToServer(msg);
}

HoneyPot.BlackJackGDMConnection.prototype.sendStandRequest = function(callback){
	this.playResponseCallBack = callback;
	var msg = '&GN='+this.gameName+'&PID=SlotsEnthusiast&MSGID=BET&GSD=INT~STAND&';
	this.gdmRef.sendMsgToServer(msg);
}

HoneyPot.BlackJackGDMConnection.prototype.sendDoubleRequest = function(callback){
	this.playResponseCallBack = callback;
	var msg = '&GN='+this.gameName+'&PID=SlotsEnthusiast&MSGID=BET&GSD=INT~DOUBLE&';
	this.gdmRef.sendMsgToServer(msg);
}