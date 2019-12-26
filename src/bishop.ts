import black_bishop from "./img/black_bishop.png";
import white_bishop from "./img/white_bishop.png";
import Piece from "./piece";
import Pos from "./Pos";

export default class Bishop extends Piece {
  value = 3;

  getImage = () => {
    return this.isBlack ? black_bishop : white_bishop;
  };

  setHasMoved = () => {};

  canMove = (from: Pos, to: Pos, pieces: (Piece | null)[][]) => {
    if (
      (from.y - to.y === from.x - to.x || from.y - to.y === to.x - from.x) &&
      this.pathToDestIsOpen(from, to, pieces)
    ) {
      return true;
    }
    return false;
  };
}
