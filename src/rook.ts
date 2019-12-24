import black_rook from "./img/black_rook.png";
import white_rook from "./img/white_rook.png";
import Piece from "./piece";
import Pos from "./Pos";

export default class Rook extends Piece {
  value = 5;
  hasMoved: boolean = false;
  constructor(isBlack: boolean) {
    super(isBlack);
  }

  getImage = () => {
    return this.isBlack ? black_rook : white_rook;
  };

  setHasMoved = () => {
    this.hasMoved = true;
  };

  canMove = (from: Pos, to: Pos, pieces: (Piece | null)[][]) => {
    if (
      (from.x == to.x || from.y == to.y) &&
      this.pathToDestIsOpen(from, to, pieces)
    ) {
      return true;
    }
    return false;
  };
}
