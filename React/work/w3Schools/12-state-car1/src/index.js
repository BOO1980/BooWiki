import React from 'react';
import ReactDOM from 'react-dom';

class Car extends React.Component{
    constructor(props) {
        super(props);
        this.state = {brand:"Ford"};
    }
    render(){
        return(
            <div>
                <h1>My Car</h1>
            </div>
        );
    }
}

ReactDOM.render(<Car/>,document.getElementById('root'));