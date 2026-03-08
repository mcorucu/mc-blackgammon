export type Player = 'white' | 'black';

export interface Piece {
  id: string; // Unique identifier for animations
  player: Player;
}

export type PointIndex = number; // 0 to 23 for points, 24 for bar, 25 for born off

// A point holds an array of pieces.
export interface Point {
  pieces: Piece[];
  player?: Player; // Which player currently occupies this point, if any
}

// Full board state
export interface BoardState {
  points: Point[]; // Array of 24 points
  bar: Record<Player, Piece[]>; // Pieces on the bar
  bornOff: Record<Player, Piece[]>; // Pieces successfully borne off
}

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceRoll {
  values: DiceValue[]; // Can be up to 4 values if doubles are rolled
  used: boolean[]; // Tracks which dice have been consumed in a move
}

export interface Move {
  from: PointIndex | 'bar';
  to: PointIndex | 'off';
  isHit?: boolean;
}

export interface Stats {
  whiteWins: number;
  blackWins: number;
  gamesPlayed: number;
}

export interface GameState {
  board: BoardState;
  turn: Player;
  dice: DiceRoll | null;
  movesMade: Move[]; // Moves made in the current turn
  winner: Player | null;
  history: BoardState[]; // For undo or AI analysis
  stats: Stats;
}
