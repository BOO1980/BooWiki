HoneyPot.SlotDef = function(){
	this.numReels;
	this.viewSize;
	this.numWinLines;
	this.delim;
	this.symbols;
	this.wildCards;
	this.wildFactor;
	this.useStakeOnly;
	this.baseToTotalStakeMult;
	this.winlineString;

	this.winLines =[];
	this.reelSets = [];
	this.slotBonus = [];
	this.symbolDefs = [];
	
}

HoneyPot.SlotDef.prototype.getReelSetByID = function(id){
	var rs;
	for(var i=0;i<this.reelSets.length;i++){
		if(this.reelSets[i].index === id){
			rs = this.reelSets[i].reels;
			break;
		}
	}
	return rs;
}

HoneyPot.SlotDef.prototype.getSlotBonusByID = function(id){
	var bonus;
	for(var i=0;i<this.slotBonus.length;i++){
		if(this.slotBonus[i].bonusId === id){
			bonus = this.slotBonus[i];
			break;
		}
	}
	return bonus;
}