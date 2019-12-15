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

export const Board = (p: {
  isBlack: boolean;
  setIsBlack: React.Dispatch<React.SetStateAction<boolean>>;
  playerWin(isBlack: boolean): void;
}) => {
  let [selectedPos, setSelectedPos] = React.useState<Pos>({ y: -1, x: -1 });
  let [pieces, setPieces] = React.useState<(Piece | null)[][]>([
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
      new King(false),
      new Queen(false),
      new Bishop(false),
      new Knight(false),
      new Rook(false)
    ]
  ]);

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
    // Piece is already selected, try action
    if (selectedPos.y != -1) {
      // Deselect already selected piece
      if (selectedPos.x == posClicked.x && selectedPos.y == posClicked.y) {
        setSelectedPos({ y: -1, x: -1 });
        setMoveOpportunities([
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0]
        ]);
      }
      // Piece already selected
      else {
        // Select other piece of same color
        if (pieces[posClicked.y][posClicked.x]?.isBlack === p.isBlack) {
          setSelectedPos(posClicked);
          showMoves(posClicked);
        }
        // Actual move
        else if (
          pieces[selectedPos.y][selectedPos.x]?.canMove(
            selectedPos,
            posClicked,
            pieces
          ) &&
          !kingThreatenedByMove(posClicked)
        ) {
          move(posClicked);
        }
      }
    } else {
      // Select piece
      if (p.isBlack === pieces[posClicked.y][posClicked.x]?.isBlack) {
        setSelectedPos(posClicked);
        //show opportunities
        showMoves(posClicked);
      }
    }
  };

  const move = (posClicked: Pos) => {
    pieces[posClicked.y][posClicked.x] = pieces[selectedPos.y][selectedPos.x];
    pieces[selectedPos.y][selectedPos.x] = null;

    // Possibly make pawn into queen
    if (
      pieces[posClicked.y][posClicked.x] instanceof Pawn &&
      (posClicked.y == 0 || posClicked.y == 7)
    ) {
      pieces[posClicked.y][posClicked.x] = new Queen(p.isBlack);
    }
    // Possibly castling, king has moved 2 steps? also move rook
    if (pieces[posClicked.y][posClicked.x] instanceof King) {
      let leftCastling: boolean | null = null;
      if (selectedPos.x - 2 == posClicked.x) {
        leftCastling = true;
      } else if (selectedPos.x + 2 == posClicked.x) {
        leftCastling = false;
      }
      if (leftCastling != null) {
        let rookFromPos: Pos = { y: posClicked.y, x: leftCastling ? 0 : 7 };
        let rookToPos: Pos = {
          y: posClicked.y,
          x: posClicked.x + (leftCastling ? 1 : -1)
        };
        pieces[rookToPos.y][rookToPos.x] = pieces[rookFromPos.y][rookFromPos.x];
        pieces[rookFromPos.y][rookFromPos.x] = null;
      }
    }

    pieces[posClicked.y][posClicked.x]?.setHasMoved();
    setPieces(pieces);
    setSelectedPos({ y: -1, x: -1 });
    p.setIsBlack(!p.isBlack);
    setMoveOpportunities([
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]);
  };

  const kingThreatenedByMove = (posClicked: Pos) => {
    // Try move
    let tmpPieces: (Piece | null)[][] = [];
    pieces.forEach(element => {
      tmpPieces.push([...element]);
    });
    tmpPieces[posClicked.y][posClicked.x] =
      tmpPieces[selectedPos.y][selectedPos.x];
    tmpPieces[selectedPos.y][selectedPos.x] = null;

    // Check all opponent moves
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        // Find king
        for (let x2 = 0; x2 < 8; x2++) {
          for (let y2 = 0; y2 < 8; y2++) {
            // If opponent can threat king, return false
            if (
              tmpPieces[y][x] != null &&
              tmpPieces[y][x]?.isBlack !=
                tmpPieces[posClicked.y][posClicked.x]?.isBlack &&
              tmpPieces[y2][x2] != null &&
              tmpPieces[y2][x2]?.isBlack ==
                tmpPieces[posClicked.y][posClicked.x]?.isBlack &&
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

  React.useEffect(() => {
    // check if gameend, first check all pieces
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (pieces[y][x] != null) {
          // Check if piece is now threatening opponent king
          for (let y2 = 0; y2 < 8; y2++) {
            for (let x2 = 0; x2 < 8; x2++) {
              if (
                pieces[y2][x2] != null &&
                pieces[y2][x2] instanceof King &&
                pieces[y][x]?.isBlack != pieces[y2][x2]?.isBlack &&
                pieces[y][x]?.canMove({ y: y, x: x }, { y: y2, x: x2 }, pieces)
              ) {
                let hasSafeMove: boolean = false;
                // Game end if opponent cant make any moves to prevent it
                for (let y3 = 0; y3 < 8; y3++) {
                  for (let x3 = 0; x3 < 8; x3++) {
                    // Check all moves for same color pieces
                    if (
                      pieces[y3][x3] != null &&
                      pieces[y3][x3]?.isBlack == pieces[y2][x2]?.isBlack
                    ) {
                      for (let y4 = 0; y4 < 8; y4++) {
                        for (let x4 = 0; x4 < 8; x4++) {
                          if (
                            pieces[y3][x3]?.canMove(
                              { y: y3, x: x3 },
                              { y: y4, x: x4 },
                              pieces
                            )
                          ) {
                            let tmpPieces: (Piece | null)[][] = [];
                            pieces.forEach(element => {
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
                  p.playerWin(pieces[x2][y2]?.isBlack ? true : false);
                }
              }
            }
          }
        }
      }
    }
  }, [move]);

  const showMoves = (posClicked: Pos) => {
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
          pieces[posClicked.y][posClicked.x]?.canMove(
            posClicked,
            { y: y, x: x },
            pieces
          )
        ) {
          if (
            pieces[y][x] != null &&
            pieces[y][x]?.isBlack != pieces[posClicked.y][posClicked.x]?.isBlack
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
            canKill={moveOpportunities[y][x] === 2}
            canMove={moveOpportunities[y][x] === 1}
            imgPath={pieces[y][x]?.getImage()}
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
        "button__cell" +
        (p.canKill
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
