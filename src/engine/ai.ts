import type { BoardState, Player, Move, DiceRoll } from './types';
import { getLegalMoves, applyMove, getTargetPoint } from './logic';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

// Evaluate a board state for a player
const evaluateBoard = (board: BoardState, player: Player): number => {
  let score = 0;
  const opponent = player === 'white' ? 'black' : 'white';
  
  score += board.bornOff[player].length * 100;
  score -= board.bornOff[opponent].length * 100;
  
  score -= board.bar[player].length * 50;
  score += board.bar[opponent].length * 50;
  
  board.points.forEach((p, i) => {
    if (p.player === player) {
      if (p.pieces.length === 1) score -= 20;
      if (p.pieces.length >= 2) score += 10;
      
      const distanceToHome = player === 'white' ? 23 - i : i;
      score += (24 - distanceToHome) * 2;
    } else if (p.player === opponent) {
      if (p.pieces.length === 1) score += 15;
    }
  });
  
  return score;
};

export const getAIMove = (
  board: BoardState, 
  player: Player, 
  dice: DiceRoll, 
  difficulty: AIDifficulty
): { move: Move; diceIndex: number } | null => {
  const legalMoves = getLegalMoves(board, player, dice);
  if (legalMoves.length === 0) return null;

  const availableDice = dice.values.map((v, i) => ({v, i})).filter(({i}) => !dice.used[i]);

  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    const move = legalMoves[randomIndex];
    const di = availableDice.find(({v}) => getTargetPoint(player, move.from, v) === move.to);
    return di ? { move, diceIndex: di.i } : null;
  }

  let bestScore = -Infinity;
  let bestChoice: { move: Move; diceIndex: number } | null = null;

  for (const move of legalMoves) {
    for (const di of availableDice) {
      if (getTargetPoint(player, move.from, di.v) === move.to) {
        const nextBoard = applyMove(board, player, move.from, move.to);
        const score = evaluateBoard(nextBoard, player) + (move.isHit ? 40 : 0);

        if (score > bestScore) {
          bestScore = score;
          bestChoice = { move, diceIndex: di.i };
        }
      }
    }
  }

  return bestChoice;
};
