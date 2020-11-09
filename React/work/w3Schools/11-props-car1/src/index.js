import React from 'react';
import ReactDOM from 'react-dom';

class Car extends React.Component{
    render(){
        return <h2>I am a {this.props.brand.model}!</h2>
    }
}
class Garage extends React.Component{
    render() {
        return(
            <div><h1>
                Who Lives in my garage?</h1>
                <Car brand="Ford"/></div>
        )
    }
}

class GarageVar extends React.Component{
    render() {
        const carName = "PooCar";
        return(
            <div><h1>Who Lives in my Garage?</h1>
            <Car brand={carName}/></div>
        )
    }
}

class CarConstructorProps extends React.Component{
    constructor(props) {
        super(props);
    }
    render() {
        return <h2>I am a {this.props.model}!</h2>
    }
}
class GarageObj extends React.Component {
    render() {
        const carinfo = {name: "Ford", model: "Mustang"};
        return (
            <div>
                <h1>Who lives in my garage?</h1>
                <Car brand={carinfo} />
            </div>
        );
    }
}


const myElement = <Car brand="Ford"/>



//ReactDOM.render(myElement, document.getElementById('root'));
//ReactDOM.render(<GarageObj/>,document.getElementById('root'))
ReactDOM.render(
    <CarConstructorProps model="amazingCarModel"/>, document.getElementById('root')
)