HoneyPot.GraphicsPIXI = function(config){
	this.gameWidth = config.gameWidth;
	this.gameHeight = config.gameHeight;
	this.assetResolution = '';
	this.resolutionScale = 1;
	this.config;
	this.style = null;
	this.topBarProgressUpdate = null;

	this.setResolution();
	HoneyPot.logger.log("resolution = "+this.assetResolution + " scale = "+this.resolutionScale);

	this.textureImages = [];
	this.audioSprite = null;
	this.orientationMute = false;
	this.muted = false;
	this.bgSound = [];

	this.callback;

	this.app = new PIXI.Application({
		width:config.gameWidth, 
		height:config.gameHeight,
		antialias:config.antialias,
		transparent:config.transparent,
		resolution:this.resolutionScale
	});

	var userAgent = navigator.userAgent.toLowerCase();
	this.isOpera = (window.opera && window.opera.buildNumber);
    this.isFireFox = (userAgent.indexOf('firefox') > (-1));
    this.isSafari = ((userAgent.indexOf('safari') != -1) && (userAgent.indexOf('chrome') == -1) && (userAgent.indexOf('htc') == -1));
    this.isChrome = (!!window.chrome);
    this.isMsEdge = userAgent.indexOf('edge') > -1;
	this.isIE = ((/*@cc_on!@*/false || userAgent.indexOf('trident') > -1 || userAgent.indexOf('msie') > -1 || userAgent.indexOf('windows') > -1) && !this.isChrome && !this.isSafari && !this.isFireFox && !this.isOpera && !this.isMsEdge);
	
	PIXI.settings.RESOLUTION = 1;

	//this.app.renderer.view.style.position = 'fixed';
	this.app.renderer.view.style.display = 'block';
	this.app.renderer.autoDensity = true;
	this.app.renderer.resize(window.innerWidth, window.innerHeight);

	this.hidden;
	this.visibilityChange; 
	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
	  this.hidden = "hidden";
	  this.visibilityChange = "visibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
	  this.hidden = "msHidden";
	  this.visibilityChange = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
	  this.hidden = "webkitHidden";
	  this.visibilityChange = "webkitvisibilitychange";
	}


	document.addEventListener(this.visibilityChange, this.handleVisibilityChange.bind(this), false);
}


HoneyPot.GraphicsPIXI.prototype.setResolution = function(){
	var screenWidth = window.innerWidth;
	if(screenWidth > (this.gameWidth+(this.gameWidth/2))){
		this.assetResolution = '@2x';
		//this.resolutionScale = 2;
	}
}
HoneyPot.GraphicsPIXI.prototype.loadAssets = function(config, callback, topBarProgressCallback){
	if(topBarProgressCallback){
		this.topBarProgressUpdate = topBarProgressCallback;
	}
	this.config = config;
	this.style = config.fonts.styles ? config.fonts.styles : null;

	var imageFiles = config.images.files;
	
	
	if(uiConfig && uiConfig.images && uiConfig.images.files){
		imageFiles = imageFiles.concat(uiConfig.images.files);

	}
	if(this.assetResolution != ''){
		for(var i=0;i<imageFiles.length;i++){
			var img = imageFiles[i].url.replace('/images/','/images/'+this.assetResolution+'/');
			imageFiles[i].url = img;
		}
	}

	var soundFiles;
	if(this.isIE){
		soundFiles = config.sounds.singleChannelFiles;
		if(uiConfig && uiConfig.sounds && uiConfig.sounds.singleChannelFiles){
			soundFiles = soundFiles.concat(uiConfig.sounds.singleChannelFiles);
		}
	}else{
		soundFiles = config.sounds.files;
		if(uiConfig && uiConfig.sounds && uiConfig.sounds.files){
			soundFiles = soundFiles.concat(uiConfig.sounds.files);
		}
	}

	this.callback = callback;
	var that = this;
	PIXI.Loader.shared
		.add(imageFiles)
		.add(soundFiles)
		.on('progress', this.loadProgressHandler.bind(this))
		.load(this.assetsLoaded.bind(this));
}

HoneyPot.GraphicsPIXI.prototype.loadProgressHandler =function(loader, resource){
	HoneyPot.logger.log('loading '+resource.url+ ' == ' +loader.progress + '%');
	document.getElementById('gameLoader').innerHTML = 'Loading '+ parseInt(loader.progress) + '%';
	if(this.topBarProgressUpdate){
		this.topBarProgressUpdate(parseInt(loader.progress));
	}
}

HoneyPot.GraphicsPIXI.prototype.assetsLoaded =function(){
	if(this.topBarProgressUpdate){
		this.topBarProgressUpdate(100);
	}
	if(this.config.images.textureMaps){
		this.convertTextureMaps(this.config.images.textureMaps);
	}
	if(uiConfig && uiConfig.images && uiConfig.images.textureMaps){
		this.convertTextureMaps(uiConfig.images.textureMaps);
	}
	if(this.config.sounds.sprites){
		this.audioSprite = PIXI.sound.Sound.from({
		    'url': PIXI.Loader.shared.resources['soundSprite'],
		    'sprites': this.config.sounds.sprites
		});
	}
	document.body.removeChild(document.getElementById('gameLoader'));
	document.body.appendChild(this.app.view);

	this.callback();
}

