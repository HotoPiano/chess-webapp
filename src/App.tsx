import * as React from "react";
import "./App.css";
import { Board } from "./board";
import { ModalPopup, ModalState } from "./modal";
import Piece from "./piece";
import Bishop from "./bishop";
import Rook from "./rook";
import King from "./king";
import Queen from "./queen";
import Pawn from "./pawn";
import Knight from "./knight";

const App: React.FC = () => {
  const [gameOverText, setGameOverText] = React.useState();
  const [ongoingGame, setOnGoingGame] = React.useState(true);
  const [isBlack, setIsBlack] = React.useState(false);
  const [isEasyAI, setIsEasyAI] = React.useState(false);

  const getPiecesInitialState = (): (Piece | null)[][] => {
    return [
      [
        new Rook(true),
        new Knight(true),
        new Bishop(true),
        new Queen(true),
        new King(true),
        new Bishop(true),
        new Knight(true),
        new Rook(true)
      ],
      [
        new Pawn(true),
        new Pawn(true),
        new Pawn(true),
        new Pawn(true),
        new Pawn(true),
        new Pawn(true),
        new Pawn(true),
        new Pawn(true)
      ],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [
        new Pawn(false),
        new Pawn(false),
        new Pawn(false),
        new Pawn(false),
        new Pawn(false),
        new Pawn(false),
        new Pawn(false),
        new Pawn(false)
      ],
      [
        new Rook(false),
        new Knight(false),
        new Bishop(false),
        new Queen(false),
        new King(false),
        new Bishop(false),
        new Knight(false),
        new Rook(false)
      ]
    ];
  };
  const onSetPieces = (pieces: (Piece | null)[][]) => {
    setPieces(pieces);
  };

  let [pieces, setPieces] = React.useState<(Piece | null)[][]>(
    getPiecesInitialState
  );

  let [modalState, setModalState] = React.useState<ModalState>({
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
      leftButton: { text: "Local player", action: startGameHuman },
      rightButton: { text: "Easy AI", action: startGameEasyAI }
    });
  };

  const startGameHuman = () => {
    setOnGoingGame(true);
    setIsEasyAI(false);
    setIsBlack(false);
    setPieces(getPiecesInitialState);
  };

  const startGameEasyAI = () => {
    setOnGoingGame(true);
    setIsEasyAI(true);
    setIsBlack(false);
    setPieces(getPiecesInitialState);
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
      return (
        <div className="board--column__header">
          <h1>Current player: {isBlack ? "black" : "white"}</h1>
        </div>
      );
    } else {
      return (
        <div className="board--column__header">
          <h1>{gameOverText}</h1>
          <button onClick={askForOpponent}>Start game</button>
        </div>
      );
    }
  };

  return (
    <div className="game">
      <div className="board--column">
        <Header />
        <Board
          pieces={pieces}
          setPieces={onSetPieces}
          isBlack={isBlack}
          setIsBlack={setIsBlack}
          gameOver={onGameOver}
          isEasyAI={isEasyAI}
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
