//Prototype class <-- most efficient when you create instance of reel, symbols (alot)

Reel = function(){
	PIXI.Container.call(this);
	this.symbols = [];
	this.state = 'idle';
}

Reel.prototype = Object.create(PIXI.Container.prototype);
Reel.prototype.constructor = Reel;









Reel.prototype.init = function(){
	//init class
}

Reel.prototype.spin = function(){
  //spin forward
}

ReverseReel = function(){
	Reel.call(this);
	this.symbols = [];
	this.state = 'idle';
}
ReverseReel.prototype = Object.create(Reel.prototype);
ReverseReel.prototype.constructor = ReverseReel;

ReverseReel.prototype.spin = function(){
	//spin back
}

//Closure class <- loads everything, singleton - one of 
function Reel(){
	var symbols = [];
	var state = 'idle';
	function init(){

	}
	function spin() {
	
	}
	return{
		init:init
	}
}

var newReel = new Reel()

var obj = {
	name:'haley',
	age:'',
	address:''
}
var arr = [{a:'1',b:'x'},{a:'2',b:'x'},{a:'3',b:'x'},{a:'4',b:'x'},{a:'5',b:'x'},{a:'6',b:'x'}]

for(var i =0;i<arr.length;i++){
	console.log(arr[i].a)
	console.log(arr[i].b)
}

for(var i =0;i<arr.length;i++){
	var element = arr[i]
	console.log(element.a)
	console.log(element.b)
}