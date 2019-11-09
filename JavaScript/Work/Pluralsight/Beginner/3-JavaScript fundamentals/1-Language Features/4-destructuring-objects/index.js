let car = {id:5000, style:'convertible'};
let id, style;
({id, style} = car); //we use curly braces to destructure an object

console.log(id, style);