HoneyPot.GraphicsPIXI.prototype.convertTextureMaps = function(textureMaps){
	for(var i=0;i<textureMaps.length;i++){
		var textureMap = textureMaps[i];
		var baseImg = PIXI.Texture.from(textureMap.imageName);
		HoneyPot.logger.log('name '+textureMap.imageName,0);
		if(textureMap.imagePositions){
			
			for(var j=0;j<textureMap.imagePositions.length;j++){
				var imagePosition = textureMap.imagePositions[j];
				var img = new PIXI.Texture(baseImg, new PIXI.Rectangle(imagePosition.x, imagePosition.y,imagePosition.width, imagePosition.height));
				this.textureImages[imagePosition.id] = img;
			}
		}else if(textureMap.spriteSheet){
			var imgName = textureMap.imageName;

			var baseW = baseImg.width;
			var baseH = baseImg.height;
			var imgX = 0;
			var imgY = 0;

			this.textureImages[imgName] = [];

			for(var j=0;j<textureMap.spriteSheet.frames;j++){
				var img = new PIXI.Texture(baseImg, new PIXI.Rectangle(imgX, imgY,textureMap.spriteSheet.width, textureMap.spriteSheet.height));
				//var img = new PIXI.Texture(baseImg, new PIXI.Rectangle((j*textureMap.spriteSheet.width), 0,textureMap.spriteSheet.width, textureMap.spriteSheet.height));
				this.textureImages[imgName].push(img);
				imgX += textureMap.spriteSheet.width;
				if((imgX +textureMap.spriteSheet.width) > baseW){
					imgX = 0;
					imgY += textureMap.spriteSheet.height;
				}
			}
		}
	}
}
HoneyPot.GraphicsPIXI.prototype.getAssetById = function(id){
	var asset;
	if(this.textureImages[id]){
		asset = this.textureImages[id];
	}else{
		asset = new PIXI.Texture.from(id);
	}
	return asset;
}


HoneyPot.GraphicsPIXI.prototype.getAudioById = function(id){
	var asset;
	if(this.audioSprite[id]){
		asset = this.audioSprite[id];
	}else{
		asset = new PIXI.Texture.from(id);
	}
	return asset;
}

HoneyPot.GraphicsPIXI.prototype.setBGSound = function(id){
	this.bgSound.push(id);
}
HoneyPot.GraphicsPIXI.prototype.playSound = function(id, loopBool, vol){
	var volume = vol ? vol : 1;
	if(this.audioSprite && this.audioSprite._sprites[id]){
		this.audioSprite.play(id);
	}else{
		if(PIXI.Loader.shared.resources[id]){
			if(loopBool == true){ 
				if(!PIXI.Loader.shared.resources[id].sound.isPlaying){
					PIXI.Loader.shared.resources[id].sound.play({loop:true, volume:volume});
				}
			}else{
				PIXI.Loader.shared.resources[id].sound.play({volume:volume});  
			}
		}
	}
	
}

HoneyPot.GraphicsPIXI.prototype.stopSound = function(id){
	if(this.audioSprite && this.audioSprite._sprites[id]){
		this.audioSprite.stop(id);

	}else{
		if(PIXI.Loader.shared.resources[id] && PIXI.Loader.shared.resources[id].sound.isPlaying){
			PIXI.Loader.shared.resources[id].sound.stop();
		}
	}
	
}
HoneyPot.GraphicsPIXI.prototype.isBGSound = function(id){
	var found = false;
	for(var i=0;i<this.bgSound.length;i++){
		if(id == this.bgSound[i]){
			found = true;
			break;
		}
	}
	return found;
}
HoneyPot.GraphicsPIXI.prototype.getImageTextureById = function(id){
	var texture = null;
	for(var i=0;i<this.textureImages.length;i++){
		
	}
	return texture;
}

HoneyPot.GraphicsPIXI.prototype.getContext = function(){
	return this.app;
}

HoneyPot.GraphicsPIXI.prototype.resize = function(){
	//this.app.renderer.view.style.top = 0;
	//this.app.renderer.view.style.left = 0;
	this.app.renderer.resize(window.innerWidth, window.innerHeight);	
}
HoneyPot.GraphicsPIXI.prototype.muteSoundOrientation = function(mute){
	this.orientationMute = mute;
	if(this.orientationMute){
		PIXI.sound.muteAll();
	}else{
		if(!this.muted){
			PIXI.sound.unmuteAll();
		}
	}
}
HoneyPot.GraphicsPIXI.prototype.toggleMute = function(){
	this.muted = !this.muted;
	PIXI.sound.toggleMuteAll()
	
}
HoneyPot.GraphicsPIXI.prototype.getStyle = function(){
	return this.style;
}

HoneyPot.GraphicsPIXI.prototype.getCanvasWidth = function(){
	return this.app.renderer.width;
}

HoneyPot.GraphicsPIXI.prototype.getCanvasHeight = function(){
	return this.app.renderer.height;
}

HoneyPot.GraphicsPIXI.prototype.getGameWidth = function(){
	return this.gameWidth;
}

HoneyPot.GraphicsPIXI.prototype.getGameHeight = function(){
	return this.gameHeight;
}

HoneyPot.GraphicsPIXI.prototype.handleVisibilityChange = function(){
	if (document[this.hidden]) {
	    PIXI.sound.pauseAll();
	} else {
	    PIXI.sound.resumeAll();
	}
}


