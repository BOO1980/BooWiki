import React from "react";
import ReactDOM from "react-dom";
import './index.css';

/**
 * Renders a single button
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function Square(props){
    /**
     *
     */
    return(
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button> 
    );
}

/**
 * Renders nine squares
 * The Board component can tell each square what to display by passing a prop
 * To collect data from multiple children, or to have two child components communicate with each other,
 * you need to decare the shared state in their parent component instead
 * The parent component can pass the state back down to the children by using props, this keeps the child
 * components in sync with each other adn with the parent component
 */
class Board extends React.Component{
    /**
     *
     * @param i: value
     * @returns {JSX.Element}
     */
    renderSquare(i){
        return (
            <Square
                value={this.props.squares[i]}
                onClick={()=> this.props.onClick(i)}
            />
        );
    }
    render(){
        return(
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

/**
 * Renders a board
 */
class Game extends React.Component{
    /**
     * To remember things we use the state
     * React components can have state by setting this.state in their constructors
     * this.state should be considered as private
     * Here we have added a constructor to the class to initialise the state
     * In our Javascript classes you always need to call super when defining a constructor of a subclass
     * All React component classes that have a constructor should start with a super(props)call
     * @param props
     */
    constructor(props) {
        super(props);
        this.state={
            history:[{
                squares:Array(9).fill(null),
            }],
            stepNumber:0,
            xIsNext:true,
        };
    }
    handleClick(i){
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length-1];
        const squares = current.squares.slice();
        if(calculateWinner(squares)||squares[i]){
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        /*When you call setState in a component React automatically updates the child components inside of it too*/
        this.setState({
            history:history.concat([{
                squares:squares
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }
    jumpTo(step){
        this.setState({
            stepNumber:step,
            isNext:(step % 2) ===0,
        });
    }

    /**
     * A render method returns a description of what you want to see on the screen
     * React takes the description and displays the result.
     * Render returns a React element, which is a lightweight description of what to render
     * Most react developers use a special syntax called 'JSX' which makes these structures easier to write
     * @returns {JSX.Element}
     */
    render(){
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const moves =  history.map((step, move) =>{
            const desc = move?
                'go to move #' + move:
                'gp to game start';
            return(
                <li>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if(winner){
            status = 'Winner ' + winner;
        }else{
            status = 'Next player ' + (this.state.xIsNext ? 'X' : '0');
        }
        return(
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

/**
 * Called in the boards render to check if the player has wont
 * @param squares
 * @returns {null|*}
 */
function calculateWinner(squares){
    const lines = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6],
    ];
    for(let i=0; i < lines.length; i++){
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}


ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
