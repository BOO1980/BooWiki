
var demo = {score:0};
var	scoreDisplay = document.getElementById("scoreDisplay");

//create a tween that changes the value of the score property of the demo object from 0 to 100 over the course of 20 seconds
							
var tween = TweenLite.to(demo, 10, {score: 100, onUpdate:showScore})

function showScore(){
	scoreDisplay.innerHTML = demo.score.toFixed(1);
}