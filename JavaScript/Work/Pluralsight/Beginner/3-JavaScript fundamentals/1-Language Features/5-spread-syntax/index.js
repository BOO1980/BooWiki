function startCars(car1, car2, car3, ...rest){
	console.log(car1,car2,car3);
	console.log(rest);
}

//function abcCars(car1, car2, car3);

let carCodes = 'abc'; //breaks up the string
let carIds = [100,300,500,400,500,600];
startCars(...carIds);
startCars(...carCodes);