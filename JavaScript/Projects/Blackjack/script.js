/*
	Blackjack
	By Hayley Billingham
*/

/*Card variables*/
let suits = ['Hearts', 'Clubs', 'Diamonds','Spades'];
let values =['Ace','King','Queen','Jack','Ten','Nine','Eight','Seven','Six','Five','Four','Three','Two'];

/*DOM variables*/
let textArea = document.getElementById('text-area');
let newGameButton = document.getElementById('new-game-button');
let hitButton = document.getElementById("hit-button");
let stayButton = document.getElementById('stay-button');

/*Game Variables*/
let gameStarted = false;
let gameOver = false;
let playerWon = false;
let dealerCards = [];
let playerCards = [];
let dealerScore = 0;
let playerScore = 0;
let deck = [];

hitButton.style.display = 'none';
stayButton.style.display = 'none';
showStatus();

newGameButton.addEventListener('click',function(){
	gameStarted = true;
	gameOver  = false;
	playerWon = false;
	
	deck = createDeck(); //creates a deck of 52 cards
	//deckCheck();
	shuffleDeck(deck); //places created deck to be shuffled
	/*deckCheck();*/
	dealerCards = [getNextCard(), getNextCard()];
	playerCards = [getNextCard(), getNextCard()];

	newGameButton.style.display = 'none';
	hitButton.style.display = 'inline';
	stayButton.style.display = 'inline';
	showStatus();
	//textArea.innerText = 'Started...';
	
});


hitButton.addEventListener('click',function(){
	playerCards.push(getNextCard());
	checkForEndOfGame();
	showStatus();
})

stayButton.addEventListener('click',function(){
	gameOver = true;
	checkForEndOfGame();
	showStatus();
})

/*Every time we start a new game we want a deck of card*/
function createDeck(){
	//Clear deck
	let deck = [];	
	/*Loops through all the suits, and for each suit we are going to loop through all the values*/
	for (let suitIdx=0; suitIdx < suits.length; suitIdx ++){
			//nested loop
			for(let valueIdx=0; valueIdx < values.length; valueIdx++){
				//create a card object
				let card = {
					suit: suits[suitIdx],
					value: values[valueIdx]
				};
				deck.push(card);
			}
		}	
		return deck;
}

function shuffleDeck(){
	//Loops through every card in the deck
	for(let i = 0; i < deck.length; i++){
		/*Calculates an index with a card we can swap with
		we want to take one card of the deck and swap it with a random card*/
		let swapIdx  = Math.trunc(Math.random()* deck.length);
		//swapIdx = 10 of hearts
		let tmp = deck[swapIdx]; //temp holds on to deck swap index 
		//temp = 10 of hearts
		deck[swapIdx] = deck[i]; //we set deck swapindex to index i
	  	//deck = ace of hearts
	  	//swapIdx = ace of hearts
		deck[i] = tmp;  //then we set i to the card in the temp variable
		//tmp = 10 of hearts
	}
}

function getCardString(card){
	return card.value + ' of ' + card.suit;
}

function getNextCard(){
	//takes the first value off the deck and shift the rest of the cards down
	return deck.shift();
}

function getCardNumericValue(card){
	switch(card.value){
		case 'Ace' :
			return 1;
		case 'Two' :
			return 2;
		case 'Three' :
			return 3;
		case 'Four' :
			return 4;
		case 'Five' :
			return 5;
		case 'Ace' :
			return 6;
		case 'Seven' :
			return 7;
		case 'Eight' :
			return 8;
		case 'Nine' :
			return 9;
		default:
			return 10;
	}
}

function getScore(cardArray){
	let score = 0;
	let hasAce = false; //is worth 1 or 11 points
	for(let i = 0; i < cardArray.length; i++){
		let card = cardArray[i];
		score += getCardNumericValue(card);
		if(card.value === 'Ace'){
			hasAce = true;
		}
	}
	if(hasAce && score + 10 <= 21){
		return score + 10;
	}
	return score;
}

function updateScores(){
	dealerScore = getScore(dealerCards);
	playerScore = getScore(playerCards);
}

function checkForEndOfGame(){
	
	updateScores();

	if(gameOver){
		//let dealer take cards
		while(dealerScore < playerScore
			&& playerScore <=21
			&& dealerScore <=21) {
			dealerCards.push(getNextCard());
		updateScores();
		}
	}
	if(playerScore > 21){
		playerWon = false;
		gameOver = true;
	}
	else if(dealerScore > 21){
		playerWon = true;
		gameOver = true;
	}
	else if(gameOver){
		if(playerScore > dealerScore){
			playerWon = true;
		}else{
			playerWon = false;
		}
	}
}




/*Checks to see if the desk of cards was successfully created*/
/*function deckCheck(){
	for(deckIdx = 0; deckIdx < deck.length; deckIdx	++ ){
		console.log(deck[deckIdx]);
	}
}*/

/*Status of the game*/
function showStatus(){
	if(!gameStarted){
		textArea.innerText = 'Welcome to Blackjack!'
		return;
	}

	let dealerCardString = '';
	for(let i=0; i < dealerCards.length; i++){
		dealerCardString += getCardString(dealerCards[i]) + '\n';
	}

	let playerCardString = '';
	for(let i=0; i < playerCards.length; i++){
		playerCardString += getCardString(playerCards[i]) + '\n';

	updateScores();

	textArea.innerText = 
	'Dealer has: \n' + dealerCardString + 'score: ' + dealerScore + ')\n\n'
	+
	'Player has:\n' + playerCardString + '(score: ' + playerScore + ')\n\n';


	if(gameOver){
		if(playerWon){
			textArea.innerText += "YOU WIN!";
		}
		else{
			textArea.innerText += "DEALER WINS";
		}
		newGameButton.style.display = 'inline';
		hitButton.style.display = 'none';
		stayButton.style.display = 'none';
		}
	}
}




//let playerCards = [getNextCard(), getNextCard()];


// console.log("Welcome to Blackjack!");
// console.log("  " + getCardString(playerCards[0]));
// console.log("  " + getCardString(playerCards[1]));
// console.log("There are " + deck.length + " cards in a deck")


/*Recommendations*/
	//chips
	//min bet