import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Move, DiceRoll } from '../engine/types';
import { createInitialBoard, rollDice } from '../engine/board';
import { applyMove, getOpponent, checkWin } from '../engine/logic';
import { getAIMove, type AIDifficulty } from '../engine/ai';
import { soundManager } from '../utils/soundManager';

interface GameStore extends GameState {
  difficulty: AIDifficulty;
  setDifficulty: (d: AIDifficulty) => void;
  rollDiceAction: () => void;
  makeMove: (move: Move, diceIndexUsed: number) => void;
  endTurn: () => void;
  resetGame: () => void;
  undoMove: () => void;
  triggerAI: () => void;
}

const initialState: GameState = {
  board: createInitialBoard(),
  turn: 'white',
  dice: null,
  movesMade: [],
  winner: null,
  history: [],
  stats: {
    whiteWins: 0,
    blackWins: 0,
    gamesPlayed: 0,
  },
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      difficulty: 'medium',

      setDifficulty: (difficulty: AIDifficulty) => set({ difficulty }),

      rollDiceAction: () => {
        const state = get();
        if (state.dice || state.winner) return;
        soundManager.playRoll();
        set({ dice: rollDice() });
        
        // If AI turn, trigger after a short delay
        if (get().turn === 'black') {
          setTimeout(() => get().triggerAI(), 600);
        }
      },

      makeMove: (move: Move, diceIndexUsed: number) => {
        const state = get();
        if (state.winner || !state.dice) return;

        if (move.isHit) {
          soundManager.playHit();
        } else {
          soundManager.playMove();
        }

        const newBoard = applyMove(state.board, state.turn, move.from, move.to);
        const newDice: DiceRoll = {
          values: [...state.dice.values],
          used: [...state.dice.used],
        };
        newDice.used[diceIndexUsed] = true;

        const winner = checkWin(newBoard);
        if (winner) {
          soundManager.playWin();
          const currentStats = state.stats;
          set({
            stats: {
              ...currentStats,
              whiteWins: winner === 'white' ? currentStats.whiteWins + 1 : currentStats.whiteWins,
              blackWins: winner === 'black' ? currentStats.blackWins + 1 : currentStats.blackWins,
              gamesPlayed: currentStats.gamesPlayed + 1,
            }
          });
        }

        set({
          board: newBoard,
          dice: newDice,
          movesMade: [...state.movesMade, move],
          winner,
          history: [...state.history, state.board],
        });

        // If turn should end (no more dice), or it's AI turn and more moves possible
        if (newDice.used.every(u => u)) {
           // Auto end turn could go here
        } else if (state.turn === 'black' && !winner) {
           setTimeout(() => get().triggerAI(), 500);
        }
      },

      triggerAI: () => {
        const state = get();
        if (state.turn !== 'black' || state.winner) return;

        if (!state.dice) {
          get().rollDiceAction();
          return;
        }

        const aiChoice = getAIMove(state.board, 'black', state.dice, state.difficulty);
        if (aiChoice) {
          get().makeMove(aiChoice.move, aiChoice.diceIndex);
        } else {
          // No legal moves for AI
          get().endTurn();
        }
      },

      endTurn: () => {
        const state = get();
        if (!state.dice || state.winner) return;
        
        const nextTurn = getOpponent(state.turn);
        set({
          turn: nextTurn,
          dice: null,
          movesMade: [],
        });

        if (nextTurn === 'black') {
          setTimeout(() => get().triggerAI(), 800);
        }
      },

      resetGame: () => {
        set({ ...initialState, board: createInitialBoard(), difficulty: get().difficulty });
      },

      undoMove: () => {
        const state = get();
        if (state.history.length === 0 || state.movesMade.length === 0) return;

        const prevBoard = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);
        const newMovesMade = state.movesMade.slice(0, -1);

        const newDice: DiceRoll | null = state.dice ? {
          values: [...state.dice.values],
          used: [...state.dice.used],
        } : null;

        if (newDice) {
          const lastUsedIndex = newDice.used.lastIndexOf(true);
          if (lastUsedIndex !== -1) {
            newDice.used[lastUsedIndex] = false;
          }
        }

        set({
          board: prevBoard,
          history: newHistory,
          movesMade: newMovesMade,
          dice: newDice,
        });
      }
    }),
    {
      name: 'mcblackgammon-storage',
    }
  )
);
