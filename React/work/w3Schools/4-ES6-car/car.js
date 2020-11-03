class Car{
    constructor(name){
        this.brand = name;
    }
    /*You can add your own methods in a class*/
    present(){
        return 'I have a ' + this.brand;
    }
}

class Model extends Car{
    constructor(name, mod) {
        super(name);
        this.model = mod;
    }
    show(){
        return this.present() + ', it is a '+this.model
    }
}

mycar = new Model("Ford","Mustang");
document.write(mycar.show());