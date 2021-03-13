import React from 'react';
import ReactDOM from 'react-dom';

class Header extends React.Component{
    constructor(props) {
        super(props);
        this.state = {favouriteColour:"red"};
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return true;
    }

    changeColour = () => {
        this.setState({favouriteColour:"blue"})
    }
    render(){
        return(
            <div>
                <h1>My Favourite Colour is {this.state.favouriteColour}</h1>
                <button type="button" onClick={this.changeColour}>Change Colour</button>
            </div>
        );
    }


}

ReactDOM.render(<Header/>, document.getElementById('root'))
