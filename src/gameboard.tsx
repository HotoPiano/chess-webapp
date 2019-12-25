import * as React from "react";
import "./App.css";
import Pos from "./Pos";
import Piece from "./piece";
import Bishop from "./bishop";
import Rook from "./rook";
import King from "./king";
import Queen from "./queen";
import Pawn from "./pawn";
import Knight from "./knight";
import open_field from "./img/open_field.png";
import Board from "./board";

export const GameBoard = (p: {
  board: Board;
  gameOver(blackCanMove: boolean, kingThreatened: boolean): void;
  setIsBlack(isBlack: boolean): void;
}) => {
  const [selectedPos, setSelectedPos] = React.useState<Pos>({ y: -1, x: -1 });
  const [moveOpportunities, setMoveOpportunities] = React.useState<number[][]>([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ]);

  const handleCellClick = (posClicked: Pos) => {
    if (p.board.stepsAhead < 0 || !p.board.isBlack) {
      // Piece is already selected, try action
      if (selectedPos.y != -1) {
        // Deselect already selected piece
        if (selectedPos.x == posClicked.x && selectedPos.y == posClicked.y) {
          showMoves(null);
        }
        // Piece already selected
        else {
          // Select other piece of same color
          if (
            p.board.pieces[posClicked.y][posClicked.x]?.isBlack ===
            p.board.isBlack
          ) {
            showMoves(posClicked);
          }
          // Actual move
          else if (
            p.board.pieces[selectedPos.y][selectedPos.x]?.canMove(
              selectedPos,
              posClicked,
              p.board.pieces
            ) &&
            !p.board.ownKingThreatenedByMove(selectedPos, posClicked)
          ) {
            move(selectedPos, posClicked);
          }
        }
      } else {
        // Select piece
        if (
          p.board.isBlack ===
          p.board.pieces[posClicked.y][posClicked.x]?.isBlack
        ) {
          //show opportunities
          showMoves(posClicked);
        }
      }
    }
  };

  const move = (from: Pos, to: Pos) => {
    p.board.movePiece(from, to);
    showMoves(null);
    p.setIsBlack(p.board.isBlack);
  };

  const moveAI = () => {
    let log = new Date();
    p.board.moveAI();
    showMoves(null);
    p.setIsBlack(p.board.isBlack);
    console.log(
      "AI round: " +
        Math.round(new Date().getTime() - log.getTime()) +
        " milliseconds"
    );
  };

  React.useEffect(() => {
    let gameOver = p.board.checkIfGameDone();
    if (gameOver != null) {
      p.board.enemyMoveFrom = { y: -1, x: -1 };
      p.board.enemyMoveTo = { y: -1, x: -1 };
      p.gameOver(gameOver.kingisBlack, gameOver.kingThreatened);
    }
    // If AI and next player to move is black, automate next move
    else if (p.board.stepsAhead > 0 && p.board.isBlack) {
      moveAI();
    }
  }, [move, moveAI]);

  const showMoves = (posClicked: Pos | null) => {
    let tmpMoveOpportunities: number[][] = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (
          (p.board.enemyMoveFrom.x == x && p.board.enemyMoveFrom.y == y) ||
          (p.board.enemyMoveTo.x == x && p.board.enemyMoveTo.y == y)
        ) {
          tmpMoveOpportunities[y][x] = 3;
        }
        if (
          posClicked != null &&
          p.board.pieces[posClicked.y][posClicked.x]?.canMove(
            posClicked,
            { y: y, x: x },
            p.board.pieces
          )
        ) {
          if (
            p.board.pieces[y][x] != null &&
            p.board.pieces[y][x]?.isBlack !=
              p.board.pieces[posClicked.y][posClicked.x]?.isBlack
          ) {
            tmpMoveOpportunities[y][x] = 2;
          } else {
            tmpMoveOpportunities[y][x] = 1;
          }
        } else {
        }
      }
    }
    setMoveOpportunities(tmpMoveOpportunities);
    setSelectedPos(posClicked ?? { y: -1, x: -1 });
  };

  let Cells = [];
  let num = 0;
  for (let y = 0; y < 8; y++) {
    let row = [];
    for (let x = 0; x < 8; x++) {
      row.push(
        <div>
          <Cell
            id={num}
            pos={{ y, x }}
            isSelected={selectedPos.y == y && selectedPos.x == x}
            enemyMove={moveOpportunities[y][x] === 3}
            canKill={moveOpportunities[y][x] === 2}
            canMove={moveOpportunities[y][x] === 1}
            imgPath={p.board.pieces[y][x]?.getImage()}
            handleCellClick={handleCellClick}
          ></Cell>
        </div>
      );
      num++;
    }
    Cells.push(<div className="row"> {row} </div>);
  }

  return <div className="board">{Cells}</div>;
};

const Cell = (p: {
  id: number;
  pos: Pos;
  isSelected: boolean;
  enemyMove: boolean;
  canKill: boolean;
  canMove: boolean;
  imgPath: string | undefined;
  handleCellClick(pos: Pos): any;
}) => {
  return (
    <button
      key={p.id}
      onClick={() => p.handleCellClick(p.pos)}
      className={
        "cell" +
        (p.enemyMove
          ? " cell--enemy-move"
          : p.canKill
          ? " cell--can-kill"
          : p.canMove
          ? " cell--can-move"
          : (p.pos.y % 2 === 0 && p.pos.x % 2 === 0) ||
            (p.pos.y % 2 === 1 && p.pos.x % 2 === 1)
          ? " cell--dark"
          : " cell--bright")
      }
    >
      <img
        className={"piece" + (p.isSelected ? " piece--selected" : "")}
        src={p.imgPath ?? open_field}
        alt={"piece"}
      ></img>
    </button>
  );
};
