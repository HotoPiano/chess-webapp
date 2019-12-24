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

let enemyMoveFrom: Pos = { y: -1, x: -1 };
let enemyMoveTo: Pos = { y: -1, x: -1 };
let selectedPos: Pos = { y: -1, x: -1 };
export const Board = (p: {
  pieces: (Piece | null)[][];
  isBlack: boolean;
  setIsBlack: React.Dispatch<React.SetStateAction<boolean>>;
  setPieces(pieces: (Piece | null)[][]): void;
  gameOver(blackCanMove: boolean, kingThreatened: boolean): void;
  isEasyAI: boolean;
}) => {
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
    if (!p.isEasyAI || !p.isBlack) {
      // Piece is already selected, try action
      if (selectedPos.y != -1) {
        // Deselect already selected piece
        if (selectedPos.x == posClicked.x && selectedPos.y == posClicked.y) {
          selectedPos = { y: -1, x: -1 };
          showMoves(null);
        }
        // Piece already selected
        else {
          // Select other piece of same color
          if (p.pieces[posClicked.y][posClicked.x]?.isBlack === p.isBlack) {
            selectedPos = posClicked;
            showMoves(posClicked);
          }
          // Actual move
          else if (
            p.pieces[selectedPos.y][selectedPos.x]?.canMove(
              selectedPos,
              posClicked,
              p.pieces
            ) &&
            !ownKingThreatenedByMove(selectedPos, posClicked)
          ) {
            move(selectedPos, posClicked);
          }
        }
      } else {
        // Select piece
        if (p.isBlack === p.pieces[posClicked.y][posClicked.x]?.isBlack) {
          selectedPos = posClicked;
          //show opportunities
          showMoves(posClicked);
        }
      }
    }
  };

  const move = (from: Pos, to: Pos) => {
    movePiece(from, to, p.pieces);

    p.pieces[to.y][to.x]?.setHasMoved();
    p.setPieces(p.pieces);
    selectedPos = { y: -1, x: -1 };
    p.setIsBlack(!p.isBlack);
    showMoves(null);
  };

  const movePiece = (from: Pos, to: Pos, pieces: (Piece | null)[][]) => {
    // Set all pawns of same color justMovedDouble to false (for passant usage)
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let piece: Piece | null = pieces[x][y];
        if (
          piece instanceof Pawn &&
          piece.isBlack == pieces[from.y][from.x]?.isBlack
        ) {
          piece.justMovedDouble = false;
        }
      }
    }

    pieces[to.y][to.x] = pieces[from.y][from.x];
    pieces[from.y][from.x] = null;

    // Possibly make pawn into queen
    if (pieces[to.y][to.x] instanceof Pawn && (to.y == 0 || to.y == 7)) {
      pieces[to.y][to.x] = new Queen(p.isBlack);
    }

    // Possibly castling, king has moved 2 steps? also move rook
    if (pieces[to.y][to.x] instanceof King) {
      let leftCastling: boolean | null = null;
      if (from.x - 2 == to.x) {
        leftCastling = true;
      } else if (from.x + 2 == to.x) {
        leftCastling = false;
      }
      if (leftCastling != null) {
        let rookFromPos: Pos = { y: to.y, x: leftCastling ? 0 : 7 };
        let rookToPos: Pos = {
          y: to.y,
          x: to.x + (leftCastling ? 1 : -1)
        };
        pieces[rookToPos.y][rookToPos.x] = pieces[rookFromPos.y][rookFromPos.x];
        pieces[rookFromPos.y][rookFromPos.x] = null;
      }
    }

    // Possibly passant, remove pawn behind moved pawn
    if (pieces[to.y][to.x] instanceof Pawn) {
      let piece: Piece | null = pieces[from.y][to.x];
      if (
        piece instanceof Pawn &&
        piece.justMovedDouble &&
        piece.isBlack != pieces[to.y][to.x]?.isBlack
      ) {
        pieces[from.y][to.x] = null;
      }
    }
  };

  React.useEffect(() => {
    // Find next players king
    let kingPos: Pos | null = null;
    let king: King | null = null;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        let piece: Piece | null = p.pieces[y][x];
        if (
          piece != null &&
          piece.isBlack == p.isBlack &&
          piece instanceof King
        ) {
          king = piece;
          kingPos = { x: x, y: y };
        }
      }
    }
    let kingThreatened = false;
    let canMoveSafely = false;
    // check if gameend, first check all pieces
    if (kingPos != null && king != null) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece: Piece | null = p.pieces[y][x];

          // Check if any of the moved players pieces threatens next players king
          if (piece != null) {
            // Pieces of moved player
            if (piece.isBlack != king.isBlack) {
              if (piece.canMove({ y: y, x: x }, kingPos, p.pieces)) {
                kingThreatened = true;
              }
            }
            // Pieces of next player
            else {
              // Check if any of next players moves is available without own king being threatened
              for (let y2 = 0; y2 < 8; y2++) {
                for (let x2 = 0; x2 < 8; x2++) {
                  if (
                    piece.canMove({ y: y, x: x }, { y: y2, x: x2 }, p.pieces) &&
                    !ownKingThreatenedByMove({ y: y, x: x }, { y: y2, x: x2 })
                  ) {
                    canMoveSafely = true;
                  }
                }
              }
            }
          }
        }
      }

      if (!canMoveSafely) {
        p.gameOver(king.isBlack, kingThreatened);
      } else {
        // If easy AI and next move is black player, automate next move
        if (p.isEasyAI && p.isBlack) {
          let possibleMoves: {
            from: Pos;
            to: Pos;
            pieceValues: { wv: number; bv: number };
          }[] = [];
          // Find all black pieces
          for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
              let from: Pos = { y: y, x: x };
              let tmpPiece = p.pieces[from.y][from.x];
              // Find all black pieces' possible moves
              if (tmpPiece != null && tmpPiece.isBlack) {
                for (let y2 = 0; y2 < 8; y2++) {
                  for (let x2 = 0; x2 < 8; x2++) {
                    let to: Pos = { y: y2, x: x2 };
                    if (
                      tmpPiece.canMove(from, to, p.pieces) &&
                      !ownKingThreatenedByMove(from, to)
                    ) {
                      // Try move
                      let tmpPieces: (Piece | null)[][] = [];
                      p.pieces.forEach(element => {
                        tmpPieces.push([...element]);
                      });
                      movePiece(from, to, tmpPieces);
                      // compare new board value
                      // Possible move is found. TODO: add recursively call to check response move, and next moves - which will after that be best?
                      let pieceValues = getBoardValue(tmpPieces);
                      // try all white responsemoves to that
                      for (let y3 = 0; y3 < 8; y3++) {
                        for (let x3 = 0; x3 < 8; x3++) {
                          let from2: Pos = { y: y3, x: x3 };
                          let tmpPiece2 = tmpPieces[from2.y][from2.x];
                          if (tmpPiece2 != null && !tmpPiece2.isBlack) {
                            for (let y4 = 0; y4 < 8; y4++) {
                              for (let x4 = 0; x4 < 8; x4++) {
                                let to2: Pos = { y: y4, x: x4 };
                                // Try respondmove
                                let tmpPieces2: (Piece | null)[][] = [];
                                tmpPieces.forEach(element => {
                                  tmpPieces2.push([...element]);
                                });
                                movePiece(from2, to2, tmpPieces2);
                                if (
                                  tmpPiece2.canMove(from2, to2, tmpPieces2) &&
                                  !ownKingThreatenedByMove(from2, to2)
                                ) {
                                  let pieceValues2 = getBoardValue(tmpPieces2);
                                  pieceValues.bv += pieceValues2.bv;
                                  pieceValues2.wv += pieceValues2.wv;
                                }
                              }
                            }
                          }
                        }
                      }
                      possibleMoves.push({ from, to, pieceValues });
                    }
                  }
                }
              }
            }
          }
          let chosenMoves: {
            from: Pos;
            to: Pos;
            pieceValues: { wv: number; bv: number };
          }[] = [];
          possibleMoves.forEach(element => {
            let addMove: boolean = false;
            if (chosenMoves.length == 0) {
              addMove = true;
            } else if (
              element.pieceValues.bv - element.pieceValues.wv ==
              chosenMoves[0].pieceValues.bv - chosenMoves[0].pieceValues.wv
            ) {
              addMove = true;
            } else if (
              element.pieceValues.bv - element.pieceValues.wv >
              chosenMoves[0].pieceValues.bv - chosenMoves[0].pieceValues.wv
            ) {
              chosenMoves = [];
              addMove = true;
            }
            if (addMove) {
              chosenMoves.push(element);
            }
          });
          const chosenIndex = Math.floor(Math.random() * chosenMoves.length);
          let chosenMove = chosenMoves[chosenIndex];
          enemyMoveFrom = chosenMove.from;
          enemyMoveTo = chosenMove.to;
          move(chosenMove.from, chosenMove.to);
        }
      }
    }
  }, [move]);
  //console.log(Math.floor(Math.random() * 2));
  const getBoardValue = (pieces: (Piece | null)[][]) => {
    let whiteValues: number = 0;
    let blackValues: number = 0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let piece = pieces[y][x];
        if (piece != null) {
          if (piece.isBlack) {
            blackValues += piece.value;
          } else {
            whiteValues += piece.value;
          }
        }
      }
    }
    return { wv: whiteValues, bv: blackValues };
  };

  const ownKingThreatenedByMove = (from: Pos, to: Pos) => {
    // Try move
    let tmpPieces: (Piece | null)[][] = [];
    p.pieces.forEach(element => {
      tmpPieces.push([...element]);
    });
    movePiece(from, to, tmpPieces);

    // Find players king
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        let movedPiece: Piece | null = tmpPieces[to.y][to.x];
        let piece: Piece | null = tmpPieces[y][x];
        if (
          piece != null &&
          movedPiece != null &&
          piece.isBlack == movedPiece.isBlack &&
          piece instanceof King
        ) {
          let kingPos: Pos = { x: x, y: y };
          let king: King = piece;

          // Check if any opponent piece can move to kingpos
          for (let x2 = 0; x2 < 8; x2++) {
            for (let y2 = 0; y2 < 8; y2++) {
              let tmpPiece: Piece | null = tmpPieces[y2][x2];
              if (
                tmpPiece != null &&
                tmpPiece.isBlack != king.isBlack &&
                tmpPiece.canMove({ y: y2, x: x2 }, kingPos, tmpPieces)
              ) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  };

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
          (enemyMoveFrom.x == x && enemyMoveFrom.y == y) ||
          (enemyMoveTo.x == x && enemyMoveTo.y == y)
        ) {
          tmpMoveOpportunities[y][x] = 3;
        }
        if (
          posClicked != null &&
          p.pieces[posClicked.y][posClicked.x]?.canMove(
            posClicked,
            { y: y, x: x },
            p.pieces
          )
        ) {
          if (
            p.pieces[y][x] != null &&
            p.pieces[y][x]?.isBlack !=
              p.pieces[posClicked.y][posClicked.x]?.isBlack
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
            imgPath={p.pieces[y][x]?.getImage()}
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
      ></img>
    </button>
  );
};
