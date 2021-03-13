import React from 'react';
import ReactDOM from 'react-dom';

function shoot(){
    alert("Great Shot Yo!")
}

const myelement = (
    <button onClick={shoot}>Take the shot!</button>
)
ReactDOM.render(myelement,document.getElementById('root'));