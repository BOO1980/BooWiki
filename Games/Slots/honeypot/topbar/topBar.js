HoneyPot.TopBar = function(data,connection,cb){
	this.target;
	this.language;
	this.topbarLoadedCallback = cb;
	this.type = 'default';

}

HoneyPot.TopBar.prototype.init = function(){
	this.topbarLoadedCallback();
}
HoneyPot.TopBar.prototype.updateProgressBar = function(prog){

}

HoneyPot.TopBar.prototype.gameReady = function(){

}
HoneyPot.TopBar.prototype.getLanguage = function(){

}
HoneyPot.TopBar.prototype.showWarningMessage = function(msg){
}

HoneyPot.TopBar.prototype.gameStarted = function(val){

}
HoneyPot.TopBar.prototype.gameReady = function(cb){
    cb();
}

HoneyPot.TopBar.prototype.setwin = function(val){
	    
}
HoneyPot.TopBar.prototype.setStake = function(val){
	
}
HoneyPot.TopBar.prototype.updateBalance = function(val){
   
}
HoneyPot.TopBar.prototype.setupAccount = function(account){

}