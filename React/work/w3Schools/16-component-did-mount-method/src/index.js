import React from 'react';
import ReactDOM from 'react-dom';

class Header extends React.Component{
    constructor(props) {
        super(props);
        this.state = {favoritecolor:"red"}
    }
    componentDidMount() {
        setTimeout(()=>{
            this.setState({favoritecolor:"yellow"})
        },9000)
    }
    render(){
        return(
            <h1>My Favorite Color is {this.state.favoritecolor}</h1>
        );
    }
}
ReactDOM.render(<Header/>, document.getElementById('root'));