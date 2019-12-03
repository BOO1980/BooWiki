HoneyPot.PickmePanel = function(data){
	HoneyPot.Container.call(this,data);

	this.optionNames = data.pickmeOptions;
	this.resultNames = data.resultsPanels;
	this.potResultsNames = data.potResultsText;
	this.options = [];
	this.currentHighlight=0;
	this.pickmeTimer = 50;
	this.winnings = 0;
	this.totalMultiplier;
	this.currentStake;
	this.resultsPanels = [];
	this.potentialResults = [];
	this.winText;
	this.potentialWinContainer;
	this.potWinsText = [];
	this.callback;
	this.updateWinCallback;
	this.winPanel;

	this.resultContainer;

}

HoneyPot.PickmePanel.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.PickmePanel.prototype.constructor = HoneyPot.PickmePanel;

HoneyPot.PickmePanel.prototype.init = function(){
	this.winPanel = this.getComponentByID('totalWinContainer');
	this.winPanel.init();

	for(var i=0;i<this.optionNames.length;i++){
		var item = this.getComponentByID(this.optionNames[i]);
		item.setCallback(this.selected.bind(this));
		this.options.push(item);
	}

	this.potentialWinContainer = this.getComponentByID('potentialWinContainer');
	for(var i=0;i<this.potResultsNames.length;i++){
		this.potWinsText.push(this.potentialWinContainer.getComponentByID(this.potResultsNames[i]));
	}


	this.resultContainer = this.getComponentByID('resultContainer');
	this.winText = this.resultContainer.getComponentByID('usualWinText');
	for(var i=0;i<this.resultNames.length;i++){
		this.resultsPanels.push(this.resultContainer.getComponentByID(this.resultNames[i]));
	}

}

HoneyPot.PickmePanel.prototype.show = function(data, potentialWins,stake, callback, updateWinCallback){
	this.callback = callback;
	this.updateWinCallback = updateWinCallback;
	this.alpha = 0;
	this.winPanel.visible = false;
	this.winnings = data.winnings;
	this.currentStake = stake;
	this.totalMultiplier = parseInt(data.totalMultiplier).toFixed(0);
	this.resultContainer.visible = false;
	this.potentialWinContainer.visible = false;
	this.visible = true;
	for(var i=0;i<this.options.length;i++){
		this.options[i].disable = false;
	}
	for(var i=0;i<this.potWinsText.length;i++){
		this.potWinsText[i].text = 'X'+parseInt(potentialWins[i]).toFixed(0);
	}
	for(var i=0;i<this.resultsPanels.length;i++){
		this.resultsPanels[i].visible = false;
	}
	this.currentHighlight = 0;
	this.pickmeTimer = 1;
	this.state = 'fadeIn';
	TweenLite.to(this, 1, {onComplete:this.startHighlight.bind(this),pixi:{alpha:1}});

}
HoneyPot.PickmePanel.prototype.selected = function(id){
	var id = id.slice(14, id.length);
	log('callback '+id);
	for(var i=0;i<this.options.length;i++){
		this.options[i].hideHighlight();
		this.options[i].disable = true;
	}
	this.showResult(id);
}


HoneyPot.PickmePanel.prototype.startHighlight = function(){
	this.state = 'showHighlight';
}
HoneyPot.PickmePanel.prototype.showResult = function(id){
	this.potWinsText[id].text = 'X'+this.totalMultiplier;
	this.winText.text = 'X'+this.totalMultiplier;
	this.resultContainer.visible = true;
	this.resultsPanels[id].visible = true;
	this.pickmeTimer = 200;
	this.state = 'showWin';
}
HoneyPot.PickmePanel.prototype.update = function(){
	this.pickmeTimer -= 1;
	if(this.pickmeTimer <= 0){
		if(this.state == 'showHighlight'){
			this.showHighlight();
			this.pickmeTimer = 50;
		}else if(this.state == 'showWin'){
			this.showPotentialWins();
		}else if(this.state == 'showPotentialWins'){
			//this.showTotal();
			//this.state = 'fadeOut'
			this.showTotal();
		}else if(this.state == 'resultShown'){
			this.resultShown();	
		}	
		
		/*}else if(this.state == 'fadeIn'){
			this.alpha += 0.2;
			this.pickmeTimer = 1;
			if(this.alpha >= 1){
				this.state = 'showHighlight';
			}*/
		/*}else if(this.state == 'fadeOut'){
			this.alpha -= 0.2;
			this.pickmeTimer = 1;
			if(this.alpha <= 0){
				this.showTotal();
			}*/
		 
	}
}
HoneyPot.PickmePanel.prototype.showPotentialWins = function(){
	this.resultContainer.visible = false;
	this.potentialWinContainer.visible = true;
	this.pickmeTimer = 50;
	this.state = 'showPotentialWins';

}

HoneyPot.PickmePanel.prototype.showTotal = function(){
	this.winPanel.setTotalText(HoneyPot.Currency.formatMoneyPence(this.winnings));
	this.winPanel.setMultiplierText(this.totalMultiplier, HoneyPot.Currency.formatMoneyPence(this.currentStake));
	this.winPanel.alpha = 0;
	this.winPanel.visible = true;
	this.pickmeTimer = 100;
	TweenLite.to(this.winPanel, 0.5, {pixi:{alpha:1}});
	this.state = 'resultShown';
	this.updateWinCallback(this.winnings);
}
HoneyPot.PickmePanel.prototype.resultShown = function(){
	this.state = 'fadeOut';
	TweenLite.to(this, 1, {onComplete:this.closeBonus.bind(this),pixi:{alpha:0}});
}
HoneyPot.PickmePanel.prototype.closeBonus = function(){
	this.state = 'idle';
	this.visible = false;
	this.callback();
}
HoneyPot.PickmePanel.prototype.showHighlight = function(){
	for(var i=0;i<this.options.length;i++){
		this.options[i].hideHighlight();
	}
	this.options[this.currentHighlight].showHighlight();

	this.currentHighlight+=1;
	if(this.currentHighlight == this.options.length){
		this.currentHighlight = 0;
	}
}