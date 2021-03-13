import React from 'react';
import ReactDOM from 'react-dom';

class Header extends React.Component{
    render(){
        return(
            <h1>This is the content of the Header component</h1>
        );
    }
}

ReactDOM.render(<Header/>,document.getElementById('root'));