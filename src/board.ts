import Pos from "./Pos";
import Piece from "./piece";
import Bishop from "./bishop";
import Rook from "./rook";
import King from "./king";
import Queen from "./queen";
import Pawn from "./pawn";
import Knight from "./knight";

export default class Board {
  pieces: (Piece | null)[][];
  isBlack: boolean;
  enemyMoveFrom: Pos;
  enemyMoveTo: Pos;
  //selectedPos: Pos;
  stepsAhead: number;
  constructor(stepsAhead?: number) {
    if (stepsAhead) {
      this.pieces = this.getPiecesInitialState();
      this.stepsAhead = stepsAhead;
    } else {
      this.stepsAhead = 0;
      this.pieces = [];
    }
    this.isBlack = false;
    this.enemyMoveFrom = { y: -1, x: -1 };
    this.enemyMoveTo = { y: -1, x: -1 };
    //this.selectedPos = { y: -1, x: -1 };
  }

  getPiecesInitialState = (): (Piece | null)[][] => {
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

  movePiece = (from: Pos, to: Pos) => {
    // Set all pawns of same color justMovedDouble to false (for passant usage)
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        let piece: Piece | null = this.pieces[y][x];
        if (
          piece instanceof Pawn &&
          piece.isBlack === this.pieces[from.y][from.x]?.isBlack
        ) {
          piece.justMovedDouble = false;
        }
      }
    }
    this.pieces[to.y][to.x] = this.pieces[from.y][from.x];
    this.pieces[from.y][from.x] = null;
    this.pieces[to.y][to.x]?.setHasMoved();

    // Possibly make pawn into queen
    if (this.pieces[to.y][to.x] instanceof Pawn && (to.y === 0 || to.y === 7)) {
      this.pieces[to.y][to.x] = new Queen(this.isBlack);
    }

    // Possibly castling, king has moved 2 steps? also move rook
    if (this.pieces[to.y][to.x] instanceof King) {
      let leftCastling: boolean | null = null;
      if (from.x - 2 === to.x) {
        leftCastling = true;
      } else if (from.x + 2 === to.x) {
        leftCastling = false;
      }
      if (leftCastling != null) {
        let rookFromPos: Pos = { y: to.y, x: leftCastling ? 0 : 7 };
        let rookToPos: Pos = {
          y: to.y,
          x: to.x + (leftCastling ? 1 : -1)
        };
        this.pieces[rookToPos.y][rookToPos.x] = this.pieces[rookFromPos.y][
          rookFromPos.x
        ];
        this.pieces[rookFromPos.y][rookFromPos.x] = null;
      }
    }

