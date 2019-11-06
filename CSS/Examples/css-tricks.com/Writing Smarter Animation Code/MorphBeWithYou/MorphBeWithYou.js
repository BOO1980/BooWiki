TweenLite.defaultEase = Power3.easeInOut;

var master = new TimelineMax({delay:0.5, repeat:-1, repeatDelay:0.5});
var mt = 0.85;
var et = Power2.easeOut;

TweenMax.set("#demo",{autoAlpha:1});

function flyBy(){
	var tl = new TimeLineMax();
	tl.add("fighter");
	return tl;
}


