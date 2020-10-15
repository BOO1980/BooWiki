import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class ShoppingList extends React.Component{
    render(){
        return(
            <div className ="shopping-List">
                <h1>Shopping list for {this.props.name}</h1>
                <ul>
                    <li>Instagram</li>
                    <li>WhatsApp</li>
                    <li>Oculus</li>
                </ul>
            </div>
        );
    }
}

ReactDOM.render(
    <ShoppingList name ="Me"/>,
    document.getElementById('root')
)