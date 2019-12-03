HoneyPot.BetPanelContainer = function(data){
	HoneyPot.Container.call(this,data);
	this.stakeUpBtn;
	this.stakeDownBtn;
	this.stakeText;
	this.stakePerLineText;

	this.callback;
}

HoneyPot.BetPanelContainer.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.BetPanelContainer.prototype.constructor = HoneyPot.BetPanelContainer;

HoneyPot.BetPanelContainer.prototype.init = function(data,callback){

	this.callback = callback;
	this.stakeUpBtn = this.getComponentByID('stakeUp');
	this.stakeUpBtn.setCallBack(this.clicked.bind(this));
	this.stakeDownBtn = this.getComponentByID('stakeDown');
	this.stakeDownBtn.setCallBack(this.clicked.bind(this));
	this.stakePerLineText = this.getComponentByID('stakePerLineText');
	this.stakeText = this.getComponentByID('stakeText');

	this.numWinlines = parseInt(data.numWinLines);
	this.stakeIncrements = data.stakeIncrements;
	this.selectedStake = 0;

	for(var i=0;i<this.stakeIncrements.length; i++){
		if(this.stakeIncrements[i] == data.defaultStake){
			this.selectedStake = i;
			break;
		}
	}
	this.setStake(this.stakeIncrements[this.selectedStake]);
}

HoneyPot.BetPanelContainer.prototype.clicked = function(id){
	switch(id){
		case 'stakeUp':
			this.stakeUp();
			break;
		case 'stakeDown':
			this.stakeDown();
			break;
	}
}

HoneyPot.BetPanelContainer.prototype.stakeUp = function(){
	this.selectedStake += 1;
	this.stakeUpBtn.enableButton();
	this.stakeDownBtn.enableButton();
	if(this.selectedStake >= (this.stakeIncrements.length-1)){
		this.selectedStake = this.stakeIncrements.length-1;
		this.stakeUpBtn.disableButton();
	}
	this.setStake(this.stakeIncrements[this.selectedStake]);
}

HoneyPot.BetPanelContainer.prototype.stakeDown = function(){
	this.selectedStake -= 1;
	this.stakeDownBtn.enableButton();
	this.stakeUpBtn.enableButton();
	if(this.selectedStake == 0){
		this.selectedStake = 0;
		this.stakeDownBtn.disableButton();
	}
	this.setStake(this.stakeIncrements[this.selectedStake]);
}

HoneyPot.BetPanelContainer.prototype.setStake = function(stake){
	this.stakePerLineText.text = HoneyPot.Currency.formatMoneyPence(stake);
	this.stakeText.text = HoneyPot.Currency.formatMoneyPence(stake * this.numWinlines);
	this.callback(stake);
}

HoneyPot.BetPanelContainer.prototype.enableButtons = function(){
	if(this.selectedStake < (this.stakeIncrements.length-1)){
		this.stakeUpBtn.enableButton();
	}
	if(this.selectedStake > 0){
		this.stakeDownBtn.enableButton();
	}
}

HoneyPot.BetPanelContainer.prototype.disableButtons = function(){
	this.stakeUpBtn.disableButton();
	this.stakeDownBtn.disableButton();
}
