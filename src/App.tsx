import * as React from "react";
import "./App.css";
import { GameBoard } from "./gameboard";
import { ModalPopup, ModalState } from "./modal";
import Piece from "./piece";
import Bishop from "./bishop";
import Rook from "./rook";
import King from "./king";
import Queen from "./queen";
import Pawn from "./pawn";
import Knight from "./knight";
import Loader from "./loader";
import Board from "./board";

let board: Board = new Board(-1);
const App: React.FC = () => {
  const [gameOverText, setGameOverText] = React.useState();
  const [ongoingGame, setOnGoingGame] = React.useState(true);
  const [isBlack, setIsBlack] = React.useState(false);
  const [modalState, setModalState] = React.useState<ModalState>({
    active: false,
    title: "",
    message: "",
    leftButton: null,
    rightButton: null
  });

  const onCloseModal = () => {
    setModalState({
      active: false,
      title: "",
      message: "",
      leftButton: null,
      rightButton: null
    });
  };

  React.useEffect(() => {
    askForOpponent();
  }, []);

  const askForOpponent = () => {
    setModalState({
      active: true,
      title: "Chess!",
      message: "Who will be your opponent?",
      leftButton: { text: "Local player", action: () => startGame(-1) },
      rightButton: { text: "Easy AI", action: () => startGame(1) }
    });
  };

  const startGame = (stepsAhead: number) => {
    board = new Board(stepsAhead);
    setOnGoingGame(true);
  };

  const onGameOver = (blackCanMove: boolean, kingThreatened: boolean) => {
    let playerText: string = blackCanMove ? "White " : "Black ";
    setGameOverText(
      "Game over! " +
        (kingThreatened
          ? playerText + "player wins!"
          : playerText + "player cannot move, it's a draw!")
    );
    setOnGoingGame(false);
  };

  const Header = () => {
    if (ongoingGame) {
      if (board.stepsAhead > 0 && board.isBlack) {
        return (
          <div className="board--column__header">
            <h1>Calculating easy AI move...</h1>
            <Loader />
          </div>
        );
      } else {
        return (
          <div className="board--column__header">
            <h1>Current player: {board.isBlack ? "black" : "white"}</h1>
          </div>
        );
      }
    } else {
      return (
        <div className="board--column__header">
          <h1>{gameOverText}</h1>
          <button
            className="button__option button__header"
            onClick={askForOpponent}
          >
            <span className="button--text">New game</span>
          </button>
        </div>
      );
    }
  };

  return (
    <div className="game">
      <div className="board--column">
        <Header />
        <GameBoard
          board={board}
          gameOver={onGameOver}
          setIsBlack={setIsBlack}
        />
      </div>
      <ModalPopup
        modalState={modalState}
        closeModal={onCloseModal}
      ></ModalPopup>
    </div>
  );
};

export default App;
