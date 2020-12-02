import React from 'react';
import ReactDOM from 'react-dom';

class Car extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            brand: "Ford",
            model: "Mustang",
            color: "Red",
            year: 1964
        };
    }
    render(){
        return(
            <div>
                <h1>My {this.state.brand}</h1>
                <p>
                    It is a {this.state.color}
                    {this.state.model}
                    from {this.state.year}
                </p>
            </div>
        );
    }
}

ReactDOM.render(
  <React.StrictMode>
    <Car />
  </React.StrictMode>,
  document.getElementById('root')
);

