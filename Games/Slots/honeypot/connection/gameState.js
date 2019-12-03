HoneyPot.GameState = function(){
	this.progressiveJackpots = [];
	this.chainPlay = null;
	this.masterState = null;
	this.playID;
	this.totalWin;
	this.playedStake;
	this.stakePerLine;
	this.stake;
	this.gip;
	this.gipData;
	this.minAnimTime;
	this.maxAnimTime;
	this.minStake;
	this.maxStake; 
	this.minSideBet;
	this.maxSideBet;
	this.dfltStake;
	this.maxWinnings;
	this.stakeIncr;
	this.slotDef;
	this.slotPayouts = [];
	this.slotState;  
	this.accumulatorState;
	this.inFreeSpins = false;
}

HoneyPot.GameState.prototype.getNumOfWinlines = function(){
	return parseInt(this.slotDef.numWinLines);
}
HoneyPot.GameState.prototype.getWinlineMask = function(id){
	for(var i=0;i<this.slotPayouts.length;i++){
		if(id ==this.slotPayouts[i].index){
			return this.slotPayouts[i].bitmaskLine;
		}
	}
	return null;
}

HoneyPot.GameState.prototype.getWinScatterWins = function(){
	return this.slotState.slotScatterWins;
}

HoneyPot.GameState.prototype.getWinlineSymbols = function(){
	var rs = this.slotDef.getReelSetByID(this.slotState.reelSetIndex);
	var stopPos = this.slotState.stop;
	var symbols = [];

	for(var i=0;i<stopPos.length;i++){
		var symbolLine = [];
		for(var j=0;j<this.slotDef.viewSize;j++){

			var symbolId;
			if((parseInt(stopPos[i])+j) < rs[i].length){
				symbolId = rs[i][parseInt(stopPos[i])+j];
			}else{
				symbolId = rs[i][(parseInt(stopPos[i])+j)-rs[i].length];
			}
			symbolLine.push(symbolId);
		}

		symbols.push(symbolLine);
	}

	return symbols;
}


HoneyPot.GameState.prototype.updateProgressive = function(data){
	for(var i=0;i<this.progressiveJackpots.length;i++){
		if(data.id == this.progressiveJackpots[i].id){
			this.progressiveJackpots[i] = data;
			break;
		}
	}
}
HoneyPot.GameState.prototype.getProgressiveByID = function(id){
	var prog;
	for(var i=0;i<this.progressiveJackpots.length;i++){
		if(id == this.progressiveJackpots[i].id){
			prog = this.progressiveJackpots[i];
			break;
		}
	}
	return prog;
}
HoneyPot.GameState.prototype.addProgressive = function(data){
	this.progressiveJackpots.push(data);
}

HoneyPot.GameState.prototype.getSlotDef = function(){
	return this.slotDef;
}

HoneyPot.GameState.prototype.getSlotState = function(){
	return this.slotState;
}
HoneyPot.GameState.prototype.getProgressiveById = function(id){
	var jackpot = null;
	for(var i=0;i<this.progressiveJackpots.length;i++){
		if(this.progressiveJackpots[i].id === id){
			jackpot = this.progressiveJackpots[i];
			break;
		}
	}

	return jackpot;
}

