HoneyPot.GraphicsDriver = {

	init:function(config){
		if(!this.driver){
			this.driver = null;
		}
			
		this.driver = new HoneyPot.GraphicsPIXI(config);
		
	},
	
	getGraphicsDriver:function(){
		return this.driver;
	}
}