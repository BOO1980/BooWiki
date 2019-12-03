HoneyPot.Container = function(data){
	PIXI.Container.call(this);
	this.id = (typeof data.id  !== 'undefined')? data.id : "";
	this.x = data.x ? data.x : 0;
	this.y = data.y ? data.y : 0;
	this.visible = (typeof data.visible !== "undefined") ? data.visible : true;
	this.components = {};
	this.app = HoneyPot.GraphicsDriver.getGraphicsDriver();
}

HoneyPot.Container.prototype = Object.create(PIXI.Container.prototype);
HoneyPot.Container.prototype.constructor = HoneyPot.Container;

HoneyPot.Container.prototype.getComponentByID = function(id){
	return this.components[id];
}