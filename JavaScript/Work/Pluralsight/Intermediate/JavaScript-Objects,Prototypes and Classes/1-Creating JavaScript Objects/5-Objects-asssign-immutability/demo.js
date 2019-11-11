'use strict';
(function() {

	let person1 = {
		firstName: 'Jim',
		lastName:'Cooper',
		age:29,
		isAdult: function() {return this.age >18;}
	};
	let person2 = {}

	Object.assign(person2, person1);
	display(person2);

	display (person1 === person2);

	let healthStats = {
		height:68,
		weight:150
	};

	function mergeHealthStats(person, healthStats){
	return Object.assign({},person1,healthStats);
	
	}

	let mergedPerson = mergeHealthStats(person1, healthStats);

	display(mergedPerson);
	display(person1);

})()