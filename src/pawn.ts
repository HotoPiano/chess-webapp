import black_pawn from "./img/black_pawn.png";
import white_pawn from "./img/white_pawn.png";
import Piece from "./piece";
import Pos from "./Pos";

export default class Pawn extends Piece {
  hasMoved: boolean = false;
  constructor(isBlack: boolean) {
    super(isBlack);
  }

  getImage = () => {
    return this.isBlack ? black_pawn : white_pawn;
  };

  setHasMoved = () => {
    this.hasMoved = true;
  };

  canMove = (from: Pos, to: Pos, pieces: (any | null)[][]) => {
    // Move to open square
    if (pieces[to.y][to.x] == null) {
      if (
        this.isBlack &&
        from.x === to.x &&
        (from.y + 1 == to.y ||
          (from.y + 2 == to.y &&
            !this.hasMoved &&
            pieces[from.y + 1][from.x] == null))
      ) {
        return true;
      } else if (
        !this.isBlack &&
        from.x === to.x &&
        (from.y - 1 == to.y ||
          (from.y - 2 == to.y &&
            !this.hasMoved &&
            pieces[from.y - 1][from.x] == null))
      ) {
        return true;
      }
    }
    // Move to enemy square
    else {
      if (
        !pieces[to.y][to.x].isBlack &&
        this.isBlack &&
        (from.x == to.x - 1 || from.x == to.x + 1) &&
        from.y == to.y - 1
      ) {
        return true;
      } else if (
        pieces[to.y][to.x].isBlack &&
        !this.isBlack &&
        (from.x == to.x - 1 || from.x == to.x + 1) &&
        from.y == to.y + 1
      ) {
        return true;
      }
    }
    // TODO Passant
    /*It is a special pawn capture that can only occur immediately after a pawn makes a 
    move of two squares from its starting square, and it could have been captured by an 
    enemy pawn had it advanced only one square. The opponent captures the just-moved pawn 
    "as it passes" through the first square. The result is the same as if the pawn had 
    advanced only one square and the enemy pawn had captured it normally.
    */
    if (false) {
      return true;
    }
    return false;
  };
}
