HoneyPot.Hand = function(){
	this.cards = [];
    this.totalType = '';
    this.cardActions = [];
    this.total = 0;
    this.status;
    this.doubleCard;
    this.stake = 0;
    this.winnings = 0;
    this.burntCards;
    this.currentCard;

	this.cardsTotal = 0;
	this.hasAce = false;
	this.cardTotalAce = 0;

	this.cardSprites = [];
	this.cardValues = [];
	this.cardData = [];

	this.chipSprites = [];
    this.chipSpritesVarient = [];
    this.winChips = [];
	
}

HoneyPot.Hand.prototype.getCardSprite = function(id){
	return this.cardSprites[id];
}
HoneyPot.Hand.prototype.getCard = function(id){
	return this.cards[id];
}
HoneyPot.Hand.prototype.getCards = function(){
	return this.cards;
}
HoneyPot.Hand.prototype.addBet = function(value){
	this.stake += value;
}
HoneyPot.Hand.prototype.addCard = function(cardObj, value){
	this.cardSprites.push(cardObj);
}

HoneyPot.Hand.prototype.getCardValues = function(){
	return this.cardValues;
}
HoneyPot.Hand.prototype.addCardValue = function(value){
	this.cardValues.push(value);
	if(value == 11){
		this.hasAce = true;	
	}

	this.cardsTotal = 0;
	this.cardTotalAce = 0;
	this.aceCount = 0;
	for(var i=0;i<this.cardValues.length;i++){
		if(this.cardValues[i] == 11){
			this.aceCount += 1;
		}else{
			this.cardsTotal += this.cardValues[i];
		}
	}
	this.cardTotalAce = this.cardsTotal;
	if(this.aceCount > 0){
		for(var i=0;i<this.aceCount;i++){
			this.cardTotalAce += 1;
			if((this.cardsTotal + 11)>21){
				this.cardsTotal += 1;
			}else{
				this.cardsTotal += 11;
			}
		}

		if(this.cardsTotal > 21){
			this.cardsTotal = this.cardTotalAce;
		}
		if(this.cardsTotal == 21){
			this.cardTotalAce = this.cardsTotal; 
		}

	}
}
HoneyPot.Hand.prototype.clear = function(){
	this.stake = 0;
	this.cards = [];
	this.cardData = [];
	this.cardSprites = [];
	this.cardValues = [];
	this.cardValue = 0;
	this.winnings = 0;
	this.doubleCard = '';
	this.cardTotalAce = 0;
	this.currentCard = 0;
	this.hasAce = false;	
	this.cardActions = [];
}