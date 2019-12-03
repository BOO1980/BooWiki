HoneyPot.GDMTopBar = function(data,connection,cb){
	HoneyPot.TopBar.call(this,data,connection,cb);
	this.target = window.parent;
	this.language = this.target.languageCode; 
	this.type = 'gdm';
}

HoneyPot.GDMTopBar.prototype = Object.create(HoneyPot.TopBar.prototype);
HoneyPot.GDMTopBar.prototype.constructor = HoneyPot.GDMTopBar;

HoneyPot.GDMTopBar.prototype.init = function(){
	this.topbarLoadedCallback();
}
HoneyPot.GDMTopBar.prototype.showWarningMessage = function(msg){

	this.target.delegatedErrorHandling(msg,HoneyPot.LocaleManager.getText(msg),false);
}
HoneyPot.GDMTopBar.prototype.updateProgressBar = function(prog){
	this.target.updateProgress(prog, 100);
}

HoneyPot.GDMTopBar.prototype.updateBalance = function(val){
	this.target.valueChanged('BALANCE', val);
}


HoneyPot.GDMTopBar.prototype.gameStarted = function(val){
	if(val){
		this.target.valueChanged("ROUND", 1);
	}else{
		this.target.valueChanged("ROUND", 0);
	}
}
HoneyPot.GDMTopBar.prototype.setMute = function(val){
	this.target.valueChanged("MUTE", val);
}
HoneyPot.GDMTopBar.prototype.updateWin = function(val){
	this.target.valueChanged('TOTAL_WIN', val);
}

HoneyPot.GDMTopBar.prototype.updateStake = function(val){
	this.target.valueChanged('TOTAL_BET', val);
}

HoneyPot.GDMTopBar.prototype.getLanguage = function(){
	return this.language;
}
HoneyPot.GDMTopBar.prototype.gameReady = function(cb){
    cb();
}
function changeOrientation(orientation){ 
	console.log('changeOrientation');
	game.resize();
}
function processServerMsg(message){ 
	game.connection.processServerMsg(message)
}
function apiExt(name, val){
	switch(name){
		case 'SET_MUTE':
			game.gameUI.setSoundFromTopBar(val);
			break;
		case 'SET_BALANCE':
			game.setUpdateBalance(val);
			break;
	}
}