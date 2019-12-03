HoneyPot.Connection = function(config, callback){
	this.initCallback = callback;
	this.config = config;
    var gameStateType = config.gameState ? config.gameState : 'GameState';
	this.gameState = new HoneyPot[gameStateType]();
	this.connectionURL = config.connectionURL;
    this.testresponse = config.testresponse;
    this.testCount = 0;
    this.cookie = config.cookie ? config.cookie : '';

	this.connectionTimeOut = config.connectionTimeOut;
	this.account;	
    this.processErrorMessageCallBack;
}

HoneyPot.Connection.prototype.init = function(){
    //this.setupGameState();
    this.setupAccount();
    this.connectToServer();
}
HoneyPot.Connection.prototype.setupGameState = function(){
    this.gameState = new HoneyPot.GameState();
}
HoneyPot.Connection.prototype.setupAccount = function(){
    this.account = new HoneyPot.Account();
}
HoneyPot.Connection.prototype.connectToServer = function(){
	this.connectionComplete();
}
HoneyPot.Connection.prototype.connectionComplete = function(){
	HoneyPot.logger.log("connectToServer");
	this.initCallback();
}

HoneyPot.Connection.prototype.connectionError = function (data){
    console.log('connectionError = ' + data);
    //this.processErrorMessageCallBack(data);
}
HoneyPot.Connection.prototype.sendToServer = function (xml, callbackSuccess, callbackFailure)
{
    if(this.testresponse){
        if(xml.indexOf('<Close') == -1){
            $.ajax(
            {
                type: "post",
                url: this.connectionURL+  this.testresponse[this.testCount] + "?id=" + Date.now(),
                data: xml,
                dataType: "xml",
                processData: false,
                timeout: this.connectionTimeOut,

                success: function (data)
                {
                    callbackSuccess(data);
                },
                error: function (data)
                {
                    callbackFailure(data);           
                }
            });
            this.testCount+=1;
            if(this.testCount>=this.testresponse.length){
                this.testCount = 1;
            }
        }else{
            callbackSuccess();
        }
    }else{
        $.ajax(
        {
            type: "post",
            url: this.connectionURL+ "?id=" + Date.now(),
            data: xml,
            dataType: "xml",
            processData: false,
            timeout: this.connectionTimeOut,

            success: function (data)
            {
                callbackSuccess(data);
            },
            error: function (data)
            {
                callbackFailure(data);           
            }
        });
    }
};

HoneyPot.Connection.prototype.setProcessErrorMessageCallBack = function (cb){
    this.processErrorMessageCallBack = cb;
}
HoneyPot.Connection.prototype.getGameState = function (){
    return this.gameState;
}
HoneyPot.Connection.prototype.getBalance = function (){
    return this.account.balance;
}
HoneyPot.Connection.prototype.getAccount = function (){
    return this.account;
}