import logo from './logo.svg';
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

function Hello(){
  return React.createElement('div',null,'Hello React!!!') //the first prop is the kind of element , the second prop is the attribute of that element. the third prop is the child of that element
  //return <div>Hello React</div>; //returning the div element, so when the function is called the contents is returned, Babel is converting this to JSX
}

function Button(){
  return React.createElement('button',null,"TEST")
}

export default Button;
//export default App;
