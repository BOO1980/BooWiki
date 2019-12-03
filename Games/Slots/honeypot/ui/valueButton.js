HoneyPot.ValueButton = function(config){
	HoneyPot.Container.call(this, config);
	this.value = config.value;
	this.btn = new HoneyPot.Button(config.button);
	this.addChild(this.btn);
	this.btn.setCallBack(this.optionSelected.bind(this));
	this.txt = new HoneyPot.Text(config.text);
	this.addChild(this.txt);
	this.txt.text = config.textStake;
	this.selected = false;
	this.textColour = config.textColour;
	this.callback;
}

HoneyPot.ValueButton.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.ValueButton.prototype.constructor = HoneyPot.ValueButton;

HoneyPot.ValueButton.prototype.setCallback = function(callback){
	this.callback = callback;

}
HoneyPot.ValueButton.prototype.optionSelected = function(val){
	this.callback(this);
	this.setSelected(true);
}
HoneyPot.ValueButton.prototype.setSelected = function(val){
	this.selected = val;
	if(this.selected){
		this.btn.disableButton();
		this.txt.setColour('0x000000');
	}else{
		this.btn.enableButton();
		this.txt.setColour(this.textColour);
	}
}