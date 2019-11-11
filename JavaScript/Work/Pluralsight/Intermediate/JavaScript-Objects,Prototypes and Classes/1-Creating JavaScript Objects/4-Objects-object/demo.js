'use strict';
(function() {

	let person = {
		firstName:'Jim',
		lName:'Cooper',
		age:17,
		isAdult(){return this.age >= 18;}
	};
	//Object.keys()
	//display(person.isAdult());
	//display(Object.keys(person));
	for(let propertyName in person){
		display(propertyName);
	}
})();
