import { checkWinner } from "./checkWinner";

// MCTS
class Node{
  constructor(board,nextRow,player,parent = null, move = null){
    this.board = board;
    this.nextRow = nextRow;
    this.player = player;
    this.parent = parent;
    this.move = move;
    this.children = [];
    this.wins = 0;
    this.visits = 0;
    this.untriedMoves = nextRow.map((row, col) => row >= 0 ? { row, col } : null).filter(x => x != null);
  }
}
export function uctSelectChild(node){
  const C = Math.sqrt(2);
  return node.children.reduce((best,child) =>{
    const uctValue = (child.wins / (child.visits + 1e-6)) + C * Math.sqrt(Math.log(node.visits + 1) / (child.visits + 1e-6));
    return uctValue > best.value ? {child, value: uctValue} : best;
  },{child : null, value: -Infinity}).child;
}
export function simulate(board, nextRow, player) {
  let currentPlayer = player;
  let boardCopy = board.map(r => [...r]);
  let nextRowCopy = [...nextRow];

  while (true) {
    const moves = nextRowCopy
      .map((row, col) => (row >= 0 ? { row, col } : null))
      .filter(x => x != null);
    if (moves.length === 0) return "draw";
    
    // 自分が勝てる手
    let lastMove;
    for (const move of moves) {
      const tmpBoard = boardCopy.map(r => [...r]);
      tmpBoard[move.row][move.col] = currentPlayer;
      if (checkWinner(tmpBoard, [move.row, move.col]) === currentPlayer) {
        lastMove = move;
        break;
      }
    }
    // 相手の必勝手をブロック
    if(!lastMove && Math.random() < 0.8){
      for (const move of moves) {
        const tmpBoard = boardCopy.map(r => [...r]);
        tmpBoard[move.row][move.col] = -currentPlayer;
        if (checkWinner(tmpBoard, [move.row, move.col]) === -currentPlayer) {
          lastMove = move;
          break;
        }
      }
    }
    if(!lastMove){
      // ランダム手（必勝手・ブロック手がない場合）
      lastMove = moves[Math.floor(Math.random() * moves.length)];
    }
    boardCopy[lastMove.row][lastMove.col] = currentPlayer;
    nextRowCopy[lastMove.col] = lastMove.row - 1;

    const winner = checkWinner(boardCopy, [lastMove.row, lastMove.col]);
    if (winner) return winner;

    currentPlayer = -currentPlayer; // 手番交代
  }
}

export function mcts(board,nextRow,player, iterations = 15000){
   const moves = nextRow
    .map((row, col) => (row >= 0 ? { row, col } : null))
    .filter(x => x != null);
    
  for (const move of moves) {
    const tmpBoard = board.map(r => [...r]);
    tmpBoard[move.row][move.col] = player;
    if (checkWinner(tmpBoard, [move.row, move.col]) === player) {
      return move;
    }
  }
  for (const move of moves) {
    const tmpBoard = board.map(r => [...r]);
    tmpBoard[move.row][move.col] = -player;
    if (checkWinner(tmpBoard, [move.row, move.col]) === -player) {
      return move;
    }
  }

  const root = new Node(board,[...nextRow],player);
  for(let i = 0; i < iterations; i++){
    let node = root;
    while(node.untriedMoves.length === 0 && node.children.length > 0) node = uctSelectChild(node);
    if(node.untriedMoves.length > 0){
      const move = node.untriedMoves.pop();
      const boardCopy = node.board.map(r => [...r]);
      const nextRowCopy = [...node.nextRow];
      boardCopy[move.row][move.col] = node.player;
      nextRowCopy[move.col] = move.row - 1;

      const child = new Node(boardCopy, nextRowCopy, -node.player, node, move);
      node.children.push(child);
      node = child;
    }
    
    const result = simulate(node.board,node.nextRow,node.player);

    while(node !== null){
      node.visits++;
      if(result === player) node.wins++;
      else if(result === "draw") node.wins += 0.5;
      node = node.parent;
    }
  }

  return root.children.reduce((best, child) =>
    child.visits > best.visits ? child : best
  , root.children[0]).move;
}