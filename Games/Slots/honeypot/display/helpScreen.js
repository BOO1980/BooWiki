HoneyPot.HelpScreen = function(config){
	HoneyPot.Screen.call(this,config);
	this.currentPage = 0;
	this.helpPages = [];
}

HoneyPot.HelpScreen.prototype = Object.create(HoneyPot.Screen.prototype);
HoneyPot.HelpScreen.prototype.constructor = HoneyPot.HelpScreen;

HoneyPot.HelpScreen.prototype.initComponents = function(){

	var btn = this.getComponentByID('exitHelp');
	btn.setCallBack(this.closeHelp.bind(this));
	var btn = this.getComponentByID('nextHelp');
	btn.setCallBack(this.nextHelp.bind(this));
	var btn = this.getComponentByID('backHelp');
	btn.setCallBack(this.prevHelp.bind(this));
}

HoneyPot.HelpScreen.prototype.closeHelp = function(){
	this.closScreenCallBack('reelScreen');
}

HoneyPot.HelpScreen.prototype.hidePages = function(){
	for(var i=0;i<this.helpPages.length;i++){
		this.helpPages[i].visible = false;
	}
}
HoneyPot.HelpScreen.prototype.nextHelp = function(){
	this.currentPage += 1;
	if(this.currentPage == this.helpPages.length){
		this.currentPage = 0;
	}
	this.hidePages();
	this.helpPages[this.currentPage].visible = true;
}

HoneyPot.HelpScreen.prototype.prevHelp = function(){
	this.currentPage -= 1;
	if(this.currentPage == -1){
		this.currentPage = (this.helpPages.length-1);
	}
	this.hidePages();
	this.helpPages[this.currentPage].visible = true;
}