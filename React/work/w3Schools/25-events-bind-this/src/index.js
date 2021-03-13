import React from 'react';
import ReactDOM from 'react-dom';

class Football extends React.Component{
    shoot = () => {
        alert(this);

        /*
    The 'this' keyword refers to the component object
 */
    }

    render(){
        return(
            <button onClick = {this.shoot}>Take the shot!</button>
        );
    }
}

ReactDOM.render(<Football/>, document.getElementById('root'));