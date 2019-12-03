HoneyPot.LocaleManager = {
	id:'en',
	data:{},
	addLocaleData:function(config){
		var found = false;
		for(var obj in config){
			found = false;
			for(var obj1 in this.data){
				if(obj == obj1){
					this.data[obj1] = config[obj];
					found = true;
					break;
				}
			}
			if(!found){
				this.data[obj] = config[obj];
			}
		}	
		
	},

	
	getText:function(txt){
		var text = txt;

		if(this.data){
			for(var obj in this.data){
				if(text == obj){
					text = this.data[obj];
					break;
				}
			}
		}

		return text;
		
	}
}