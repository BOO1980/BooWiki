HoneyPot.BlackJackGameState = function(){
	HoneyPot.GameState.call(this);
	this.hasDealerCards = false;
	this.currentPlayer;
	this.totalPlayers;
	this.insuranceOffers = false;
	this.options;
	this.players = [];
	this.dealer;
	this.tableWins;
	this.gipCurrentPlayer = 0;
	this.gipCurrentHand = 0;
}

HoneyPot.BlackJackGameState.prototype = Object.create(HoneyPot.GameState.prototype);
HoneyPot.BlackJackGameState.prototype.constructor = HoneyPot.BlackJackGameState;

HoneyPot.BlackJackGameState.prototype.addPlayer = function(player){
	this.players.push(player);

} 
HoneyPot.BlackJackGameState.prototype.getPlayer = function(id){
	if(this.players && this.players[id]){
		return this.players[id];
	}else{
		return null;
	}
} 

HoneyPot.BlackJackGameState.prototype.getPlayerStake = function(){
	var stake = 0;
	for(var i=0;i<this.players.length;i++){
		stake += this.players[i].getTotalStake();
	}
	return stake;
}

HoneyPot.BlackJackGameState.prototype.clearPlayers = function(){
	this.players = [];
	this.insuranceOffers = false;
} 