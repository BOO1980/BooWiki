'use strict'; 
(function() {

	let person = { 
		firstName: 'Jim', 
		lastName: 'Cooper',
		age: 17,
		isAdult: function(){return this.age >=18;}
	};
  //let firstName = 'Jim';
  //let lastName = 'Cooper';
   // person.age = 29;
   // display(person.firstName);
   // display(person.age);
   // display(person.isAdult());
    let propertyName = 'firstName';

   	display(person['firstName']);
    display(person [propertyName]);


for(let propertyName in person){
  display(propertyName  + ':' + person[propertyName]);
}

})();