var location1;
var location2;
var location3;
var guess;
var hits = 0;
var guesses = 0;
var isSunk = false;
startGame();


function startGame(){
	randomizeBattleShip();
	while(isSunk !== true){
		getGuess();
	}
}

function randomizeBattleShip(){
	location1=1
	location2=2
	location3=3
}

function getGuess(){
	guess = prompt("Ready, aim, five!(enter a number from 0-6");
	console.log(typeof guess);
	compareGuess(parseInt(guess));
}

function compareGuess(guess){
	if(typeof guess !== "number" || guess < 0 || guess > 6 || guess === 'NaN'){
		getGuess();
	}else{
		guesses += 1;
		if(guess === location1 || guess === location2 || guess === location3 ){
			hits += 1;
			alert("you hit me!");
			if(hits === 3){
				isSunk = true;
				alert("You sank my battleship!");
				gameEnds();
			}
		}
	}
}

function gameEnds(){

}