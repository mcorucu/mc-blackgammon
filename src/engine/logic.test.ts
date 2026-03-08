import { describe, it, expect } from 'vitest';
import { createInitialBoard } from './board';
import { isValidMove, getLegalMoves, applyMove } from './logic';
import type { BoardState, DiceRoll } from './types';

describe('Backgammon Logic', () => {
  it('should initialize the board correctly', () => {
    const board = createInitialBoard();
    expect(board.points.length).toBe(24);
    expect(board.points[0].pieces.length).toBe(2); // White at point 0 (24 in some notation)
    expect(board.points[23].pieces.length).toBe(2); // Black at last point
  });

  it('should validate a simple legal move', () => {
    const board = createInitialBoard();
    const dice: DiceRoll = { values: [3, 5], used: [false, false] };
    // White is at point 0, moves to 3
    expect(isValidMove(board, 'white', 0, 3, dice)).toBe(true);
  });

  it('should invalidate moving to an opponent point with 2+ pieces', () => {
    const board = createInitialBoard();
    const dice: DiceRoll = { values: [5], used: [false] };
    // White at 0 moving 5 would land on point 5, where Black has 5 pieces
    expect(isValidMove(board, 'white', 0, 5, dice)).toBe(false);
  });

  it('should identify a hit (blot)', () => {
     // Setup a board where black has only 1 piece on a point
     const board = createInitialBoard();
     board.points[1].pieces = [{ id: 'b1', player: 'black' }];
     board.points[1].player = 'black';
     
     const dice: DiceRoll = { values: [1], used: [false] };
     expect(isValidMove(board, 'white', 0, 1, dice)).toBe(true);
     
     const nextBoard = applyMove(board, 'white', 0, 1);
     expect(nextBoard.bar['black'].length).toBe(1);
     expect(nextBoard.points[1].player).toBe('white');
  });

  it('should not allow regular moves if player has pieces on the bar', () => {
    const board = createInitialBoard();
    board.bar['white'] = [{ id: 'w1', player: 'white' }];
    const dice: DiceRoll = { values: [3], used: [false] };
    
    // Normal move from point 0 to 3 should be invalid
    expect(isValidMove(board, 'white', 0, 3, dice)).toBe(false);
    // Move from bar to point 2 (index 2) should be valid
    expect(isValidMove(board, 'white', 'bar', 2, dice)).toBe(true);
  });
});
