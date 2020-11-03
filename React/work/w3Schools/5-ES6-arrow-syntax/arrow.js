hello1 = ()=>{
    return "Hello World!";
}

/*this works if the function only has one statement*/
hello2 = () => "helloooo weirdo";

hello3 = val => "heloooooohaaaaar" + val;
document.getElementById("demo1").innerHTML = hello1();
document.getElementById("demo2").innerHTML = hello2();
document.getElementById("demo3").innerHTML = hello3("paaaaaah");