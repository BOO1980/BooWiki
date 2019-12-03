HoneyPot.SettingsPanel = function(config){
	HoneyPot.Container.call(this, config);
	this.closeCallback;
	this.soundCallback;
	this.vibrateCallback;
	this.uiCallback;
	this.closeBtn;
	this.selectedBtn;

	this.soundBtn;
	this.vibrateBtn;
	this.uiBtn;

	this.soundOn = true;
	this.vibrateOn = true;
	this.uiPosition = config.uiPosition;

	this.optionTextures = ["settingOptionOff","settingOptionOn"]
	this.textureOn = this.app.getAssetById(this.optionTextures[1]);
	this.textureOff = this.app.getAssetById(this.optionTextures[0]);

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

}

HoneyPot.SettingsPanel.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.SettingsPanel.prototype.constructor = HoneyPot.SettingsPanel;

HoneyPot.SettingsPanel.prototype.init = function(closeCallback,soundCallback, vibrateCallback, uiCallback){
	this.closeCallback = closeCallback;

	this.soundCallback = soundCallback;
	this.vibrateCallback = vibrateCallback;
	this.uiCallback = uiCallback;

	//sound
	var txtbg = new HoneyPot.Sprite({
								x:0,
								y:60,
								imageName:"settingsTextBox"
							});
	this.addChild(txtbg);

	var txt = new HoneyPot.Text({
								type:"Text",
								text:HoneyPot.LocaleManager.getText("SOUND"),
								align:"center",
								x:90,
								y:78,
								style:{
									colour:"#f7ba0c",
									fontSize:25,
									fontFamily:"MyriadProRegular"
								}
							});
	this.addChild(txt);

	this.soundBtn = new HoneyPot.Sprite({
								x:200,
								y:60,
								imageName:this.optionTextures[1]
							});
	this.soundBtn.interactive = true;
	this.soundBtn.buttonMode = true;
	this.soundBtn.on('pointerdown', this.soundBtnDown.bind(this));
	this.addChild(this.soundBtn);
	

	var txt = new HoneyPot.Text({
								type:"Text",
								text:HoneyPot.LocaleManager.getText("OFF")+" | "+ HoneyPot.LocaleManager.getText("ON"),
								align:"center",
								x:290,
								y:82,
								style:{
									colour:"#f7ba0c",
									fontSize:14,
									fontFamily:"MyriadProRegular"
								}
							});
	this.addChild(txt);


	//Vibrate

	/*var txtbg = new HoneyPot.Sprite({
								x:0,
								y:140,
								imageName:"settingsTextBox"
							});
	this.addChild(txtbg);

	var txt = new HoneyPot.Text({
								type:"Text",
								text:HoneyPot.LocaleManager.getText("VIBRATE"),
								align:"center",
								x:90,
								y:158,
								style:{
									colour:"#f7ba0c",
									fontSize:25,
									fontFamily:"MyriadProRegular"
								}
							});
	this.addChild(txt);

	this.vibrateBtn = new HoneyPot.Sprite({
								x:200,
								y:140,
								imageName:this.optionTextures[1]
							});
	this.vibrateBtn.interactive = true;
	this.vibrateBtn.buttonMode = true;
	this.vibrateBtn.on('pointerdown', this.vibrateBtnDown.bind(this));
	this.addChild(this.vibrateBtn);

	var txt = new HoneyPot.Text({
								type:"Text",
								text:HoneyPot.LocaleManager.getText("OFF")+" | "+ HoneyPot.LocaleManager.getText("ON"),
								align:"center",
								x:290,
								y:162,
								style:{
									colour:"#f7ba0c",
									fontSize:14,
									fontFamily:"MyriadProRegular"
								}
							});
	this.addChild(txt);*/


	//ui

	var txtbg = new HoneyPot.Sprite({
								x:0,
								y:170,
								imageName:"settingsTextBox"
							});
	this.addChild(txtbg);

	var txt = new HoneyPot.Text({
								type:"Text",
								text:HoneyPot.LocaleManager.getText("UI"),
								align:"center",
								x:90,
								y:188,
								style:{
									colour:"#f7ba0c",
									fontSize:25,
									fontFamily:"MyriadProRegular"
								}
							});
	this.addChild(txt);

	this.uiBtn = new HoneyPot.Sprite({
								x:200,
								y:170,
								imageName:this.optionTextures[1]
							});
	this.uiBtn.interactive = true;
	this.uiBtn.buttonMode = true;
	this.uiBtn.on('pointerdown', this.uiBtnDown.bind(this));
	this.addChild(this.uiBtn);

	var txt = new HoneyPot.Text({
								type:"Text",
								text:"< | >",
								align:"center",
								x:290,
								y:192,
								style:{
									colour:"#f7ba0c",
									fontSize:14,
									fontFamily:"MyriadProRegular"
								}
							});
	this.addChild(txt);



	var btnPosX = 380;
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
								y:230,
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
	this.selectedBtn.setCallBack(this.closePanel.bind(this));
	this.selectedBtn.visible = false;
}
HoneyPot.SettingsPanel.prototype.uiBtnDown = function(){
	if(this.uiPosition == 'right'){
		this.uiPosition = 'left';
		this.uiBtn.texture = this.textureOff;
	}else{
		this.uiPosition = 'right';
		this.uiBtn.texture = this.textureOn;
	}
	this.uiCallback(this.uiPosition);
}
HoneyPot.SettingsPanel.prototype.vibrateBtnDown = function(){
	if(this.vibrateOn){
		this.vibrateOn = false;
		this.vibrateBtn.texture = this.textureOff;
	}else{
		this.vibrateOn = true;
		this.vibrateBtn.texture = this.textureOn;
	}
	this.vibrateCallback(this.vibrateOn);
}
HoneyPot.SettingsPanel.prototype.soundBtnDown = function(){
	if(this.soundOn){
		this.soundOn = false;
		this.soundBtn.texture = this.textureOff;
	}else{
		this.soundOn = true;
		this.soundBtn.texture = this.textureOn;
	}
	this.soundCallback(this.soundOn);
}

HoneyPot.SettingsPanel.prototype.closePanel = function(){
	this.closeCallback();
	this.visible = false;
}
