import type { BoardState, Player, Piece, Point, DiceRoll, DiceValue } from './types';

// Simple ID generator to avoid uuid dependency
export const generateId = () => Math.random().toString(36).substr(2, 9);

const createPieces = (count: number, player: Player): Piece[] => {
  return Array.from({ length: count }, () => ({
    id: generateId(),
    player,
  }));
};

export const createInitialBoard = (): BoardState => {
  const points: Point[] = Array.from({ length: 24 }, () => ({ pieces: [] }));

  // White pieces (moving from 0 to 23)
  points[0] = { pieces: createPieces(2, 'white'), player: 'white' };
  points[11] = { pieces: createPieces(5, 'white'), player: 'white' };
  points[16] = { pieces: createPieces(3, 'white'), player: 'white' };
  points[18] = { pieces: createPieces(5, 'white'), player: 'white' };

  // Black pieces (moving from 23 to 0)
  points[23] = { pieces: createPieces(2, 'black'), player: 'black' };
  points[12] = { pieces: createPieces(5, 'black'), player: 'black' };
  points[7] = { pieces: createPieces(3, 'black'), player: 'black' };
  points[5] = { pieces: createPieces(5, 'black'), player: 'black' };

  return {
    points,
    bar: { white: [], black: [] },
    bornOff: { white: [], black: [] },
  };
};

export const rollDice = (): DiceRoll => {
  const die1 = Math.floor(Math.random() * 6) + 1 as DiceValue;
  const die2 = Math.floor(Math.random() * 6) + 1 as DiceValue;

  let values: DiceValue[];
  if (die1 === die2) {
    values = [die1, die1, die1, die1];
  } else {
    values = [die1, die2];
  }

  return {
    values,
    used: values.map(() => false),
  };
};

export const getAvailableDice = (dice: DiceRoll | null): DiceValue[] => {
  if (!dice) return [];
  return dice.values.filter((_, i) => !dice.used[i]);
};
