HoneyPot.SlotBonus = function(){
	this.bonusId;
	this.name;
	this.bonusType;
	this.numSpins;
	this.choosable;
	this.reelSetIndex;
	this.multiplierFunction;
	this.reelDef;
	this.numSpins;
}

HoneyPot.SlotBonus.prototype.getPotentialWins = function(num){
	var reelDef = this.reelDef.split('|');
	var potWins = [];
	for(var i=0;i<num;i++){
		var r = parseInt(Math.random() * reelDef.length);
        potWins.push(reelDef[r]);
	}
	return potWins;
}