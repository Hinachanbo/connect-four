import { configureStore } from '@reduxjs/toolkit';
import { checkWinner } from "./utils/checkWinner";
import { ROWS, COLS } from './config';

// Action type
const DROP_DISC = "DROP_DISC";
const RESET_GAME = "RESET_GAME";
const UNDO_MOVE = "UNDO_MOVE";
const SET_AI_TYPE = "SET_AI_TYPE";

// Action creator
export const dropDisc = (row,column) =>({
    type : DROP_DISC,
    row,
    column
});

export const resetGame = () => ({
    type : RESET_GAME
});

export const undoMove = () => ({
  type : UNDO_MOVE
})

export const setAiType = (aiType) => ({
  type: SET_AI_TYPE,
  aiType
})



// initial state
const initialState ={
    board : Array(ROWS).fill().map(() => Array(COLS).fill(0)),
    currentPlayer : 1,
    winner: null,
    nextRow: Array(COLS).fill(ROWS-1),
    history : [],
    aiType: "beginer" // beginer,master,celestial,ainext
};

// reducer
export function connectFourReducer(state = initialState, action){
    switch(action.type){
        case DROP_DISC:{
            if(state.winner) return state;
            const col = action.column;
            const row = action.row;
            if(row !== state.nextRow[col]) return state;
            const boardCopy = state.board.map(row => [...row]);
            const nextRowCopy = [...state.nextRow];
            const player = state.currentPlayer;

            //新しく作らないと、書き換わる
            const historyCopy = [...state.history,{
              board : state.board.map(row => [...row]),
              nextRow : [...state.nextRow],
              currentPlayer : state.currentPlayer
            }];

            nextRowCopy[col] = row-1;
            boardCopy[row][col] = player;
            const winner = checkWinner(boardCopy,[row,col]);
            return{
                ...state,
                board: boardCopy,
                currentPlayer: state.currentPlayer * -1,
                winner,
                nextRow: nextRowCopy,
                history: historyCopy
            };
        }
        case UNDO_MOVE:{
          if(state.winner || state.history.length < 2) return state;
          const prev = state.history[state.history.length-2];
          return{
            ...state,
            board: prev.board,
            currentPlayer: prev.currentPlayer,
            nextRow: prev.nextRow,
            winner: null,
            history: state.history.slice(0,-2)
          };
        }
        case RESET_GAME:
            return initialState;

        case SET_AI_TYPE:
          return{
            ...state,
            aiType: action.aiType
          };
        
        default:
            return state;
    }
}
// store
export const store = configureStore({
  reducer: connectFourReducer,
  devTools: true,
});