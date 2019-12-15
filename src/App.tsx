import * as React from "react";
import "./App.css";
import { Board } from "./board";

const App: React.FC = () => {
  let [isBlack, setIsBlack] = React.useState(false);

  const onPlayerWin = (isBlack: boolean) => {
    alert("Game ended! " + (isBlack ? "black" : "white") + " player wins.");
  };

  return (
    <div className="game">
      <div className="board--column">
        <div className="board--column__header">
          <h1>Current player: {isBlack ? "black" : "white"}</h1>
        </div>
        <Board
          isBlack={isBlack}
          setIsBlack={setIsBlack}
          playerWin={onPlayerWin}
        />
      </div>
    </div>
  );
};

export default App;
