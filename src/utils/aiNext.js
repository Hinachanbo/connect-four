import { checkWinner } from "./checkWinner.js";
import { evaluateBoard } from "./aiMaster.js";

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
  return node.children.reduce((best,child) =>{
    const uctValue = (child.wins / (child.visits + 1e-6));
    return uctValue > best.value ? {child, value: uctValue} : best;
  },{child : null, value: -Infinity}).child;
}

function evaluateSimulation(board, player) {
  // 正規化するとバックプロパゲーションに使いやすい
  const score = evaluateBoard(board, player);
  return (score+10000) / 20000; // 10000で正規化
}


export function thunderSearch(board,nextRow,player, iterations = 15000){
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
    
    const result = evaluateSimulation(node.board,player);

    while(node !== null){
      node.visits++;
      node.wins += result;
      node = node.parent;
    }
  }

  return root.children.reduce((best, child) =>
    (child.wins /( child.visits + 1e-6)) > (best.wins/( best.visits + 1e-6)) ? child : best
  , root.children[0]).move;
}