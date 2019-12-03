HoneyPot.OpenBetBJConnection = function(config, callback){
	HoneyPot.OpenBetConnection.call(this,config, callback);
}

HoneyPot.OpenBetBJConnection.prototype = Object.create(HoneyPot.OpenBetConnection.prototype);
HoneyPot.OpenBetBJConnection.prototype.constructor = HoneyPot.OpenBetBJConnection;

/*HoneyPot.OpenBetBJConnection.prototype.setupGameState = function(){
    this.gameState = new HoneyPot.BlackJackGameState();
}*/
HoneyPot.OpenBetBJConnection.prototype.parsePlayXML = function(data){
	var playResponseXML = $(data);
	if (playResponseXML.find('Error').length){
        HoneyPot.logger.log("ERROR : = " +playResponseXML.find('Error'));
    } else{
    	this.parseHeader(playResponseXML.find('Header'));

    	var initObj = playResponseXML.find('Play');
	    this.gameState.playID = initObj.attr('id');
	    this.gameState.totalWin = HoneyPot.Currency.convertDecimalToPence(initObj.attr('win'));
	    this.gameState.stakePerLine = HoneyPot.Currency.convertDecimalToPence(initObj.attr('stake_per_line'));
	    this.gameState.stake = HoneyPot.Currency.convertDecimalToPence(initObj.attr('stake'));

	    this.parseBlackJackState(playResponseXML.find('BlackjackState'));
    }
}
HoneyPot.OpenBetBJConnection.prototype.parseBlackJackState = function(callback){

	this.gameState.currentPlayer = data.attr('current_player');
	this.gameState.totalPlayers = data.attr('total_players');
	this.gameState.insuranceOffers = data.attr('insurance_offered');
	this.gameState.options = data.attr('options');

	var playerStateData = data.find('SlotSymbolRow');

	
}
HoneyPot.OpenBetBJConnection.prototype.sendPlayRequest = function(callback){
	this.playResponseCallBack = callback;
	var xml = this.xmlMeta;
	if(this.freePlay){

	    var players = 0
	    for(var i=0;i<this.gameState.players.length; i++){
	    	if(this.gameState.players[i].getStake() >0){
	    		HoneyPot.logger.log('----'+this.gameState.players[i].seat)
	    		players += 1;
	    	}
        }
		
	    HoneyPot.logger.log('players '+this.gameState.players.length+' == '+this.gameState.getPlayerStake());

		this.gameDetailsXML = '<GameDetails class="' + this.gameClass + '" name="' + this.freeGameName + '" free_play="Yes" channel="' + this.channel + '" />';
		var customerString = '<Customer cookie="" balance="'+HoneyPot.Currency.convertPenceToDecimal(this.account.balance)+'" is_guest="Yes" affiliate="" />';
    	xml += '<GameRequest>';
    	xml += '<header>' + this.gameDetailsXML + customerString+ '</header>';
    	xml += '<Play sequence_no="null" stake="'+HoneyPot.Currency.convertPenceToDecimal(this.gameState.stake)+'" promotions="Yes" freebets="Yes">';
        xml += '<Blackjack action="Deal" num_players="'+players+'">';
		for(var i=0;i<this.gameState.players.length; i++){
        	if(this.gameState.players[i].getStake() >0){
        		xml += '<Player id="'+(i+1)+'" stake="'+this.gameState.players[i].getStake()+'" insurance="No" seat="'+this.gameState.players[i].seat+'" />';
        	}
        }
        xml += '</Blackjack>';
        xml += '</Play>';
        xml += '</GameRequest>';
	}else{

	}
	var that = this;
	this.sendToServer(xml, function(data){that.playResponse(data);}, function(data){that.connectionError(data);});
}

