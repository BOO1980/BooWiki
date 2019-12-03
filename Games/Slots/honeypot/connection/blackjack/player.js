HoneyPot.Player = function(seat){
	this.id = 0;
    this.seat = seat;

    this.currentHand = 0;
    this.totalHands = 1;
    this.insurance = null;
    this.insuranceStake = 0;
    this.isSplit = false;

    this.stake = 0;
    this.originalStake = this.stake;
    this.winnings = 0;
    this.cardData = [];

    this.hands = [];
}

HoneyPot.Player.prototype.addHand = function(hand){
    
    this.hands.push(hand);
}

HoneyPot.Player.prototype.getHand = function(){
    return this.hands[this.currentHand];
}


HoneyPot.Player.prototype.getHands = function(){
    return this.hands;
}
HoneyPot.Player.prototype.getHandByID = function(id){
    //return this.hands[id];
    if(this.hands && this.hands[id]){
        return this.hands[id];
    }else{
        var hand = new HoneyPot.Hand();
        this.hands.push(hand);
        return hand;
    }
}

HoneyPot.Player.prototype.getCardSprite = function(id){
    return this.hands[this.currentHand].getCardSprite(id);
}

HoneyPot.Player.prototype.getCard = function(id){
    return this.hands[this.currentHand].getCard(id);
}
HoneyPot.Player.prototype.getStake = function(){
    //return this.hands[this.currentHand].stake;
    if(this.isSplit){
        return this.hands[this.currentHand].stake;
    }else{
        return this.stake;
    }
}

HoneyPot.Player.prototype.getTotalStake = function(){
    return this.stake;
}
HoneyPot.Player.prototype.addBet = function(value){
    this.hands[this.currentHand].stake += value;

	this.stake += value;
    this.originalStake = this.stake;
}

HoneyPot.Player.prototype.setInsurance = function(b,value){
    this.insurance = b;
    this.insuranceStake = value;
}

HoneyPot.Player.prototype.clearHand = function(id){
	//this.hands= [];
    //this.cardData = [];
    this.currentHand = 0;
    this.totalHands = 1;
    this.insurance = null;
    this.insuranceStake = 0;
    this.isSplit = false;
    this.stake = 0;
    this.originalStake = this.stake;
    this.winnings = 0;
}

HoneyPot.Player.prototype.clearAllHands = function(){
	for(var i=0;i<this.hands.length;i++){
		this.hands[0].clear();
	}

}