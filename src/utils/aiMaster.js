import { checkWinner } from "./checkWinner";
import { ROWS, COLS } from '../config';

//　min-max法
export function evaluateBoard(board, player){
  let score = 0;
  //横
  for(let r = 0; r < ROWS; r++){
    for(let c = 0; c < COLS-3; c++){
      const window =[board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]];
      score += evaluateWindow(window,player);
    }
  }
  //縦
  for(let r = 0; r < ROWS-3; r++){
    for(let c = 0; c < COLS; c++){
      const window = [board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]];
      score += evaluateWindow(window,player);
    }
  }
  //斜め
  for(let r = 0; r < ROWS-3; r++){
    for(let c = 0; c < COLS-3; c++){
      const window = [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]];
      score += evaluateWindow(window,player);
    }
  }
  return score;
}

export function evaluateWindow(window, player){
  const opponent = -player;
  let score = 0;
  const countPlayer = window.filter(x => x === player).length;
  const countOpponent = window.filter(x => x === opponent).length;
  const countEmpty = window.filter(x => x === 0).length;
  if(countPlayer === 4) score += 1000;
  else if(countPlayer === 3 && countEmpty === 1) score += 80;
  else if(countPlayer === 2 && countEmpty === 2) score += 5;
  else if(countPlayer === 2 && countEmpty === 1) score += 1;
  if(countOpponent === 3 && countEmpty === 1) score -= 80;
  if(countOpponent === 2 && countEmpty === 2) score -= 5;
  if(countOpponent === 2 && countEmpty === 1) score -= 1;
  return score; 
}

export function minimax(board, nextRow, depth, maximizingPlayer, player){
  let winner = 0;
  for(let r = 0; r < ROWS; r++){
    for(let c = 0; c < COLS; c++){
      const now = checkWinner(board,[r,c]);
      if(now !== 0 && now !==  null) winner = now;
    }
  }
  if(depth === 0 || winner) {
    if(winner === player) return { score: 1000 };
    else if(winner === -player) return { score: -1000 };
    else if(winner === "draw") return { score: 0 };
    return { score: evaluateBoard(board, player) };
  }
  const availableCols = nextRow.map((row,col) => (row >= 0 ? col : null)).filter(col => col != null);
  if(maximizingPlayer){
    let maxEval = -Infinity;
    let bestCol = availableCols[0];
    for(const col of availableCols){
      const row = nextRow[col];
      const boardCopy = board.map(r => [...r]);
      const nextRowCopy = [...nextRow];
      boardCopy[row][col] = player;
      nextRowCopy[col] = row-1;
      const evalResult = minimax(boardCopy,nextRowCopy,depth-1,false,player)
      if(evalResult.score > maxEval){
        maxEval = evalResult.score;
        bestCol = col;
      }
    }
    return {score: maxEval, col: bestCol};
  }else{
    let minEval = Infinity;
    let bestCol = availableCols[0];
    const opponent = -player;
    for(const col of availableCols){
      const row = nextRow[col];
      const boardCopy = board.map(r => [...r]);
      const nextRowCopy = [...nextRow];
      boardCopy[row][col] = opponent;
      nextRowCopy[col] = row-1;
      const evalResult = minimax(boardCopy,nextRowCopy,depth-1,true,player)
      if(evalResult.score < minEval){
        minEval = evalResult.score;
        bestCol = col;
      }
    }
    return {score: minEval, col: bestCol};
  }
}