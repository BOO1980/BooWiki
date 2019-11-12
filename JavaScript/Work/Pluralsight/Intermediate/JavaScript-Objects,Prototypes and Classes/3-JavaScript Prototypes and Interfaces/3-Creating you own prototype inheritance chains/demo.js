'use strict'; 
(function() {

/* let myfunction = function(){}
 display(myfunction.prototype);

 let person = {firstname:'Jim'}; 
 display(person.__proto__);*/
/*Person constructor function*/
function Person(firstName, lastName,age){
	this.firstName = firstName;
	this.lastName = lastName;
	this.age = age;

	Object.defineProperty(this, 'fullName',{
		get: function(){
			return this.firstName + ' ' + this.lastName	
		},
		enumerable: true
	});
}

function Student(firstName, lastName, age)
{
	/*Allos us to call the person function while setting the context of this*/
	Person.call(this, firstName, lastName, age);
	this._enrolledCourses = [];

	this.enroll = function(courseId){
		this._enrolledCourses.push(courseId);
	};

	this.getCourses = function(){
		return this.fullName + "'s enrolled courses are: " + this._enrolledCourses.join(', ');
	};

}

display(Student.prototype.constructor);

Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;

display(Student.prototype.constructor);

/*
let jim = new Student('Jim','Cooper', 29);
jim.enroll('CS205');
jim.enroll('MA101');
jim.enroll('PS101');

display(jim);
display(jim.__proto__);
display(jim.__proto__.__proto__);
display(jim.__proto__.__proto__.__proto__);


display(jim.getCourses());
*/

/*Person.prototype.age = 29;

display(Person.prototype);

let jim = new Person('Jim','Cooper');
let sofia = new Person('sofia','Cooper');*/

/*sofia.__proto__.age = 19;

display(jim.__proto__);
display(Person.prototype === jim.__proto__);
*/
})();