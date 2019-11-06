/*Creates an array*/
var fruits = ['Apple','Banana'];
var pos = 1, n = 2;
console.log("there are " + fruits.length + " elements in the fruits array"); //2

/*Access(index into) an Array Item*/
var first = fruits[0];
console.log("The first element of the fruits array is " + first );
document.getElementById('firstFruit').innerHTML = first;
var last = fruits[fruits.length - 1];
console.log("The last element of the fruit array is " + last);
document.getElementById('lastFruit').innerHTML = last;

function arrayLoop(arrayName){
	console.log("LOOPING OVER THE ARRAY");
	/*Loop over an Array*/ 
	arrayName.forEach(function(item, index, array){
		console.log(item, index);
		}
	)
}

var moreFruits = ["Banana","Orange","Apple","Mango"];

function fruitLoops(arrayName, idname){
	var text = "<ul>";
	document.getElementById(idname).innerHTML = text;
	
	for(i=0; i < fruits.length; i++){
		document.getElementById(idname).innerHTML = text +="<li>" + fruits[i] + "</li>";
	}
	text = "</ul>"
}

fruitLoops(moreFruits,'aList');

/*Add to the end of an Array*/
var newLength = fruits.push('Lemon')
console.log("the new length is " + newLength);

fruitLoops(moreFruits,'bList');

/*Remove from the end of an Array*/
var last = fruits.pop(); //remove orange from the array
console.log();

arrayLoop(fruits);

/*Remove from the front of an Array*/
fruits.shift();
arrayLoop(fruits);


/*Add to the front of an array*/
fruits.unshift('Strawberry');
arrayLoop(fruits);

/*Find the indexd of an item in the Array*/
fruits.push('Mango');
console.log("The index of banana is " + fruits.indexOf('Banana'));

/*Remove an item by index position*/
fruits.splice(1, 1);
arrayLoop(fruits);

/*Removes items from an index position*/
var vegetables = ['Cabbage','Turnip','Radish','Carrot'];
arrayLoop(vegetables);

/*	
	This how to remove items, n defines the number of items to be removed,
	From that position(pos) onward to the end of the array
*/
var removedItems = vegetables.splice(pos, n);
arrayLoop(vegetables);

console.log(removedItems);

/*Makes a copy of the array*/
var fruitDuplicate = fruits.slice();
arrayLoop(fruitDuplicate);

var msgArray = [];
msgArray[0] = 'Hello';
msgArray[99] = 'world';

if(msgArray.length === 100){
	console.log('The length is 100');
}

//Two dimensional array
var board = [
	['R','N','B','Q','K','B','N','R'],
	['P','P','P','P','P','P','P','P'],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	['p','p','p','p','p','p','p','p'],
	['r','n','b','q','k','b','n','r']
]

function updateDoc(idname){
	document.getElementById(idname).innerHTML = (board.join('<br>') + '<br><br>');
}

updateDoc('chess1');

//console.log(board.join('\n') + '\n\n');
//Moves King pawn forward 2
board[4][4] = board[6][4];
board[6][4] = ' ';
console.log(board.join('<br>'));

updateDoc('chess2');

/*tabulate*/
values = [];
for (var x = 0; x < 10; x++){
	values.push([2 ** x,
		2 * x ** 2
		])
};

console.table(values)
