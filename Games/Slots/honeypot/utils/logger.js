HoneyPot.logger = {
	logLevel: 10,
	log: function(msg,lvl){
		var outputlvl = lvl ? lvl : 10;
		if(outputlvl <= this.logLevel){
        	console.log(msg);
		}
    }
}

