import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { dropDisc, undoMove, resetGame, setAiType } from "../store";
import { getRandomMove} from "../utils/aiBeginer";
import { minimax } from "../utils/aiMaster";
import { mcts } from "../utils/aiCelestial";
import { ToastContainer, toast } from "react-toastify";
import { FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import { FaCat, FaPaw } from "react-icons/fa";
import "../App.css";
import dropSound from "../dropitem.mp3";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Board() {
  const { board, currentPlayer, nextRow, winner, aiType } = useSelector(s => s);
  const dispatch = useDispatch();
  const [aiThinking, setAiThinking] = useState(false);
  const [dots, setDots] = useState("");
  //const [aiScore, setAiScore] = useState(null);

  function playDropSound() { new Audio(dropSound).play(); }

  useEffect(() => {
    if (!winner) return;
    if (winner === 1) toast.success("あなたの勝ち！");
    else if (winner === -1) toast.warning("一姫の勝ち！");
    else if (winner === "draw") toast.info("引き分け！");
  }, [winner]);

  useEffect(() => {
    if (winner || currentPlayer !== -1) return;
    setAiThinking(true);
    const timer = setTimeout(() => {
      let move;
      if (aiType === "celestial") move = mcts(board, nextRow, -1, 15000);
      else if (aiType === "master") {
        const col = minimax(board, nextRow, 6, true, -1,-Infinity,Infinity,null).col;
        move = {row : nextRow[col] ,col : col};
      }
      else move = getRandomMove(board, nextRow,currentPlayer);

      if (move) {
        const row = move.row;
        const col = move.col;
        dispatch(dropDisc(row, col));
        playDropSound();
      }
      setAiThinking(false);
    }, 2000 + Math.floor(Math.random()*1000));
    return () => clearTimeout(timer);
  }, [board, currentPlayer, winner, nextRow, aiType, dispatch]);

  useEffect(()=>{
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + "." : ""))},400);
      return () => clearInterval(interval);
    },[]);

  return (
    <div className="center">
      <h2>{winner ? (winner === "draw" ? "引き分け！" : (winner === 1 ? "あなた" : "一姫") + "の勝ち！") :
          aiThinking
          ? <>一姫<FaCat size={24} color="orange" />思考中{dots}</>
          : (currentPlayer === 1 ? "あなた" : "一姫") + "の番"}
          </h2>

      <div className="ai-select mb-3">
        <label>一姫<FaPaw size={24} color="pink" />のランク:</label>
        <select value={aiType} onChange={e => dispatch(setAiType(e.target.value))}
                disabled={board.some(r => r.some(c => c !== 0))}>
          <option value="beginer">初心</option>
          <option value="master">雀豪</option>
          <option value="celestial">魂天</option>
        </select>
      </div>

      <div className="board">
        {board.map((row, rIdx) => row.map((cell, cIdx) => {
          let colorClass = cell === 1 ? "red" : cell === -1 ? "yellow" : "empty";
          if (rIdx === nextRow[cIdx] && cell === 0 && !winner) colorClass += " highlight";
          return (
            <div key={`${rIdx}-${cIdx}`} className="cell"
                 onClick={() => { if (aiThinking || winner || nextRow[cIdx] !== rIdx) return; dispatch(dropDisc(rIdx,cIdx)); playDropSound(); }}>
              <div className={colorClass}></div>
            </div>
          );
        }))}
      </div>

      <div className="btnspace">
        <button className="btn btn-secondary" onClick={() => { if(aiThinking || winner) return; dispatch(undoMove()) }}>
          <FiArrowLeft style={{ marginRight: 5 }} /> １手戻す
        </button>
        <button className="btn btn-primary" onClick={() => { if(aiThinking) return; toast.dismiss(); dispatch(resetGame()) }}>
          <FiRefreshCw style={{ marginRight: 5 }} /> リセット
        </button>
      </div>

      {/*
      <div className="ai-score">
        <strong>AI評価値:</strong> {aiScore !== null ? aiScore : "-"}
      </div>
      */}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
