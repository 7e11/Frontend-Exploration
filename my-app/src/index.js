import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
  return (
    <button className="square" 
    onClick={props.onClick} 
    style={{backgroundColor: props.win ? 'Gold' : 'initial'}}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square 
        value={this.props.squares[i]} 
        // The board provides an onClick function to the square
        // so the square delegates the handling of it's clicking to the board
        // However, we then delegate the onClick functionality to the function
        // onClick which was passed to us by Game
        onClick={() => this.props.onClick(i)}
        win={this.props.winningSquares.includes(i)}
      />
    );
  }

  render() {
    let board = [];
    for (let i = 0; i < 9; i += 3) {
      let row = [];
      for (let j = 0; j < 3; j++) {
        row.push(this.renderSquare(i + j));
      }
      board.push(<div className="board-row">{row}</div>)
    }
    return (<div>{board}</div>);
  }
}

class Game extends React.Component {
  // Lifting state from the board to the Game
  // So we can display history easily.
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        move_loc: null,
      }],
      stepNumber: 0,
      // The first move is X by default
      xIsNext: true,
    }
  }

  handleClick(i) {
    // If we make a new move after going back in time, 
    // we need to rewrite the previous "future"
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    // This creates a copy of squares in our state
    const squares = current.squares.slice();
    // If someone has won, or if a square is filled already, do nothing.
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        move_loc: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    // We define this component now, but render it after the board.
    const moves = history.map((step, move) => {
      // If move is zero, the state is "game start"
      const desc = move ?
        'Go to move #' + move + ' (' + (Math.floor(step.move_loc / 3) + 1) + ', ' + ((step.move_loc % 3) + 1) + ')':
        'Go to game start';
      // If we're at this move, bold the entry in the list
      if (move === this.state.stepNumber) {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)} style={{fontWeight: 'bold'}}>{desc}</button>
          </li>
        )
      }
      // Else, just reutrn as normal.
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    })

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (this.state.stepNumber === 9 && !winner) {
      status = 'Draw'
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningSquares={winningSquares(current.squares)}
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

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function winningSquares(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    //  a is not null AND a = b AND a = c
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c]
    }
  }
  return [];
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
