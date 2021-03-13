import React from 'react';
import ReactDOM from 'react-dom';

class Header extends React.Component{
    constructor(props) {
        super(props);
        this.state = {favouriteColour:"red"}
    }
    componentDidMount() {
        setTimeout(() =>{
            this.setState({favouriteColour:"yellow"})
        },1000)
    }
    getSnapshotBeforeUpdate(prevProps, prevState) {
        document.getElementById("div1").innerHTML = "Before the update, the favourite was "+ prevState.favouriteColour;
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        document.getElementById("div2").innerHTML = "The updated favourite is " + this.state.favouriteColour;
    }
    render(){
        return(
            <div>
                <h1>My Favourite Colour is {this.state.favouriteColour}</h1>
                <div id="div1"></div>
                <div id="div2"></div>
            </div>
        );
    }
}

ReactDOM.render(<Header/>, document.getElementById('root'));