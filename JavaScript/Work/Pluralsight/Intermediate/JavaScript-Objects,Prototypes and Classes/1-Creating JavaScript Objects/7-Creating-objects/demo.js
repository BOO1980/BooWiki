'use strict';
(function() {
	let person1 = {
		firstName: 'Jim',
		lastName:'Cooper',
		age:29,
	}

let person = Object.create(
	Object.prototype,
	{
		firstName: {value:'Jim', enumerable: true, writeable:true, configurable:true},
		lastName: {value:'Cooper', enumerable:true, writeable:true, configurable:true},
		age:{value:29, enumerable:true, writeable:true, configurable:true},
	});

display(person1);
display(person2);
})()