    // Possibly passant, remove pawn behind moved pawn
    if (this.pieces[to.y][to.x] instanceof Pawn) {
      let piece: Piece | null = this.pieces[from.y][to.x];
      if (
        piece instanceof Pawn &&
        piece.justMovedDouble &&
        piece.isBlack !== this.pieces[to.y][to.x]?.isBlack
      ) {
        this.pieces[from.y][to.x] = null;
      }
    }
    // Update game info
    //this.selectedPos = { y: -1, x: -1 };
    this.isBlack = !this.isBlack;
  };

  checkIfGameDone = (): {
    kingisBlack: boolean;
    kingThreatened: boolean;
  } | null => {
    // Find next players king
    let kingPos: Pos | null = null;
    let king: King | null = null;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        let piece: Piece | null = this.pieces[y][x];
        if (
          piece != null &&
          piece.isBlack === this.isBlack &&
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
          const piece: Piece | null = this.pieces[y][x];

          // Check if any of the moved players pieces threatens next players king
          if (piece != null) {
            // Pieces of moved player
            if (piece.isBlack !== king.isBlack) {
              if (piece.canMove({ y: y, x: x }, kingPos, this.pieces)) {
                kingThreatened = true;
              }
            }
            // Pieces of next player
            else {
              // Check if any of next players moves is available without own king being threatened
              for (let y2 = 0; y2 < 8; y2++) {
                for (let x2 = 0; x2 < 8; x2++) {
                  if (
                    piece.canMove(
                      { y: y, x: x },
                      { y: y2, x: x2 },
                      this.pieces
                    ) &&
                    !this.ownKingThreatenedByMove(
                      { y: y, x: x },
                      { y: y2, x: x2 }
                    )
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
        return { kingisBlack: king.isBlack, kingThreatened: kingThreatened };
      }
    }
    return null;
  };

  moveAI = () => {
    let possibleMoves = this.findBestMoves(this.stepsAhead);
    let chosenMoves: {
      from: Pos;
      to: Pos;
      pieceValues: { wv: number; bv: number };
    }[] = [];
    possibleMoves.forEach(element => {
      let addMove: boolean = false;
      if (chosenMoves.length === 0) {
        addMove = true;
      } else if (
        element.pieceValues.bv - element.pieceValues.wv ===
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
    const chosenMove = chosenMoves[chosenIndex];
    this.enemyMoveFrom = chosenMove.from;
    this.enemyMoveTo = chosenMove.to;
    this.movePiece(chosenMove.from, chosenMove.to);
  };

  getBoardValue = () => {
    let whiteValues: number = 0;
    let blackValues: number = 0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let piece = this.pieces[y][x];
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

  clonePieces = () => {
    let tmpPieces: (Piece | null)[][] = [];
    this.pieces.forEach(element => {
      tmpPieces.push([...element]);
    });
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.pieces[y][x];
        let newPiece: Piece | null = null;
        if (piece instanceof King) {
          newPiece = new King(piece.isBlack);
          if (newPiece instanceof King) {
            newPiece.hasMoved = piece.hasMoved;
          }
        }
        if (piece instanceof Queen) {
          newPiece = new Queen(piece.isBlack);
        }
        if (piece instanceof Rook) {
          newPiece = new Rook(piece.isBlack);
          if (newPiece instanceof Rook) {
            newPiece.hasMoved = piece.hasMoved;
          }
        }
        if (piece instanceof Pawn) {
          newPiece = new Pawn(piece.isBlack);
          if (newPiece instanceof Pawn) {
            newPiece.hasMoved = piece.hasMoved;
          }
        }
        if (piece instanceof Bishop) {
          newPiece = new Bishop(piece.isBlack);
        }
        if (piece instanceof Knight) {
          newPiece = new Knight(piece.isBlack);
        }
        tmpPieces[y][x] = newPiece;
      }
    }
    return tmpPieces;
  };

  ownKingThreatenedByMove = (from: Pos, to: Pos) => {
    // Make board copy and try move
    let tmpBoard: Board = new Board();
    tmpBoard.isBlack = this.isBlack;
    tmpBoard.pieces = this.clonePieces();

    tmpBoard.movePiece(from, to);

    // Find players king
    let movedPiece: Piece | null = tmpBoard.pieces[to.y][to.x];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        let piece: Piece | null = tmpBoard.pieces[y][x];
        if (
          piece != null &&
          movedPiece != null &&
          piece.isBlack === movedPiece.isBlack &&
          piece instanceof King
        ) {
          const king: King = piece;

          // Check if any opponent piece can move to kingpos
          for (let y2 = 0; y2 < 8; y2++) {
            for (let x2 = 0; x2 < 8; x2++) {
              let tmpPiece: Piece | null = tmpBoard.pieces[y2][x2];
              if (
                tmpPiece != null &&
                tmpPiece.isBlack !== king.isBlack &&
                tmpPiece.canMove(
                  { y: y2, x: x2 },
                  { y: y, x: x },
                  tmpBoard.pieces
                )
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

  findBestMoves = (stepsAhead: number) => {
    let possibleMoves: {
      from: Pos;
      to: Pos;
      pieceValues: { wv: number; bv: number };
    }[] = [];
    // Find all black pieces
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        let from: Pos = { y: y, x: x };
        let tmpPiece = this.pieces[from.y][from.x];
        // Find all black pieces' possible moves
        if (tmpPiece != null && tmpPiece.isBlack) {
          for (let y2 = 0; y2 < 8; y2++) {
            for (let x2 = 0; x2 < 8; x2++) {
              let to: Pos = { y: y2, x: x2 };
              if (
                tmpPiece.canMove(from, to, this.pieces) &&
                !this.ownKingThreatenedByMove(from, to)
              ) {
                // Make board copy and try move
                let tmpBoard: Board = new Board();
                tmpBoard.isBlack = this.isBlack;
                tmpBoard.pieces = this.clonePieces();
                tmpBoard.movePiece(from, to);

                // compare new board value
                let pieceValues = tmpBoard.getBoardValue();
                // try all white responsemoves to that
                let underPieceValues = tmpBoard.findBestMove(
                  stepsAhead,
                  tmpBoard
                );
                pieceValues.bv += underPieceValues.bv;
                pieceValues.wv += underPieceValues.wv;
                possibleMoves.push({ from, to, pieceValues });
              }
            }
          }
        }
      }
    }
    return possibleMoves;
  };

  findBestMove = (
    stepsAhead: number,
    board: Board
  ): { bv: number; wv: number } => {
    // compare new board value
    let pieceValues = { wv: 0, bv: 0 };
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        let from: Pos = { y: y, x: x };
        let tmpPiece = board.pieces[from.y][from.x];
        // Find all black pieces' possible moves
        if (tmpPiece != null && tmpPiece.isBlack === board.isBlack) {
          for (let y2 = 0; y2 < 8; y2++) {
            for (let x2 = 0; x2 < 8; x2++) {
              let to: Pos = { y: y2, x: x2 };
              if (
                tmpPiece.canMove(from, to, board.pieces) &&
                !board.ownKingThreatenedByMove(from, to)
              ) {
                // Make board copy and try move
                let tmpBoard: Board = new Board();
                tmpBoard.isBlack = board.isBlack;
                tmpBoard.pieces = this.clonePieces();
                tmpBoard.movePiece(from, to);

                if (stepsAhead > 0) {
                  let underPieceValues = tmpBoard.findBestMove(
                    stepsAhead - 1,
                    tmpBoard
                  );
                  pieceValues.bv += underPieceValues.bv;
                  pieceValues.wv += underPieceValues.wv;
                  pieceValues = tmpBoard.getBoardValue();
                }
              }
            }
          }
        }
      }
    }
    return pieceValues;
  };
}
