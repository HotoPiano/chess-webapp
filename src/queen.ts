import black_queen from "./img/black_queen.png";
import white_queen from "./img/white_queen.png";
import Piece from "./piece";
import Pos from "./Pos";

export default class Queen extends Piece {
  constructor(isBlack: boolean) {
    super(isBlack);
  }

  getImage = () => {
    return this.isBlack ? black_queen : white_queen;
  };

  setHasMoved = () => {};

  canMove = (from: Pos, to: Pos, pieces: (Piece | null)[][]) => {
    if (
      (from.x == to.x ||
        from.y == to.y ||
        from.y - to.y == from.x - to.x ||
        from.y - to.y == to.x - from.x) &&
      this.pathToDestIsOpen(from, to, pieces)
    ) {
      return true;
    }
    return false;
  };
}
