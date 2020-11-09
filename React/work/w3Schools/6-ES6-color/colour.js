class Header{
    constructor() {
        this.color = "Red";
    }
    //Arrow function
    changeColor = function(){
        document.getElementById("demo").innerHTML += this;
    }
}
myheader = new Header();

//this window object calls the function
    window.addEventListener("load",myheader.changeColor);
    document.getElementById("btn").addEventListener("click",myheader.changeColor);


