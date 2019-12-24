import black_pawn from "./img/black_pawn.png";
import white_pawn from "./img/white_pawn.png";
import Piece from "./piece";
import Pos from "./Pos";

export default class Pawn extends Piece {
  value = 1;
  hasMoved: boolean = false;
  justMovedDouble: boolean = false;
  constructor(isBlack: boolean) {
    super(isBlack);
  }

  getImage = () => {
    return this.isBlack ? black_pawn : white_pawn;
  };

  setHasMoved = () => {
    this.justMovedDouble = !this.hasMoved;
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
      // passant
      let enemyPosY = this.isBlack ? to.y - 1 : to.y + 1;
      if (enemyPosY > -1 && enemyPosY < 8) {
        let enemy: Piece | null = pieces[enemyPosY][to.x];
        if (enemy instanceof Pawn && enemy.justMovedDouble) {
          if (
            pieces[to.y][to.x] == null &&
            this.isBlack &&
            (from.x == to.x - 1 || from.x == to.x + 1) &&
            from.y == to.y - 1
          ) {
            return true;
          } else if (
            pieces[to.y][to.x] == null &&
            !this.isBlack &&
            (from.x == to.x - 1 || from.x == to.x + 1) &&
            from.y == to.y + 1
          ) {
            return true;
          }
        }
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
    return false;
  };
}
