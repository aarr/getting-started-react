import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// 関数コンポーネント
// 通常はReact.Componetを継承したClassを定義する。
// 引数にprops（コンポーネントへ受け渡している属性群）を受け取り、
// returnを実装するのみでOK
function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    // 通常関数を利用の為、Reactオブジェクトを退避
    // const _this = this;
    return (
      <Square
        // Reactオブジェクトからpropsの利用が可能
        // propsを利用することでコンポーネントを生成する際に、指定された属性情報の取得が可能
        value={this.props.squares[i]}
        // Arrow関数を利用 → コンテキストがReactオブジェクト
        onClick={() => {
          this.props.onClick(i);
        }}

        // 通常の関数を利用 → コンテキストがReactオブジェクトでない
        // その為、Reactオブジェクトを退避しておき利用する必要がある
        /*
        onClick={function () {
          _this.props.onClick(i);
        }}
        */
      />
    );
  }

  render() {
    return (
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

class Game extends React.Component {
  // コンストラクタ
  constructor(props) {
    super(props);
    // Gameコンポーネント内でPrivateとみなすべきもの
    // 状態を保持できる。
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      xIsNext: true,
      currentStepNumber: 0,
    };
  }

  handleClick(value) {
    const history = this.state.history.slice(
      0,
      this.state.currentStepNumber + 1
    );
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[value]) {
      return;
    }
    squares[value] = this.state.xIsNext ? "X" : "Ｏ";

    // setStateすることで再描画（reander）される
    this.setState({
      history: history.concat([{ squares: squares }]),
      squares: squares,
      currentStepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    // setStateすることで再描画（reander）される
    this.setState({
      currentStepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.currentStepNumber];
    const winner = calculateWinner(current.squares);

    const steps = history.map((board, step) => {
      const desc = step ? `Go to move #${step}` : `Go to game start`;
      return (
        <li key={step}>
          <button onClick={() => this.jumpTo(step)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else {
      status = `Next player: ${this.state.xIsNext ? "Ｘ" : "Ｏ"}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div className="status">{status}</div>
          <ol>{steps}</ol>
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
// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
