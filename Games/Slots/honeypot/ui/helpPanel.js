HoneyPot.HelpPanel = function(config){
	HoneyPot.Container.call(this, config);
	this.closeBtn;
	this.sideBar;
	this.closeCallback;
	this.helpPages = config.pages;

	this.sideHeight = 342;
	this.barHeight = 62;
	this.barStepY = 62;

	this.pages = [];

	this.pageDownBtn;
	this.currentPage = 0;

}

HoneyPot.HelpPanel.prototype = Object.create(HoneyPot.Container.prototype);
HoneyPot.HelpPanel.prototype.constructor = HoneyPot.HelpPanel;

HoneyPot.HelpPanel.prototype.init = function(gameState, closeCallback,gameName,gameVersion){
	this.closeCallback = closeCallback;
	this.gameState = gameState;

	var bg = new HoneyPot.Sprite({
								x:0,
								y:0,
								imageName:"helpPagePanel"
							});
	this.addChild(bg);

	var btnPosX = bg.width - 68;
	this.closeBtn = new HoneyPot.Button({
								action:"Button",
								sound:"btnClickSound",
								id:"closeBtn",
							
								x:btnPosX,
								y:10,
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

	this.pageDownBtn = new HoneyPot.Button({
								action:"Button",
								sound:"btnClickSound",
								id:"downBtn",
								
								x:btnPosX,
								y:bg.height - 68,
								state:{
									up:{
										imageName:"pageDownBtnUp"
									},
									disabled:{
										imageName:"pageDownBtnDisabled"
									}
								}
							});
	this.addChild(this.pageDownBtn);
	this.pageDownBtn.setCallBack(this.pageDown.bind(this));


	this.pageUpBtn = new HoneyPot.Button({
								action:"Button",
								sound:"btnClickSound",
								id:"upBtn",
								rotate:180,
								x:bg.width-10,
								y:150,
								state:{
									up:{
										imageName:"pageDownBtnUp"
									},
									disabled:{
										imageName:"pageDownBtnDisabled"
									}
								}
							});
	this.addChild(this.pageUpBtn);
	this.pageUpBtn.setCallBack(this.pageUp.bind(this));

	var textStyle = {colour:"#f7ba0c",fontSize:16,fontFamily:"MyriadProRegular"};

	var gameDetails = new HoneyPot.Text({type:"Text",text:'© Hungry Bear Games, '+ gameName + ' ' +gameVersion,align:"left",x:30,y:bg.height - 35,style:textStyle});
	this.addChild(gameDetails);


	for(var i=0;i<this.helpPages.length;i++){

		var helpPage = this.helpPages[i];  
		var page;

		if(helpPage.type == 'page'){
			page = new HoneyPot.Container({x:40,y:47, visible:false})
			this.buildComponents(page, helpPage.children);
			this.addChild(page);
			this.pages.push(page);
		}else{
			page = new HoneyPot.Sprite({
										x:40,
										y:47,
										visible:false,
										imageName:this.helpPages[i]
									});
			var pageScale = this.sideHeight / page.height;

			page.setScale(HoneyPot.Currency.round(pageScale,1));
			this.addChild(page);
			this.pages.push(page);
		}
			
	}
	if(this.pages.length > 0){
		this.pages[0].visible = true;
	}
	var sidebg = new HoneyPot.Sprite({
								x:30,
								y:47,
								imageName:"helpPageScroll1"
							});
	this.addChild(sidebg);

	this.barStepY = Math.floor(this.sideHeight/this.helpPages.length);
	var scaleY = HoneyPot.Currency.round(this.barStepY/this.barHeight,1);

	this.sideBar = new HoneyPot.Sprite({
								x:30,
								y:47,
								scale:{x:1,y:scaleY},
								imageName:"helpPageScroll2"
							});
	this.addChild(this.sideBar);
}

HoneyPot.HelpPanel.prototype.buildComponents = function(tgt,config){
	for(var obj in config){
		var data = config[obj];
		if(data.type == 'Text'){
			var txt;
			if(Array.isArray(data.text)){
				txt='';
				for(var i=0;i<data.text.length;i++){
					txt += HoneyPot.LocaleManager.getText(data.text[i]);
				}
			}else{
				txt = HoneyPot.LocaleManager.getText(data.text);
			}
			//var txt = HoneyPot.LocaleManager.getText(data.text);
			if(txt.indexOf('{MAX_BET}') >-1){
				txt = txt.replace('{MAX_BET}', HoneyPot.Currency.formatMoneyPence(this.gameState.maxStake));
			}
			if(txt.indexOf('{MIN_BET}') >-1){
				txt = txt.replace('{MIN_BET}', HoneyPot.Currency.formatMoneyPence(this.gameState.minStake));
			}
			if(txt.indexOf('{MAX_WIN}') >-1){
				txt = txt.replace('{MAX_WIN}', HoneyPot.Currency.formatMoneyPence(this.gameState.maxWinnings));
			}
			data.text = txt
		}
		var item = new HoneyPot[data.type](data);

		tgt.addChild(item);
			
		if(data.children){
			this.buildComponents(item, data.children);
		}

	}
}

HoneyPot.HelpPanel.prototype.pageUp = function(){
	this.currentPage -= 1;
	if(this.currentPage < 0){
		this.currentPage = this.helpPages.length-1;
	}
	if(this.pages.length > -1){
		for(var i=0;i<this.pages.length;i++){
			this.pages[i].visible = false;
		}
		this.pages[this.currentPage].visible = true;

		this.sideBar.y = (this.barStepY * this.currentPage)+47;
	}
}
HoneyPot.HelpPanel.prototype.pageDown = function(){
	this.currentPage += 1;
	if(this.currentPage >= this.helpPages.length){
		this.currentPage = 0;
	}
	if(this.pages.length > -1){
		for(var i=0;i<this.pages.length;i++){
			this.pages[i].visible = false;
		}
		this.pages[this.currentPage].visible = true;

		this.sideBar.y = (this.barStepY * this.currentPage)+47;
	}
}
HoneyPot.HelpPanel.prototype.closePanel = function(){
	this.closeCallback();
	this.visible = false;
}