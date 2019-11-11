'use strict';
(function() {

		let person = {
			firstName:'Jim',
			lName:'Cooper',
			age:17,
			isAdult(){return this.age >= 18;}
		};
	
		display(person.isAdult());
})();
