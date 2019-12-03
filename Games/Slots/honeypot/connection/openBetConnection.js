HoneyPot.OpenBetConnection = function(config, callback){
	HoneyPot.Connection.call(this,config, callback);
	this.freeGameName = config.freeGameName;
	this.gameName = config.gameName;
	this.channel = config.channel;
	this.gameClass = config.gameClass;
	this.cookie = config.cookie;
	this.isGuest = config.isGuest;
	this.freePlay = config.freePlay;
	this.freeBets = config.freeBets;
	this.gameId = '';
	this.gameVersion = ''; 
	this.gameIdChannel = '';
	this.xmlMeta = "<?xml version='1.0' encoding='UTF-8'?>"+'<!DOCTYPE GameRequest SYSTEM "http://www.orbisuk.com/igf/dtd/GameRequest.dtd">';

	this.gameDetailsXML = '';
	this.playResponseCallBack;
	this.closeResponseCallBack;
	this.jackpostRequestCallBack;
	this.serverError = false;

	this.prevSlotState;
}

HoneyPot.OpenBetConnection.prototype = Object.create(HoneyPot.Connection.prototype);
HoneyPot.OpenBetConnection.prototype.constructor = HoneyPot.OpenBetConnection;

HoneyPot.OpenBetConnection.prototype.connectToServer = function(){
	this.initRequest();
}

HoneyPot.OpenBetConnection.prototype.initRequest = function(){
	var xml = this.xmlMeta;
	if(this.freePlay){
		this.gameDetailsXML = '<GameDetails class="' + this.gameClass + '" name="' + this.freeGameName + '" free_play="Yes" channel="' + this.channel + '" />';
		var customerString = '<Customer cookie="" is_guest="Yes" affiliate="" />';
		xml += '<GameRequest>';
    	xml += '<Header>' + this.gameDetailsXML + customerString+ '</Header>';
    	//xml += '<Header>' + this.getHeaderDetails()+ '</Header>';
    	xml += '<Init definition="Yes" payout="Yes" promotions="No" freebets="No" />';
    	xml += '</GameRequest>';
	}else{
		this.gameDetailsXML = '<GameDetails class="' + this.gameClass + '" name="' + this.gameName + '" free_play="No" channel="' + this.channel + '" />';
		var customerString = '<Customer cookie="'+this.cookie+'" is_guest="No" affiliate="" />';
		xml += '<GameRequest>';  
    	xml += '<Header>' + this.gameDetailsXML + customerString+ '</Header>';
    	//xml += '<Header>' + this.getHeaderDetails()+ '</Header>';
    	xml += '<Init definition="Yes" payout="Yes" promotions="No" freebets="No" />';
    	xml += '</GameRequest>';  
	}
	var that = this;
	this.sendToServer(xml, this.initResponse.bind(this), this.connectionError.bind(this));
}
HoneyPot.OpenBetConnection.prototype.initResponse = function(data){
	this.parseInitXML(data);
	this.connectionComplete();
}
HoneyPot.OpenBetConnection.prototype.parseInitXML = function(data){

	var initResponseXML = $(data);

    if (initResponseXML.find('Error').length){
        console.log("ERROR : = " +initResponseXML.find('Error'));
        this.processErrorMessageCallBack(initResponseXML.find('Error'));
        this.serverError = true;
    } else{
    	this.serverError = false;
    	this.parseFreebetsSummary(initResponseXML.find('FreebetSummary'));
    	this.parseHeader(initResponseXML.find('Header'));
    	var jackpotWin = this.parseJackpots(initResponseXML.find('Progressive'));
    	this.parseChainPlay(initResponseXML.find('ChainPlay'));
    	this.parseMasterState(initResponseXML.find('MasterState'));

    	var initObj = initResponseXML.find('Init');
	    this.gameState.playID = initObj.attr('id');
	    this.gameState.totalWin = HoneyPot.Currency.convertDecimalToPence(initObj.attr('win'))+jackpotWin;
	    this.gameState.playedPerLine = initObj.attr('stake_per_line');
	    this.gameState.stake = initObj.attr('stake') == '0.00' ? HoneyPot.Currency.convertDecimalToPence(initObj.attr('dflt_stake')) : HoneyPot.Currency.convertDecimalToPence(initObj.attr('stake'));
	    this.gameState.gip = initObj.attr('new') === "Yes" ? false : true;
	    this.gameState.minAnimTime = initObj.attr('min_anim_time');
	    this.gameState.maxAnimTime = initObj.attr('max_anim_time');
	    this.gameState.minStake = HoneyPot.Currency.convertDecimalToPence(initObj.attr('min_stake'));
	    this.gameState.maxStake = HoneyPot.Currency.convertDecimalToPence(initObj.attr('max_stake'));
	    this.gameState.dfltStake = HoneyPot.Currency.convertDecimalToPence(initObj.attr('dflt_stake'));
	    this.gameState.maxWinnings = HoneyPot.Currency.convertDecimalToPence(initObj.attr('max_winnings'));
    	
	    var increments = initObj.attr('stake_incr').split('|');
	    this.gameState.stakeIncr = [];
	    for(var i=0;i<increments.length;i++){
	    	this.gameState.stakeIncr.push(HoneyPot.Currency.convertDecimalToPence(increments[i]));
	    }

    }
}


