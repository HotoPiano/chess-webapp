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
  playerWin(isBlack: boolean): void;
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
            !kingThreatenedByMove(posClicked, selectedPos)
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
    // Set all pawns of same color justMovedDouble to false (for passant usage)
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let piece: Piece | null = p.pieces[x][y];
        if (
          piece instanceof Pawn &&
          piece.isBlack == p.pieces[from.y][from.x]?.isBlack
        ) {
          piece.justMovedDouble = false;
        }
      }
    }

    p.pieces[to.y][to.x] = p.pieces[from.y][from.x];
    p.pieces[from.y][from.x] = null;

    // Possibly make pawn into queen
    if (p.pieces[to.y][to.x] instanceof Pawn && (to.y == 0 || to.y == 7)) {
      p.pieces[to.y][to.x] = new Queen(p.isBlack);
    }

    // Possibly castling, king has moved 2 steps? also move rook
    if (p.pieces[to.y][to.x] instanceof King) {
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
        p.pieces[rookToPos.y][rookToPos.x] =
          p.pieces[rookFromPos.y][rookFromPos.x];
        p.pieces[rookFromPos.y][rookFromPos.x] = null;
      }
    }

    // Possibly passant, remove pawn behind moved pawn
    if (p.pieces[to.y][to.x] instanceof Pawn) {
      let piece: Piece | null = p.pieces[from.y][to.x];
      if (
        piece instanceof Pawn &&
        piece.justMovedDouble &&
        piece.isBlack != p.pieces[to.y][to.x]?.isBlack
      ) {
        p.pieces[from.y][to.x] = null;
      }
    }

    p.pieces[to.y][to.x]?.setHasMoved();
    p.setPieces(p.pieces);
    selectedPos = { y: -1, x: -1 };
    p.setIsBlack(!p.isBlack);
    showMoves(null);

    // check if gameend, first check all pieces
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (p.pieces[y][x] != null) {
          // Check if piece is now threatening opponent king
          for (let y2 = 0; y2 < 8; y2++) {
            for (let x2 = 0; x2 < 8; x2++) {
              if (
                p.pieces[y2][x2] != null &&
                p.pieces[y2][x2] instanceof King &&
                p.pieces[y][x]?.isBlack != p.pieces[y2][x2]?.isBlack &&
                p.pieces[y][x]?.canMove(
                  { y: y, x: x },
                  { y: y2, x: x2 },
                  p.pieces
                )
              ) {
                let hasSafeMove: boolean = false;
                // Game end if opponent cant make any moves to prevent it
                for (let y3 = 0; y3 < 8; y3++) {
                  for (let x3 = 0; x3 < 8; x3++) {
                    // Check all moves for same color pieces
                    if (
                      p.pieces[y3][x3] != null &&
                      p.pieces[y3][x3]?.isBlack == p.pieces[y2][x2]?.isBlack
                    ) {
                      for (let y4 = 0; y4 < 8; y4++) {
                        for (let x4 = 0; x4 < 8; x4++) {
                          if (
                            p.pieces[y3][x3]?.canMove(
                              { y: y3, x: x3 },
                              { y: y4, x: x4 },
                              p.pieces
                            )
                          ) {
                            let tmpPieces: (Piece | null)[][] = [];
                            p.pieces.forEach(element => {
                              tmpPieces.push([...element]);
                            });
                            tmpPieces[y4][x4] = tmpPieces[y3][x3];
                            tmpPieces[y3][x3] = null;
                            let isSafeMove: boolean = true;
                            // Check if anyone still threatens king after testmove
                            for (let y5 = 0; y5 < 8; y5++) {
                              for (let x5 = 0; x5 < 8; x5++) {
                                // Find kings possibly new position
                                for (let y6 = 0; y6 < 8; y6++) {
                                  for (let x6 = 0; x6 < 8; x6++) {
                                    if (
                                      tmpPieces[y5][x5] != null &&
                                      tmpPieces[y6][x6] != null &&
                                      tmpPieces[y6][x6] instanceof King &&
                                      tmpPieces[y5][x5]?.isBlack !=
                                        tmpPieces[y6][x6]?.isBlack &&
                                      tmpPieces[y5][x5]?.canMove(
                                        { y: y5, x: x5 },
                                        { y: y6, x: x6 },
                                        tmpPieces
                                      )
                                    ) {
                                      isSafeMove = false;
                                    }
                                  }
                                }
                              }
                            }
                            if (isSafeMove) {
                              hasSafeMove = true;
                            }
                          }
                        }
                      }
                    }
                  }
                }
                if (!hasSafeMove) {
                  p.playerWin(p.pieces[x2][y2]?.isBlack ? true : false);
                }
              }
            }
          }
        }
      }
    }
  };

  React.useEffect(() => {
    // If easy AI and next move is black player, automate next move
    if (p.isEasyAI && p.isBlack) {
      let possibleMoves: { from: Pos; to: Pos }[] = [];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          let from: Pos = { y: y, x: x };
          for (let y2 = 0; y2 < 8; y2++) {
            for (let x2 = 0; x2 < 8; x2++) {
              let to: Pos = { y: y2, x: x2 };
              if (
                p.pieces[y][x] != null &&
                p.pieces[y][x]?.isBlack &&
                p.pieces[y][x]?.canMove(from, to, p.pieces) &&
                !kingThreatenedByMove(from, to)
              ) {
                possibleMoves.push({ from, to });
              }
            }
          }
        }
      }
      let chosenMove: { from: Pos; to: Pos } =
        possibleMoves[Math.round((Math.random() * (possibleMoves.length + 1))-1)];
      enemyMoveFrom = chosenMove.from;
      enemyMoveTo = chosenMove.to;
      move(chosenMove.from, chosenMove.to);
    }
  }, [move]);

  const kingThreatenedByMove = (from: Pos, to: Pos) => {
    // Try move
    let tmpPieces: (Piece | null)[][] = [];
    p.pieces.forEach(element => {
      tmpPieces.push([...element]);
    });
    tmpPieces[from.y][from.x] = tmpPieces[to.y][to.x];
    tmpPieces[to.y][to.x] = null;

    // Check all opponent moves
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        // Find king
        for (let x2 = 0; x2 < 8; x2++) {
          for (let y2 = 0; y2 < 8; y2++) {
            // If opponent can threat king, return false
            if (
              tmpPieces[y][x] != null &&
              tmpPieces[y][x]?.isBlack != tmpPieces[from.y][from.x]?.isBlack &&
              tmpPieces[y2][x2] != null &&
              tmpPieces[y2][x2]?.isBlack ==
                tmpPieces[from.y][from.x]?.isBlack &&
              tmpPieces[y2][x2] instanceof King &&
              tmpPieces[y][x]?.canMove(
                { y: y, x: x },
                { y: y2, x: x2 },
                tmpPieces
              )
            ) {
              return true;
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
