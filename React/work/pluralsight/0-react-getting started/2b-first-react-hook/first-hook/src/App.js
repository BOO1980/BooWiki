import logo from './logo.svg';
import React, {useState} from 'react';
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

function logRandom(){
  console.log(Math.random());
}

function Button(){
  const[counter,setCounter] = useState(0);
  return <button onClick={()=>setCounter(counter+1)}>{counter}</button>;
}

function ButtonDouble(){
  const [counter,setCounter] = useState(5);
  return <button onClick={()=>setCounter(counter *2)}>{counter}</button>;
}

export default ButtonDouble;
