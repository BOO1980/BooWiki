HoneyPot.StakePanel = function(config){
	HoneyPot.Container.call(this, config);
	this.numWinlines;
	this.selectedStake;
	this.stakeIncrements;
	/*this.buttonData = {
					action:"Button",
					sound:"btnClickSound",
					id:"",
					x:0,
					y:0,
					state:{
						up:{
							imageName:"stakeValueUp"
						},
						disabled:{
							imageName:"stakeValueDisabled"
						}
					}
				};
	this.textData = {
					x:90,
					y:18,
					text:"£1.00",
					style:{
						colour:"#f7ba0c",
						fontSize:25,
						fontFamily:"MyriadProRegular"
					}
					
				};*/

	this.buttonData = {
					action:"Button",
					sound:"btnClickSound",
					id:"",
					x:0,
					y:0,
					state:{
						up:{
							imageName:"autoValueUp"
						},
						disabled:{
							imageName:"autoValueDisabled"
						}
					}
				};
	this.textData = {
					x:60,
					y:10,
					text:"£1.00",
					style:{
						colour:"#f7ba0c",
						fontSize:20,
						fontFamily:"MyriadProRegular"
					}
					
				};

	this.textColour = "#f7ba0c";
	this.buttonWidth = config.btnWidth;
	this.buttonHeight = config.btnHeight;
	this.startX = 0;
	this.startY = 30;
	this.stake;

	this.closeBtn;
	this.selectedBtn;

	this.closeCallback;
	this.setStakeCallback;

	this.stakeOptionBtns = [];

	this.stakeWhenOpened;

}

HoneyPot.StakePanel.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.StakePanel.prototype.constructor = HoneyPot.StakePanel;

HoneyPot.StakePanel.prototype.init = function(gameState, closeCallback, setStakeCallback){
	this.closeCallback = closeCallback;
	this.setStakeCallback = setStakeCallback;

	this.gameState = gameState;
	var slotDef = this.gameState.getSlotDef();
	if(slotDef){
		this.numWinlines = parseInt(slotDef.numWinLines);
	}else{
		this.numWinlines = 1;
	}
	this.stakeIncrements = gameState.stakeIncr;
	this.selectedStake = 0;

	this.setUpStakeSelector();

	
	var btnPosX = Math.ceil(this.stakeIncrements.length/5)* this.buttonWidth;
	this.closeBtn = new HoneyPot.Button({
								action:"Button",
								sound:"btnClickSound",
								id:"closeBtn",
							
								x:btnPosX,
								y:0,
								state:{
									up:{
										imageName:"closeBtnUp"
									},
									disabled:{
										imageName:"closeBtnDisabled"
									}
								}
							});
	this.addChild(this.closeBtn);
	this.closeBtn.setCallBack(this.closePanel.bind(this));

	this.selectedBtn =new HoneyPot.Button({
								action:"Button",
								sound:"btnClickSound",
								id:"applyBtn",
							
								x:btnPosX,
								y:350,
								state:{
									up:{
										imageName:"applyBtnUp"
									},
									disabled:{
										imageName:"applyBtnDisabled"
									}
								}
							});
	this.addChild(this.selectedBtn);
	this.selectedBtn.setCallBack(this.setSelectedStake.bind(this));

	
}

HoneyPot.StakePanel.prototype.setUpStakeSelector = function(){

	var data = {};
	data.x = 0;
	data.y = 0;
	data.value = 1;
	data.textColour = this.textColour;
	data.button = this.buttonData;
	data.text = this.textData;

	var rows = Math.ceil(this.stakeIncrements.length/5);
	var posX = this.startX;// - (rows*this.buttonWidth);
	var posY = this.startY;

	for(var i=0;i<this.stakeIncrements.length; i++){
		data.x = posX;
		data.y = posY;
		data.id = i;
		data.value = this.stakeIncrements[i];
		data.textStake = HoneyPot.Currency.formatMoneyPence(this.stakeIncrements[i] * this.numWinlines);

		var btn = new HoneyPot.ValueButton(data);
		this.addChild(btn);
		btn.setCallback(this.stakeSelected.bind(this));
		this.stakeOptionBtns.push(btn);

		posY += this.buttonHeight;
		if(((i+1)%5) == 0){
			posY = this.startY;;
			posX += this.buttonWidth;
		}

		if(this.stakeIncrements[i] == this.gameState.dfltStake){
			btn.setSelected(true);
			this.selectedStake = i;
		}
	}
	this.gameState.stake = this.stakeIncrements[this.selectedStake]
}

HoneyPot.StakePanel.prototype.show = function(){
	this.stakeWhenOpened = this.selectedStake;
	this.visible = true;
}
HoneyPot.StakePanel.prototype.stakeSelected = function(btn){
	this.stake = btn.value;
	this.selectedStake = btn.id;
	for(var i=0;i<this.stakeOptionBtns.length;i++){	
		if(i != btn.id){
			this.stakeOptionBtns[i].setSelected(false);
		}
	}
}

HoneyPot.StakePanel.prototype.closePanel = function(){
	this.closeCallback();
	for(var i=0;i<this.stakeOptionBtns.length;i++){	
		this.stakeOptionBtns[i].setSelected(false);

	}
	this.stakeOptionBtns[this.stakeWhenOpened].setSelected(true);
	

	this.visible = false;
}
HoneyPot.StakePanel.prototype.setSelectedStake = function(stake){
	this.gameState.stake = this.stake;
	this.setStakeCallback();
}


