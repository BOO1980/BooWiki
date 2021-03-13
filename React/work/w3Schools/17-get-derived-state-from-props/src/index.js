import React from 'react';
import ReactDOM from 'react-dom';


class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {favouriteColour:"red"};
    }
    static getDerivedStateFromProps(props,state){
        return {favouriteColour: props.favcol};
    }
    render(){
        return(
            <div>
                <h1>My Favorite Colour is {this.state.favouriteColour}</h1>
                <button type = "button" onClick={this.changeColour}>Change Colour</button>
            </div>
        );
    }
}

ReactDOM.render(<Header favcol = "yellow"/>, document.getElementById('root'));