HoneyPot.OpenBetConnection.prototype.parseFreebetsSummary = function(data){
	if(data.length > 0){
		this.account.freebetsSummary =  data.attr('available_balance');
	}
}
HoneyPot.OpenBetConnection.prototype.parseHeader = function(data){
	var header = data.find('GameId');
	this.gameId = header.attr('id');
	this.gameVersion = header.attr('ver');
	this.gameIdChannel = header.attr('channel');

	var accountDetails = data.find('Customer').find('Account');

	this.account.balance = HoneyPot.Currency.convertDecimalToPence(accountDetails.attr('balance'));
	this.account.held_funds = HoneyPot.Currency.convertDecimalToPence(accountDetails.attr('held_funds'));
	this.account.ccy_code = accountDetails.attr('ccy_code');
	this.account.adjusted_free_balance = HoneyPot.Currency.convertDecimalToPence(accountDetails.attr('adjusted_free_balance'));
	this.account.ccy_decimal_separator = accountDetails.attr('ccy_decimal_separator');
	this.account.ccy_thousand_separator = accountDetails.attr('ccy_thousand_separator');

	HoneyPot.Currency.thousandSeperator = accountDetails.attr('ccy_thousand_separator');
	HoneyPot.Currency.decimalSeperator = accountDetails.attr('ccy_decimal_separator');
	if(this.freePlay){
		HoneyPot.Currency.setCurrencySymbol('');
	}else{
		HoneyPot.Currency.setCurrencySymbol(accountDetails.attr('ccy_code'));
	}
}

HoneyPot.OpenBetConnection.prototype.parseMasterState = function(data){
	if(data.length > 0){
		this.gameState.masterState = {
			state: data.attr('state'),
	        stakes: data.attr('stakes'),
	        winnings: data.attr('winnings'),
	        nextStake: data.attr('next_stake'),
	        cashPot: data.attr('cash_pot'),
	        startGameState: data.attr('start_game_state'),
	        chainStake: data.attr('chain_stake'),
	        currentWinnings: data.attr('current_winnings'),
	        openStack:this.parseMasterStateStack(data.find('OpenStack')),
	        activeStack: this.parseMasterStateStack(data.find('ActiveStack'))
        	
		};
	}
}

HoneyPot.OpenBetConnection.prototype.parseMasterStateStack = function(data){
	var stack = null;
	if(data.length > 0){
		stack = [];
		for(var i=0;i<data.length;i++){
			//if(data[i].length >0){
				var csObj = $(data[i]).find('ChainState');
				stack.push({
					cgId: csObj.attr('cg_id'),
			        gameClass: csObj.attr('class'),
			        name: csObj.attr('name'),
			        stackOrder: csObj.attr('stack_order'),
			        startStake: csObj.attr('start_stake'),
			        id: csObj.attr('id'),
			        interaction: csObj.attr('interaction'),
			        gameState: csObj.attr('game_state'),
			        stakeType: csObj.attr('stake_type')
				});
			//}
		}
	}
	return stack;
}

