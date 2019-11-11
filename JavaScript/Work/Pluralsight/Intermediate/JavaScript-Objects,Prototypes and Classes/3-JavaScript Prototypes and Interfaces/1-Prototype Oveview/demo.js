'use strict'; 
(function() {

/* let myfunction = function(){}
 display(myfunction.prototype);

 let person = {firstname:'Jim'}; 
 display(person.__proto__);*/
/*Person constructor function*/
function Person(firstName, lastName){
	this.firstname = firstName;
	this.lastName = lastName;
}

Person.prototype.age = 29;

display(Person.prototype);

let jim = new Person('Jim','Cooper');
let sofia = new Person('sofia','Cooper');

sofia.__proto__.age = 19;

display(jim.__proto__);
display(Person.prototype === jim.__proto__);

})();