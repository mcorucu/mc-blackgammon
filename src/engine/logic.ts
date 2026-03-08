import type { BoardState, Player, Move, DiceValue, Point, DiceRoll } from './types';

export const getOpponent = (player: Player): Player => player === 'white' ? 'black' : 'white';

const getDirection = (player: Player): number => player === 'white' ? 1 : -1;

export const getTargetPoint = (player: Player, start: number | 'bar', amount: number): number | 'off' => {
  const dir = getDirection(player);
  if (start === 'bar') {
    return player === 'white' ? parseInt((amount - 1).toString()) : parseInt((24 - amount).toString());
  }
  
  const target = start + dir * amount;
  
  // Bearing off
  if (player === 'white' && target > 23) return 'off';
  if (player === 'black' && target < 0) return 'off';
  
  return target;
};

export const canBearOff = (board: BoardState, player: Player): boolean => {
  if (board.bar[player].length > 0) return false;
  
  const isOutsideHome = (p: Point, i: number) => {
    if (p.player !== player || p.pieces.length === 0) return false;
    if (player === 'white') return i < 18;
    return i > 5;
  };

  return !board.points.some(isOutsideHome);
};

export const isValidMove = (board: BoardState, player: Player, from: number | 'bar', to: number | 'off', diceValue: DiceValue): boolean => {
  if (board.bar[player].length > 0 && from !== 'bar') return false;

  if (from !== 'bar') {
    const point = board.points[from];
    if (point.player !== player || point.pieces.length === 0) return false;
  }

  if (to === 'off') {
    if (!canBearOff(board, player)) return false;
    
    // Check exact roll or over-roll
    const requiredRollForExact = from === 'bar' ? Infinity : (player === 'white' ? 24 - from : from + 1);
    if (diceValue === requiredRollForExact) return true;
    
    if (diceValue > requiredRollForExact) {
      // Valid if no pieces are further behind
      const hasPiecesBehind = board.points.some((p, i) => {
        if (p.player !== player || p.pieces.length === 0) return false;
        const fromIdx = from as number;
        if (player === 'white') return i < fromIdx; // i < from for white means further from home
        return i > fromIdx; // i > from for black means further from home
      });
      return !hasPiecesBehind;
    }
    return false;
  }

  // Target point bounds check
  if (to < 0 || to > 23) return false;

  const targetPoint = board.points[to];
  
  // Cannot land on 2+ opponent pieces
  if (targetPoint.player && targetPoint.player !== player && targetPoint.pieces.length > 1) {
    return false;
  }

  return true;
};

export const getLegalMoves = (board: BoardState, player: Player, dice: DiceRoll | null): Move[] => {
  if (!dice) return [];
  const availableDice = dice.values.filter((_, i) => !dice.used[i]);
  const uniqueDice = Array.from(new Set(availableDice));
  
  const moves: Move[] = [];
  
  // Check bar first
  const hasBar = board.bar[player].length > 0;
  const sources: (number | 'bar')[] = hasBar ? ['bar'] : board.points.map((p, i) => p.player === player && p.pieces.length > 0 ? i : -1).filter(i => i !== -1);
  
  for (const source of sources) {
    for (const d of uniqueDice) {
      const to = getTargetPoint(player, source, d);
      if (isValidMove(board, player, source, to, d)) {
        const isHit = to !== 'off' && board.points[to].player && board.points[to].player !== player && board.points[to].pieces.length === 1;
        moves.push({ from: source, to, isHit: !!isHit });
      }
    }
  }
  
  return moves;
};

export const applyMove = (board: BoardState, player: Player, from: number | 'bar', to: number | 'off'): BoardState => {
  const newBoard: BoardState = {
    points: board.points.map(p => ({ pieces: [...p.pieces], player: p.player })),
    bar: { white: [...board.bar.white], black: [...board.bar.black] },
    bornOff: { white: [...board.bornOff.white], black: [...board.bornOff.black] }
  };

  let pieceToMove;
  if (from === 'bar') {
    pieceToMove = newBoard.bar[player].pop()!;
  } else {
    pieceToMove = newBoard.points[from].pieces.pop()!;
    if (newBoard.points[from].pieces.length === 0) {
      newBoard.points[from].player = undefined;
    }
  }

  if (to === 'off') {
    newBoard.bornOff[player].push(pieceToMove);
  } else {
    const targetPoint = newBoard.points[to];
    if (targetPoint.player && targetPoint.player !== player && targetPoint.pieces.length === 1) {
      const hitPiece = targetPoint.pieces.pop()!;
      newBoard.bar[targetPoint.player].push(hitPiece);
    }
    
    targetPoint.pieces.push(pieceToMove);
    targetPoint.player = player;
  }

  return newBoard;
};

export const checkWin = (board: BoardState): Player | null => {
  if (board.bornOff.white.length === 15) return 'white';
  if (board.bornOff.black.length === 15) return 'black';
  return null;
};
