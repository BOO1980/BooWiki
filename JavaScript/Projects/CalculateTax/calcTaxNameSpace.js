//To access any of the method or vatribles you will need to fetch it through the MYAPPLICATION 

/*var newProduct = new MYAPPLICATION.product(200);
alert(p.getPrice());*/


var MYAPPLICATION = {
    calculateTax: function (item) {
        return item * 1.40;
    },
    product: function (cost) {
        this.cost = cost;
        this.getCost = function(){
                          return this.cost;
                       };
    },
    doTaxCalculations: function () {
        var p = new MYAPPLICATION.product(100);
        alert(MYAPPLICATION.calculateTax(p.getCost()));
    }
}