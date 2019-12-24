import black_knight from "./img/black_knight.png";
import white_knight from "./img/white_knight.png";
import Piece from "./piece";
import Pos from "./Pos";

export default class Knight extends Piece {
  value = 3;
  constructor(isBlack: boolean) {
    super(isBlack);
  }

  getImage = () => {
    return this.isBlack ? black_knight : white_knight;
  };

  setHasMoved = () => {};

  canMove = (from: Pos, to: Pos, pieces: (Piece | null)[][]) => {
    // Not occupied by ally
    if (pieces[to.y][to.x] != null) {
      if (pieces[to.y][to.x]?.isBlack == this.isBlack) {
        return false;
      }
    }
    if (
      ((from.y + 1 === to.y || from.y - 1 === to.y) &&
        (from.x + 2 === to.x || from.x - 2 === to.x)) ||
      ((from.y + 2 === to.y || from.y - 2 === to.y) &&
        (from.x + 1 === to.x || from.x - 1 === to.x))
    ) {
      return true;
    }
    return false;
  };
}
