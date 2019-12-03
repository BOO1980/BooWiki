HoneyPot.ScreenWrapper = function(config){
	HoneyPot.Container.call(this, config);

}

HoneyPot.ScreenWrapper.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.ScreenWrapper.prototype.constructor = HoneyPot.ScreenWrapper;

HoneyPot.ScreenWrapper.prototype.init = function(gameState){
	for(var screen in this.components){
		this.components[screen].init(this.gameState);
		this.components[screen].setCloseScreenCallBack(this.switchScreen.bind(this));
	}
}