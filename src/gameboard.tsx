import * as React from "react";
import "./App.css";
import Pos from "./Pos";
import open_field from "./img/open_field.png";
import Board from "./board";
import { useDrag, DndProvider, useDrop, DragPreviewImage } from "react-dnd";
import Backend from "react-dnd-html5-backend";

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

  const handleCellSelect = (posClicked: Pos) => {
    if (p.board.stepsAhead < 0 || !p.board.isBlack) {
      // Select piece
      if (
        p.board.isBlack === p.board.pieces[posClicked.y][posClicked.x]?.isBlack
      ) {
        //show opportunities
        showMoves(posClicked);
      }
    }
  };

  const handleCellDeselect = (posClicked: Pos) => {
    if (p.board.stepsAhead < 0 || !p.board.isBlack) {
      // Piece is already selected, try action
      // Deselect already selected piece
      if (selectedPos.x === posClicked.x && selectedPos.y === posClicked.y) {
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
        } else {
          showMoves(null);
        }
      }
    }
  };

  /*
  const handleCellDrop = (to: Pos) => {
    if (p.board.stepsAhead < 0 || !p.board.isBlack) {
      if (
        p.board.pieces[selectedPos.y][selectedPos.x]?.canMove(
          selectedPos,
          to,
          p.board.pieces
        ) &&
        !p.board.ownKingThreatenedByMove(selectedPos, to)
      ) {
        move(selectedPos, to);
      }
    }
  };
  */

  const move = (from: Pos, to: Pos) => {
    p.board.movePiece(from, to);
    p.setIsBlack(p.board.isBlack);
    p.board.enemyMoveFrom = { y: -1, x: -1 };
    p.board.enemyMoveTo = { y: -1, x: -1 };
    showMoves(null);
  };

  const moveAI = () => {
    let log = new Date();
    p.board.moveAI();
    p.setIsBlack(p.board.isBlack);
    showMoves(null);
    console.log(
      "AI round: " +
        Math.round(new Date().getTime() - log.getTime()) +
        " milliseconds"
    );
  };

  React.useEffect(() => {
    let gameOver = p.board.checkIfGameDone();
    if (gameOver != null) {
      p.gameOver(gameOver.kingisBlack, gameOver.kingThreatened);
    }
    // If AI and next player to move is black, automate next move
    else if (p.board.stepsAhead > 0 && p.board.isBlack) {
      setTimeout(() => moveAI(), 500);
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
          (p.board.enemyMoveFrom.x === x && p.board.enemyMoveFrom.y === y) ||
          (p.board.enemyMoveTo.x === x && p.board.enemyMoveTo.y === y)
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
            p.board.pieces[y][x]?.isBlack !==
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
        <div key={num}>
          <BoardSquare
            id={num}
            pos={{ y, x }}
            currentPlayerPiece={
              p.board.isBlack === p.board.pieces[y][x]?.isBlack
            }
            enemyMove={moveOpportunities[y][x] === 3}
            canKill={moveOpportunities[y][x] === 2}
            canMove={moveOpportunities[y][x] === 1}
            imgPath={p.board.pieces[y][x]?.getImage() ?? open_field}
            selectedPos={selectedPos}
            handleCellSelect={handleCellSelect}
            handleCellDeselect={handleCellDeselect}
          ></BoardSquare>
        </div>
      );
      num++;
    }
    Cells.push(
      <div className="row" key={num + 100}>
        {" "}
        {row}{" "}
      </div>
    );
  }
  return (
    <DndProvider backend={Backend}>
      {" "}
      <div className="board">{Cells}</div>
    </DndProvider>
  );
};

const BoardSquare = (p: {
  id: number;
  pos: Pos;
  currentPlayerPiece: boolean;
  enemyMove: boolean;
  canKill: boolean;
  canMove: boolean;
  imgPath: string;
  selectedPos: Pos;
  handleCellSelect(pos: Pos): void;
  handleCellDeselect(pos: Pos): void;
}) => {
  const Square = () => {
    if (p.currentPlayerPiece) {
      return <DraggableSquare />;
    } else {
      return <UnDraggableSquare />;
    }
  };
  const DraggableSquare = () => {
    const [{ isDragging }, drag, preview] = useDrag({
      item: { type: "piece", pos: p.pos },
      collect: monitor => ({
        isDragging: !!monitor.isDragging()
      })
    });
    if (isDragging) {
      p.handleCellSelect(p.pos);
    }
    return (
      <>
        <DragPreviewImage connect={preview} src={p.imgPath} />
        <button
          ref={drag}
          key={p.id}
          onClick={
            p.selectedPos.x > -1 && p.selectedPos.y > -1
              ? () => p.handleCellDeselect(p.pos)
              : () => p.handleCellSelect(p.pos)
          }
          className={
            "cell" +
            (p.enemyMove
              ? " cell--enemy-move"
              : p.canKill
              ? " cell--can-kill"
              : p.canMove
              ? " cell--can-move"
              : (p.pos.y + p.pos.x) % 2 === 0
              ? " cell--dark"
              : " cell--bright")
          }
        >
          <img
            className={
              "piece" +
              (p.selectedPos.x === p.pos.x && p.selectedPos.y === p.pos.y
                ? " piece--selected"
                : "")
            }
            src={p.imgPath}
            alt={"piece"}
          ></img>
        </button>
      </>
    );
  };
  const UnDraggableSquare = () => {
    return (
      <button
        key={p.id}
        onClick={
          p.selectedPos.x > -1 && p.selectedPos.y > -1
            ? () => p.handleCellDeselect(p.pos)
            : () => null
        }
        className={
          "cell" +
          (p.enemyMove
            ? " cell--enemy-move"
            : p.canKill
            ? " cell--can-kill"
            : p.canMove
            ? " cell--can-move"
            : (p.pos.y + p.pos.x) % 2 === 0
            ? " cell--dark"
            : " cell--bright")
        }
      >
        <img
          className={
            "piece" +
            (p.selectedPos.x === p.pos.x && p.selectedPos.y === p.pos.y
              ? " piece--selected"
              : "")
          }
          src={p.imgPath}
          alt={"piece"}
        ></img>
      </button>
    );
  };

  const [{ isOver }, drop] = useDrop({
    accept: "piece",
    drop: () => p.handleCellDeselect(p.pos),
    collect: monitor => ({
      isOver: !!monitor.isOver()
    })
  });
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%"
      }}
      ref={drop}
    >
      <Square />
      {isOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            zIndex: 1,
            opacity: 0.5,
            backgroundColor: "rgb(159, 230, 212)"
          }}
        />
      )}
    </div>
  );
};
