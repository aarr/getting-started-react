import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// 関数コンポーネント
// 通常はReact.Componetを継承したClassを定義する。
// 引数にprops（コンポーネントへ受け渡している属性群）を受け取り、
// returnを実装するのみでOK
function Square(props) {
  const clazz = ["square"];
  if (props.isEndTurn) {
    clazz.push("end-turn");
  }
  return (
    <button className={clazz.join(" ")} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  // 関数指定：例３用のサンプル実装
  /*
  constructor(props) {
    super(props);
    // ３−１.実行コンテキストをbind
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    // do nothing
  }
  // ３−２.フィールドとして定義
  onClick = function() {
    // do nothing
  }
  */

  renderSquare(i) {
    // 通常関数を利用の為、Reactオブジェクトを退避
    // const _this = this;
    return (
      <Square
        key={i}
        // Reactオブジェクトからpropsの利用が可能
        // propsを利用することでコンポーネントを生成する際に、指定された属性情報の取得が可能
        value={this.props.borad.squares[i]}
        // 関数指定：例１
        // Arrow関数を利用 → コンテキストがReactオブジェクト
        onClick={() => {
          this.props.onClick(i);
        }}
        isEndTurn={
          this.props.borad.isDecidedWinner && this.props.borad.value === i
        }

        // 関数指定：例２
        // 通常の関数を利用 → コンテキストがReactオブジェクトでない
        // その為、Reactオブジェクトを退避しておき利用する必要がある
        /*
        onClick={function () {
          _this.props.onClick(i);
        }}
        */

        // 関数指定：例３
        // 関数を参照するには、実行コンテキストにReactオブジェクトをbindしておく
        /*
       onClick{this.onClick}
       */
      />
    );
  }

  render() {
    const rows = [...Array(this.props.size)].map((rVal, rIndex) => {
      let cols = [...Array(this.props.size)].map((cVal, cIndex) =>
        this.renderSquare(this.props.size * rIndex + cIndex)
      );
      return (
        <div key={rIndex} className="board-row">
          {cols}
        </div>
      );
    });
    return <div>{rows}</div>;
  }
}

class Game extends React.Component {
  // コンストラクタ
  constructor(props) {
    super(props);
    // Gameコンポーネント内でPrivateとみなすべきもの
    // 状態を保持できる。
    const size = Number(props.size);
    // 縦、横、斜の勝利ラインの要素配列生成
    const victoryLines = [...Array(size)]
      // 横
      .map((iVal, iIndex) =>
        [...Array(size)].map((jVal, jIndex) => size * iIndex + jIndex)
      )
      // 縦
      .concat(
        [...Array(size)].map((iVal, iIndex) =>
          [...Array(size)].map((jVal, jIndex) => iIndex + size * jIndex)
        )
      )
      // 斜
      .concat(
        Array.of([...Array(size)].map((iVal, iIndex) => (size + 1) * iIndex))
      )
      .concat(
        Array.of(
          [...Array(size)].map((iVal, iIndex) => (size - 1) * (iIndex + 1))
        )
      );

    this.state = {
      size: size,
      history: [
        {
          squares: Array(size * size).fill(null),
          value: null,
          isFinished: false,
        },
      ],
      isHistorySortAsc: true,
      xIsNext: true,
      currentStepNumber: 0,
      isGameOver: false,
      victoryLines: victoryLines,
    };
  }

  handleClick(value) {
    const history = this.state.history.slice(
      0,
      this.state.currentStepNumber + 1
    );
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    // 勝敗が決している、もしくは既に選択済の要素指定
    if (calculateWinner(squares, this.state.victoryLines) || squares[value]) {
      return;
    }

    squares[value] = this.state.xIsNext ? "X" : "Ｏ";

    // setStateすることで再描画（reander）される
    this.setState({
      history: history.concat([{ squares: squares, value: value }]),
      currentStepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      isGameOver:
        this.state.history.length >= this.state.size * this.state.size - 1,
    });
  }

  jumpTo(step) {
    // setStateすることで再描画（reander）される
    this.setState({
      currentStepNumber: step,
      xIsNext: step % 2 === 0,
      isGameOver: false,
    });
  }

  reverseHistory() {
    this.setState({
      isHistorySortAsc: !this.state.isHistorySortAsc,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.currentStepNumber];
    const winner = calculateWinner(current.squares, this.state.victoryLines);

    const steps = history.map((board, step) => {
      const clazz = this.state.currentStepNumber === step ? "current-turn" : "";
      const value = board.value;
      const col = (value % this.state.size) + 1;
      const row = Math.floor(value / this.state.size) + 1;
      const desc = step
        ? `Go to move #${step} => (${col}, ${row}):${board.squares[value]}`
        : `Go to game start`;
      return (
        <li key={step}>
          <button onClick={() => this.jumpTo(step)} className={clazz}>
            {desc}
          </button>
        </li>
      );
    });
    if (!this.state.isHistorySortAsc) {
      steps.reverse();
    }

    let status;
    if (this.state.isGameOver) {
      status = "引き分けです";
    } else if (winner) {
      status = `Winner: ${winner}`;
      current.isDecidedWinner = true;
    } else {
      status = `Next player: ${this.state.xIsNext ? "Ｘ" : "Ｏ"}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            borad={current}
            onClick={(i) => this.handleClick(i)}
            size={this.state.size}
          />
        </div>
        <div className="game-info">
          <div className="status">{status}</div>
          <button onClick={() => this.reverseHistory()}>Reverse History</button>
          <ol>{steps}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares, lines) {
  const size = lines[0].length;
  // ライン上の全ての要素が同じ値であるかを判定する
  const result = lines.find((line) => {
    const firstElem = squares[line[0]];
    if (firstElem) {
      return size === line.filter((elem) => firstElem === squares[elem]).length;
    } else {
      return false;
    }
  });
  return result ? squares[result[0]] : null;
}
// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game size="3" />);
