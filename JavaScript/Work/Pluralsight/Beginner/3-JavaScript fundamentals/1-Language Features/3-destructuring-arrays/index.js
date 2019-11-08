let carIds  = [1,2,5];
//let [car1, car2, car3] = carIds;
//let car1, remainingCars;
let remainingCars;

//[car1, ... remainingCars] = carIds;.
//the comma skips the first element
[,, ... remainingCars] = carIds;
//console.log(car, remainingCars);
console.log(remainingCars);


