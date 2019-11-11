'use strict';
(function() {
	function registerUser(fName, lName, age){
		let person = {
			fName,
			lName,
			age
		};
		display(person);
	}
	registerUser('Hayley','Bayley',39);
})();
