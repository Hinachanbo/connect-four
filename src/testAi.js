import { ROWS, COLS } from "./config.js";
import { checkWinner } from "./utils/checkWinner.js";
import { getRandomMove } from "./utils/aiBeginer.js";
import { minimax } from "./utils/aiMaster.js";
import { mcts } from "./utils/aiCelestial.js";
import { thunderSearch } from "./utils/aiNext.js";

function playGame(ai1, ai2, depth = 4, iterations = 5000, alpha = -Infinity, beta = Infinity, lastMove = null) {
  let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
  let nextRow = Array(COLS).fill(ROWS - 1);
  let currentPlayer = 1;
  let winner = null;

  while (!winner) {
    let move;

    if (currentPlayer === 1) {
      // AI1の手
      move = ai1(board, nextRow, currentPlayer, depth, iterations, alpha, beta, lastMove);
    } else {
      // AI2の手
      move = ai2(board, nextRow, currentPlayer, depth, iterations, alpha, beta, lastMove);
    }

    if (!move) {
      winner = "draw";
      break;
    }

    const {row, col} = move;
    board[row][col] = currentPlayer;
    nextRow[col] = row - 1;
    lastMove = [row, col];
    winner = checkWinner(board, lastMove);
    if (!winner) currentPlayer = -currentPlayer;
  }

  return winner;
}

function aiBeginerWrapper(board, nextRow, player) {
  return getRandomMove(board, nextRow, player);
}

function aiMasterWrapper(board, nextRow, player, depth = 4, _i, alpha = -Infinity, beta = Infinity, lastMove = null) {
  const col = minimax(board, nextRow, depth, true, player,alpha,beta,lastMove).col;
  return {row : nextRow[col] ,col : col};
}

function aiCelestialWrapper(board, nextRow, player, _d, iterations = 5000) {
  return mcts(board, nextRow, player, iterations);
}

function aiNextWrapper(board, nextRow, player, _d, iterations = 5000) {
  return thunderSearch(board, nextRow, player, iterations);
}

function simulateBattles(ai1, ai2, games = 25) {
  let results = { ai1: 0, ai2: 0, draw: 0 };

  for (let i = 0; i < games; i++) {
    const winner = playGame(ai1, ai2);
    if (winner === 1) results.ai1++;
    else if (winner === -1) results.ai2++;
    else results.draw++;
  }

  return results;
}



// 参加AIのリスト
const aiPlayers = {
  Beginner: aiBeginerWrapper,
  Master: aiMasterWrapper,
  Celestial: aiCelestialWrapper,
  Thunder: aiNextWrapper
};

function roundRobinTournament(gamesPerMatch = 25) {
  const aiNames = Object.keys(aiPlayers);
  const results = {};

  // 初期化
  for (const name of aiNames) {
    results[name] = { win: 0, lose: 0, draw: 0 };
  }

  // 総当たり戦
  for (let i = 0; i < aiNames.length; i++) {
    for (let j = i + 1; j < aiNames.length; j++) {
      const ai1 = aiNames[i];
      const ai2 = aiNames[j];

      // 先攻: ai1, 後攻: ai2
      let res1 = simulateBattles(aiPlayers[ai1], aiPlayers[ai2], gamesPerMatch);
      results[ai1].win += res1.ai1;
      results[ai1].lose += res1.ai2;
      results[ai1].draw += res1.draw;
      results[ai2].win += res1.ai2;
      results[ai2].lose += res1.ai1;
      results[ai2].draw += res1.draw;

      // 先攻: ai2, 後攻: ai1
      let res2 = simulateBattles(aiPlayers[ai2], aiPlayers[ai1], gamesPerMatch);
      results[ai2].win += res2.ai1;
      results[ai2].lose += res2.ai2;
      results[ai2].draw += res2.draw;
      results[ai1].win += res2.ai2;
      results[ai1].lose += res2.ai1;
      results[ai1].draw += res2.draw;

      console.log(`対戦結果: ${ai1} vs ${ai2}`);
      console.log(`  ${ai1}先攻 → ${JSON.stringify(res1)}`);
      console.log(`  ${ai2}先攻 → ${JSON.stringify(res2)}`);
    }
  }

  console.log("\n=== 総合成績 ===");
  for (const [name, record] of Object.entries(results)) {
    console.log(`${name}: 勝ち ${record.win}, 負け ${record.lose}, 引き分け ${record.draw}`);
  }
}

// 実行
roundRobinTournament(25);