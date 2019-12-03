HoneyPot.WinPanel = function(data){
	HoneyPot.Container.call(this, data);

	this.panelBg = new HoneyPot.Sprite(data.bg);
	this.addChild(this.panelBg);
	this.panelText = new HoneyPot.Text(data.text);
	this.addChild(this.panelText);
}

HoneyPot.WinPanel.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.WinPanel.prototype.constructor = HoneyPot.WinPanel;


HoneyPot.WinPanel.prototype.showWinPanel = function(val ,texture){
	if(texture != null){
		this.panelBg.updateTextureSymbol(texture);
	}
	this.panelText.text = val;
	this.visible = true;
}

HoneyPot.WinPanel.prototype.hideWinPanel = function(){
	this.visible = false;
}