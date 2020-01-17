/*/https://www.codeproject.com/Articles/829254/JavaScript-Namespace*/

/*These three functions could put is in to trouble if we used 3rd party libraries that more than likely will contain the same names*/
/*It could be overwritten by the library or visa versa*/

function calculateTax(item){
	
	return item.price * 1.40;
}

var product= function(cost){
	
	this.cost = cost;
	this.getCost = function(){
		return this.cost;
	};
};

function doTaxCalculations(){

	var p = new product(100);
	alert(calculateTax(p.getCost()));
}