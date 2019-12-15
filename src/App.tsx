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
  let [isBlack, setIsBlack] = React.useState(false);
  let [isEasyAI, setIsEasyAI] = React.useState(false);

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

  const onSetPieces = (pieces: (Piece | null)[][]) => {
    setPieces(pieces);
  };

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
    setModalState({
      active: true,
      title: "Chess!",
      message: "Who will be your opponent?",
      leftButton: { text: "Local player", action: startGameHuman },
      rightButton: { text: "Easy AI", action: startGameEasyAI }
    });
  }, []);

  const startGameHuman = () => {
    setIsEasyAI(false);
    setPieces(getPiecesInitialState);
  };

  const startGameEasyAI = () => {
    setIsEasyAI(true);
    setPieces(getPiecesInitialState);
  };

  const onPlayerWin = (blackWins: boolean) => {
    setModalState({
      active: true,
      title: "Game ended! " + (blackWins ? "black" : "white") + " player wins.",
      message: "New game?",
      leftButton: { text: "Local player", action: startGameHuman },
      rightButton: { text: "Easy AI", action: startGameEasyAI }
    });
  };

  return (
    <div className="game">
      <div className="board--column">
        <div className="board--column__header">
          <h1>Current player: {isBlack ? "black" : "white"}</h1>
        </div>
        <Board
          pieces={pieces}
          setPieces={onSetPieces}
          isBlack={isBlack}
          setIsBlack={setIsBlack}
          playerWin={onPlayerWin}
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