HoneyPot.OpenBetConnection.prototype.parseChainPlay = function(data){
	if(data.length > 0){
	    this.gameState.chainPlay = {
	        gameId: data.attr('game_id'),
	        gameClass: data.attr('class'),
	        gameName: data.attr('name'),
	        gameStake: data.attr('stake')
	    };
	}
}
HoneyPot.OpenBetConnection.prototype.parseJackpots = function(data){
	var winAmount = 0;
	if(data.length > 0){
		for(var i=0;i<data.length;i++){
			var pjObj = $(data[i]);
			var progressive = new HoneyPot.ProgressiveJackpot();
			progressive.id = pjObj.attr('id');
			progressive.stake = pjObj.attr('stake');
			progressive.state = pjObj.attr('state');
			progressive.jackpot = pjObj.attr('jackpot');
			progressive.winnings = pjObj.attr('winnings');
			progressive.num_jackpots = pjObj.attr('balnum_jackpotsance');
			progressive.name = pjObj.attr('name');
			progressive.customer_stake = pjObj.attr('customer_stake');
			progressive.disp_order = pjObj.attr('disp_order');

			if(progressive.state == 'WIN'){
				winAmount = HoneyPot.Currency.convertDecimalToPence(progressive.winnings);
			}

			if(this.gameState.getProgressiveByID(progressive.id)){
				this.gameState.updateProgressive(progressive);
			}else{
				this.gameState.addProgressive(progressive);
			}
		}
	}
	return winAmount;
}

HoneyPot.OpenBetConnection.prototype.getHeaderDetails = function(){
	var freePlayStr = "No";
	var isGuest = "No";
	var gameName = this.gameName;
	var cookie = this.cookie;
	if(this.freePlay){
		freePlayStr = "Yes";
		isGuest = "Yes"
		gameName = this.freeGameName; 
		cookie = '';
	}

	var gameString = '<GameDetails class="' + this.gameClass + '" name="' + gameName + '" free_play="'+freePlayStr+'" channel="' + this.channel + '" />';
	var customerString;
	if(this.freePlay){
		customerString = '<Customer cookie="'+cookie+'" balance="'+HoneyPot.Currency.convertPenceToDecimalString(this.account.balance)+'" is_guest="'+isGuest+'" affiliate="" />';
	}else{
		customerString = '<Customer cookie="'+cookie+'" is_guest="'+isGuest+'" affiliate="" />';

	}
	return gameString + customerString;
}

HoneyPot.OpenBetConnection.prototype.sendJackpotRequest = function(callback){
	this.jackpostRequestCallBack = callback;
	var xml = this.xmlMeta;
	xml += '<GameRequest>';
    xml += '<Header>' + this.getHeaderDetails()+ '</Header>';
    xml += '<Update>';
    xml += this.getProgressiveJackpotXML();
    xml += '</Update>';
    xml += '</GameRequest>';

    this.sendToServer(xml, this.jackpotResponse.bind(this), this.connectionError.bind(this));
}

HoneyPot.OpenBetConnection.prototype.jackpotResponse = function(data){
	var playResponseXML = $(data);
	if (playResponseXML.find('Error').length){
        console.log("ERROR : = " +playResponseXML.find('Error'));
        this.processErrorMessageCallBack(playResponseXML.find('Error'));

    } else{
    	this.parseJackpots(playResponseXML.find('Progressive'));
    }
	this.jackpostRequestCallBack();
}

HoneyPot.OpenBetConnection.prototype.getProgressiveJackpotXML = function(){
	var xml = '';

	if(this.gameState.progressiveJackpots.length > -1){
		for(var i=0;i<this.gameState.progressiveJackpots.length;i++){
			var prog = this.gameState.progressiveJackpots[i];
			xml += '<Progressive name="'+prog.name+'" state="'+prog.state+'" jackpot="'+prog.jackpot+'" />';
		}
	}
	return xml;
}


