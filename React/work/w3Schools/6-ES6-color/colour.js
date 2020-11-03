class Header{
    constructor() {
        this.color = "Red";
    }
}

//Arrow function
changeColor = () =>{
    document.getElementById("demo").innerHTML += this;
}
myheader = new Header();

//this window object calls the function
window.addEventListener("load",)