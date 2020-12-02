import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

class Car extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            brand: "Ford",
            model: "Mustang",
            color: "red",
            year: 1964
        };
    }
    changeColor = () => {
        this.setState({color:"blue"});
    }
    render(){
        return(
            <div>
                <h1>My {this.state.brand}</h1>
                <p>It is a {this.state.color}
                    {this.state.mdoel}
                from {this.state.year}</p>
                <button
                    type = "button"
                    onClick = {this.changeColor}>
                    Change color
                </button>
            </div>
        );
    }
}


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
