//Object lets store related information together
let person = {
	name: "John",
	age: 32,
	partTime: false
}

console.log(person.name); //access a property within an object use a dot
console.log(person.age);
console.log(person.partTime);

let card = {
	suit: "Hearts",
	value:"Queen"
}

console.log(card.suit);
console.log(card.value);

function changeCard(card){
	card.suit = "Clubs";
}

changeCard(card);

console.log(card.suit);

let cards = [

	{
		suit:"Hearts",
		value:"Queen"
	},
	{
		suit:"Clubs",
		value:"King"
	}
];

console.log(cards[0].value + " of " + cards[0].suit);