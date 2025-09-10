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
  //右下がり斜め
  for(let r = 0; r < ROWS-3; r++){
    for(let c = 0; c < COLS-3; c++){
      const window = [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]];
      score += evaluateWindow(window,player);
    }
  }
  //左下がり斜め
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r-1][c+1], board[r-2][c+2], board[r-3][c+3]];
      score += evaluateWindow(window, player);
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
  if(countPlayer === 4) score += 10000;
  else if(countPlayer === 3 && countEmpty === 1) score += 500;
  else if(countPlayer === 2 && countEmpty === 2) score += 20;
  else if(countPlayer === 2 && countEmpty === 1) score += 1;
  if(countOpponent === 4) score -= 10000;
  else if(countOpponent === 3 && countEmpty === 1) score -= 800;
  else if(countOpponent === 2 && countEmpty === 2) score -= 30;
  else if(countOpponent === 2 && countEmpty === 1) score -= 1;
  return score; 
}

export function minimax(board, nextRow, depth, maximizingPlayer, player,alpha = -Infinity, beta = Infinity,lastMove = null){
  let winner = checkWinner(board,lastMove);
  if(depth === 0 || winner) {
    if(winner === player) return { score: 10000 };
    else if(winner === -player) return { score: -10000 };
    else if(winner === "draw") return { score: 0 };
    return { score: evaluateBoard(board, player) };
  }
  
  const availableCols = nextRow.map((row,col) => (row >= 0 ? col : null)).filter(col => col !== null);
  if (maximizingPlayer) {
    let winMove = null;
    for (const col of availableCols) {
      const row = nextRow[col];
      const boardCopy = board.map(r => [...r]);
      boardCopy[row][col] = player;
    
      if (checkWinner(boardCopy, [row, col]) === player) {
        winMove = col;
      }
    }
    if (winMove !== null) return { score: 10000, col: winMove };
  } else {
    let loseMove = null;
    for (const col of availableCols) {
      const row = nextRow[col];
      const boardCopy = board.map(r => [...r]);
      boardCopy[row][col] = -player;
    
      if (checkWinner(boardCopy, [row, col]) === -player) {
        loseMove = col;
        break;
      }
    }
    if (loseMove !== null) return { score: -10000, col: loseMove };
  }

  if(maximizingPlayer){
    let maxEval = -Infinity;
    let bestCol = availableCols[0];
    for(const col of availableCols){
      const row = nextRow[col];
      const boardCopy = board.map(r => [...r]);
      const nextRowCopy = [...nextRow];
      boardCopy[row][col] = player;
      nextRowCopy[col] = row-1;
      const evalResult = minimax(boardCopy,nextRowCopy,depth-1,false,player,alpha,beta,[row,col])
      if(evalResult.score > maxEval){
        maxEval = evalResult.score;
        bestCol = col;
      }
      alpha = Math.max(alpha, evalResult.score);
      if(beta <= alpha) break;
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
      const evalResult = minimax(boardCopy,nextRowCopy,depth-1,true,player,alpha,beta,[row,col]);
      if(evalResult.score < minEval){
        minEval = evalResult.score;
        bestCol = col;
      }
      beta = Math.min(beta, evalResult.score);
      if(beta <= alpha){
        break;
      }
    }
    return {score: minEval, col: bestCol};
  }
}