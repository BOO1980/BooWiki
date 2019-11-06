var cars = ["Saab","Volvo","BMW"];


function arrayLoop(arrayName){
	console.log("LOOPING OVER THE ARRAY");
	/*Loop over an Array*/ 
	arrayName.forEach(function(item, index, array){
		console.log(item, index);
		}
	)
}

arrayLoop(cars);

document.getElementById('allCars').innerHTML = cars;

document.getElementById("aCar").innerHTML = cars[0];

cars[0] = 'Opel';

document.getElementById("bCar").innerHTML = cars[0];


var person = ["Hayley","Billingham", 40];
document.getElementById("person").innerHTML = person; 

var aPerson = {
	firstName:"Hayley",
	lastName:"Billingham",
	age: 40
}

document.getElementById("firstName").innerHTML = aPerson.firstName;
document.getElementById("lastName").innerHTML = aPerson.lastName;
document.getElementById("age").innerHTML = aPerson.age;

document.getElementById("personArray").innerHTML = person.length;
document.getElementById("carArray").innerHTML = cars.length;

person.sort()
cars.sort();

document.getElementById("sortPerson").innerHTML = person;
document.getElementById("sortCar").innerHTML = cars;

var fruits = ["Banana","Orange","Apple","Mango"];
document.getElementById("fruitsArray").innerHTML = fruits.length