HoneyPot.OpenBetConnection.prototype.sendPlayRequest = function(callback){
	this.playResponseCallBack = callback;
	var xml = this.xmlMeta;
	var action = 'spinReels';
	if(this.gameState.inFreeSpins){
		action = 'freeSpinReels';
	}
	//if(this.freePlay){
		this.gameDetailsXML = '<GameDetails class="' + this.gameClass + '" name="' + this.freeGameName + '" free_play="Yes" channel="' + this.channel + '" />';
		var customerString = '<Customer cookie="" balance="'+HoneyPot.Currency.convertPenceToDecimalString(this.account.balance)+'" is_guest="Yes" affiliate="" />';
		xml += '<GameRequest>';
    	xml += '<Header>' + this.getHeaderDetails()+ '</Header>';
    	//xml += '<Header>' + this.getHeaderDetails()+ '</Header>';
    	xml += '<Play stake="'+HoneyPot.Currency.convertPenceToDecimalString(this.gameState.stake*this.gameState.slotDef.numWinLines)+'" stake_per_line="'+HoneyPot.Currency.convertPenceToDecimalString(this.gameState.stake)+'" freebets="Yes">';
        xml += '<SlotState action="'+action+'" sel_win_lines="'+this.gameState.slotDef.winlineString+'" reverse_payout="No" delim="|" />';
    	if(this.freePlay && this.gameState.inFreeSpins){
    		if(this.prevSlotState){
	    		var regSlotState = new RegExp('slotstate', 'gi');
		        var prevSlotState = this.prevSlotState.replace(regSlotState, 'SlotStateDetails');

		        var regSymbolrow = new RegExp('slotsymbolrow', 'gi');
		        var regScatterWin = new RegExp('slotscatterwin', 'gi');
		        var regBonusWin = new RegExp('slotbonuswin', 'gi');

		        prevSlotState = prevSlotState.replace(regSymbolrow, 'SlotSymbolRow');
		        prevSlotState = prevSlotState.replace(regScatterWin, 'SlotScatterWin');
		        prevSlotState = prevSlotState.replace(regBonusWin, 'SlotBonusWin');
		        xml +=prevSlotState;
		    }
    	}
        xml += this.getProgressiveJackpotXML();
    	xml += '</Play>';
    	xml += '</GameRequest>';
	//}else{

	//}
	var that = this;
	//this.sendToServer(xml, function(data){that.playResponse(data);}, function(data){that.connectionError(data);});
	this.sendToServer(xml, this.playResponse.bind(this), this.connectionError.bind(this));
}

HoneyPot.OpenBetConnection.prototype.playResponse = function(data){
	this.parsePlayXML(data);
	this.playResponseCallBack();
}

HoneyPot.OpenBetConnection.prototype.parsePlayXML = function(data){
	var playResponseXML = $(data);
	if (playResponseXML.find('Error').length){
        console.log("ERROR : = " +playResponseXML.find('Error'));
        this.processErrorMessageCallBack(playResponseXML.find('Error'));
        this.serverError = true;
    } else{
    	this.serverError = false;
    	this.parseFreebetsSummary(playResponseXML.find('FreebetSummary'));
    	this.parseHeader(playResponseXML.find('Header'));
    	var jackpotWin = this.parseJackpots(playResponseXML.find('Progressive'));
    	this.parseChainPlay(playResponseXML.find('ChainPlay'));
    	this.parseMasterState(playResponseXML.find('MasterState'));

    	var initObj = playResponseXML.find('Play');
	    this.gameState.playID = initObj.attr('id');
	    this.gameState.totalWin = HoneyPot.Currency.convertDecimalToPence(initObj.attr('win'))+jackpotWin;
	    //this.gameState.stakePerLine = HoneyPot.Currency.convertDecimalToPence(initObj.attr('stake_per_line'));
	    //this.gameState.stake = HoneyPot.Currency.convertDecimalToPence(initObj.attr('stake'));

    }
}
HoneyPot.OpenBetConnection.prototype.closeResponse = function(data){
	//this.parsePlayXML(data);
	//this.playResponseCallBack();
	this.closeResponseCallBack();
}
HoneyPot.OpenBetConnection.prototype.sendCloseRequest = function(cb)
{
	this.closeResponseCallBack = cb;
	if(this.serverError){
		this.closeResponseCallBack();
	}else{
    	var xml = this.xmlMeta + '<GameRequest><Header>' + this.getHeaderDetails()+ '</Header><Close/></GameRequest>';
    	this.sendToServer(xml, this.closeResponse.bind(this), this.connectionError.bind(this));
    }
};


