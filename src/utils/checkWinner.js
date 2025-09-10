import { ROWS, COLS } from '../config.js';

//勝敗判定
export function checkWinner(board,now){
    const directions = [
        [1,0],[0,1],[1,1],[1,-1]
        //下、右、右下、左下
    ];
    if(now === null) return null;
    let [r,c] = now;
    if(board[r][c] === 0) return null;
    const player = board[r][c];
    for( let [dr, dc] of directions){
        let count = 1;
        let nr = r + dr, nc = c + dc;
        while(
            nr >= 0 &&
            nr < ROWS &&
            nc >= 0 &&
            nc < COLS &&
            board[nr][nc] === player
            ){
            count++;
            nr += dr;
            nc += dc;
          }
        nr = r - dr;
        nc = c - dc;
        while(
            nr >= 0 &&
            nr < ROWS &&
            nc >= 0 &&
            nc < COLS &&
            board[nr][nc] === player
            ){
            count++;
            nr -= dr;
            nc -= dc;
        }
        if(count >= 4) return player;
    }
    if (board.every(row => row.every(cell => cell !== 0))) {
    return "draw";
    }
    return null;
}