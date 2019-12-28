import * as React from "react";
import "./App.css";
import Pos from "./Pos";
import { useDrag, useDrop, DragPreviewImage } from "react-dnd";

export const BoardSquare = (p: {
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
