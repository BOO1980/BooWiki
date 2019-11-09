'use strict';
(function() {
	function Person(firstName, lastName, age){
			this.firstName	= firstName;
			this.lastName	= lastName;	
			this.age = age;
			this.isAdult = function(){return this.age > 21;}
		}

		let hayley = new Person('Hayley','Billingham','age');
		let james = new Person('James','Nunney');
	display(james.isAdult);
	display(hayley.isAdult);

})()