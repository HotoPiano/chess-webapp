import black_king from "./img/black_king.png";
import white_king from "./img/white_king.png";
import Piece from "./piece";
import Pos from "./Pos";

export default class King extends Piece {
  hasMoved: boolean = false;
  constructor(isBlack: boolean) {
    super(isBlack);
  }

  getImage = () => {
    return this.isBlack ? black_king : white_king;
  };

  setHasMoved = () => {
    this.hasMoved = true;
  };

  canMove = (from: Pos, to: Pos, pieces: (Piece | null)[][]) => {
    if (
      from.y <= to.y + 1 &&
      from.y >= to.y - 1 &&
      from.x <= to.x + 1 &&
      from.x >= to.x - 1 &&
      this.pathToDestIsOpen(from, to, pieces)
    ) {
      return true;
    }

    if (false) {
      // TODO castling
      /*Castling may only be done if the king has never moved, 
the rook involved has never moved, the squares between the king and the rook involved are unoccupied, 
the king is not in check, and the king does not cross over or end on a square attacked by an enemy piece.
*/
      return true;
    }
    return false;
  };
}
