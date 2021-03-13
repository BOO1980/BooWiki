import React from 'react';
import ReactDOM from 'react-dom';

class Header extends React.Component{
    constructor(props) {
        super(props);
        this.state = {favouriteColour: "red"};
    }
    componentDidMount() {
        setTimeout(() => {
            this.setState({favouriteColour:"yellow"})
        },1000)
    }
    componentDidUpdate(){
        document.getElementById("myDiv").innerHTML =
            "The updated favourite is " + this.state.favouriteColour;
    }
    render(){
        return(
            <div>
                <h1>My Favourite Colour is {this.state.favouriteColour}</h1>
                <div id="myDiv"></div>
            </div>
        );
    }
}
ReactDOM.render(<Header/>,document.getElementById('root'));