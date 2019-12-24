import Pos from "./Pos";
import King from "./king";

export default abstract class Piece {
  constructor(isBlack: boolean) {
    this.isBlack = isBlack;
  }
  isBlack: boolean;
  abstract value: number;
  abstract getImage(): string;
  abstract setHasMoved(): void;
  abstract canMove(from: Pos, to: Pos, pieces: (Piece | null)[][]): boolean;

  pathToDestIsOpen = (from: Pos, to: Pos, pieces: (Piece | null)[][]) => {
    let addX = 0;
    let addY = 0;
    if (from.y > to.y) {
      addY = -1;
    } else if (from.y < to.y) {
      addY = 1;
    }
    if (from.x > to.x) {
      addX = -1;
    } else if (from.x < to.x) {
      addX = 1;
    }

    let path: Pos = { y: from.y, x: from.x };

    while (path.x + addX != to.x || path.y + addY != to.y) {
      path.x += addX;
      path.y += addY;
      // Check if path is blocked
      if (pieces[path.y][path.x] != null) {
        return false;
      }
    }

    // Check that destination is open space or enemy
    return (
      pieces[to.y][to.x] == null || pieces[to.y][to.x]?.isBlack != this.isBlack
    );
  };
}
