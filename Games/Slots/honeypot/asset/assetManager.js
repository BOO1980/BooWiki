HoneyPot.AssetManager = function(){
	
}

HoneyPot.AssetManager.protoType.loadAssets = function(images, sounds){
	var that = this;
	PIXI.loader
		.add(images)
		.add(sounds)
		.on('progress', loadProgressHandler)
		.load(function(){that.assetsLoaded();});
}

HoneyPot.AssetManager.prototype.loadProgressHandler = function(loader, resource){
	log('loading '+resource.url+ ' == ' +loader.progress + '%');
}

HoneyPot.AssetManager.prototype.assetsLoaded = function(){
	log('assetsLoaded');
}