import black_king from "./img/black_king.png";
import white_king from "./img/white_king.png";
import Piece from "./piece";
import Pos from "./Pos";
import Rook from "./rook";

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

    // Castling
    if (!this.hasMoved && from.y == to.y) {
      let rookFromPosX = from.x - 2 == to.x ? 0 : from.x + 2 == to.x ? 7 : -1;
      let rookToPosX = rookFromPosX == 0 ? 3 : rookFromPosX == 7 ? 5 : -1;
      let piece = pieces[from.y][rookFromPosX];
      if (rookFromPosX != -1 && piece instanceof Rook) {
        let rook: Rook | null = piece;
        if (
          !rook.hasMoved &&
          rook.canMove(
            { y: from.y, x: rookFromPosX },
            { y: from.y, x: rookToPosX },
            pieces
          )
        ) {
          // return false if an opponent can move to the middle step
          for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
              let kingMidStep: Pos = {
                y: to.y,
                x: from.x + (from.x - 2 == to.x ? -1 : +1)
              };
              if (
                pieces[y][x] != null &&
                pieces[y][x]?.isBlack != this.isBlack &&
                pieces[y][x]?.canMove({ y: y, x: x }, kingMidStep, pieces)
              ) {
                return false;
              }
            }
          }
          return true;
        }
      }
    }
    return false;
  };
}
