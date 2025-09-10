import { checkWinner } from "./checkWinner.js";

//　１手先だけを予測するランダムAI
export function getRandomMove(board, nextRow, currentPlayer) {
  // nextRow から置ける列を取得
  const availableCols = nextRow
    .map((row, col) => (row >= 0 ? col : null))
    .filter(col => col !== null);

  if (availableCols.length === 0) return null;

  for(const e of availableCols){
    let boardCopy = board.map(r => [...r]);
    boardCopy[nextRow[e]][e] = currentPlayer;
    if(checkWinner(boardCopy,[nextRow[e],e]) === currentPlayer){
      return { row : nextRow[e], col : e };
    }
  }
  for(const e of availableCols){
    let boardCopy = board.map(r => [...r]);
    boardCopy[nextRow[e]][e] = -currentPlayer;
    if(checkWinner(boardCopy,[nextRow[e],e]) === -currentPlayer){
      return { row : nextRow[e], col : e };
    }
  }

  const randomIndex = Math.floor(Math.random() * availableCols.length);
  const col = availableCols[randomIndex];
  const row = nextRow[col];
  return { row, col };
}