import React from 'react';
import { useGameStore } from '../../store/gameStore';
import Checker from './Checker';
import type { Player, DiceValue } from '../../engine/types';
import { getLegalMoves, getTargetPoint } from '../../engine/logic';
import gsap from 'gsap';

const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 600;
const BAR_WIDTH = 40;
const POINT_WIDTH = (BOARD_WIDTH - 60 - BAR_WIDTH) / 12;
const POINT_HEIGHT = BOARD_HEIGHT * 0.42;

const Board: React.FC = () => {
  const { board, turn, dice, makeMove, endTurn, winner, resetGame } = useGameStore();
  const [selectedSource, setSelectedSource] = React.useState<number | 'bar' | null>(null);

  const containerRef = React.useRef<SVGSVGElement>(null);
  const legalMoves = React.useMemo(() => getLegalMoves(board, turn, dice), [board, turn, dice]);

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(".piece-group", 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.02, ease: "back.out(1.7)" }
      );
    }
  }, [board]);

  const handlePointClick = (index: number | 'bar') => {
    if (winner || turn === 'black') return; // Prevent interaction during AI turn
    if (!dice) return;

    if (selectedSource !== null) {
      const move = legalMoves.find(m => m.from === selectedSource && m.to === index);
      if (move) {
        const availableDiceValues = dice.values.map((v: DiceValue, i: number) => ({ v, i })).filter(({ i }: {i: number}) => !dice.used[i]);
        const diceToUse = availableDiceValues.find(({ v }: {v: DiceValue}) => getTargetPoint(turn, selectedSource, v) === index);
        
        if (diceToUse) {
          makeMove(move, diceToUse.i);
          setSelectedSource(null);
          return;
        }
      }
      
      if (selectedSource === index) {
        setSelectedSource(null);
        return;
      }
    }

    const canSelect = legalMoves.some(m => m.from === index);
    if (canSelect) {
      setSelectedSource(index);
    } else {
      setSelectedSource(null);
    }
  };

  const handleOffClick = () => {
    if (winner || turn === 'black' || selectedSource === null) return;
    const move = legalMoves.find(m => m.from === selectedSource && m.to === 'off');
    if (move && dice) {
       const availableDiceValues = dice.values.map((v: DiceValue, i: number) => ({ v, i })).filter(({ i }: {i: number}) => !dice.used[i]);
       const diceToUse = availableDiceValues.find(({ v }: {v: DiceValue}) => {
          const target = getTargetPoint(turn, selectedSource, v);
          return target === 'off';
       });

       if (diceToUse) {
          makeMove(move, diceToUse.i);
          setSelectedSource(null);
       }
    }
  };

  const getPointX = (i: number) => {
    if (i < 6) return BOARD_WIDTH - 60 - (i + 1) * POINT_WIDTH - 10;
    if (i < 12) return BOARD_WIDTH / 2 - (i - 5) * POINT_WIDTH - 10;
    if (i < 18) return 10 + (i - 12) * POINT_WIDTH;
    return BOARD_WIDTH / 2 + 10 + (i - 18) * POINT_WIDTH;
  };

  const getPointY = (i: number) => (i < 12 ? BOARD_HEIGHT - 10 : 10);

  return (
    <div className="board-outer" style={{ position: 'relative' }}>
      <svg ref={containerRef} width={BOARD_WIDTH} height={BOARD_HEIGHT} viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} className="game-board">
        <rect x="0" y="0" width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="#3d2b1f" rx="8" />
        <rect x="10" y="10" width={BOARD_WIDTH - 20} height={BOARD_HEIGHT - 20} fill="#c19a6b" rx="4" />
        <rect x={BOARD_WIDTH / 2 - 20} y="10" width="40" height={BOARD_HEIGHT - 20} fill="#3d2b1f" />

        <rect x={BOARD_WIDTH - 60} y="10" width="50" height={BOARD_HEIGHT/2 - 15} fill="#2c3e50" rx="4" onClick={handleOffClick} style={{cursor: 'pointer'}} />
        <rect x={BOARD_WIDTH - 60} y={BOARD_HEIGHT/2 + 5} width="50" height={BOARD_HEIGHT/2 - 15} fill="#2c3e50" rx="4" onClick={handleOffClick} style={{cursor: 'pointer'}} />

        {Array.from({ length: 24 }).map((_, i) => {
          const x = getPointX(i);
          const y = getPointY(i);
          const color = (i % 2 === 0) ? "#5d4037" : "#d7ccc8";
          const pointsStr = i < 12 
            ? `${x},${y} ${x + POINT_WIDTH},${y} ${x + POINT_WIDTH/2},${y - POINT_HEIGHT}` 
            : `${x},${y} ${x + POINT_WIDTH},${y} ${x + POINT_WIDTH/2},${y + POINT_HEIGHT}`;

          const isTarget = selectedSource !== null && legalMoves.some(m => m.from === selectedSource && m.to === i);

          return (
            <g key={i} onClick={() => handlePointClick(i)}>
              <polygon points={pointsStr} fill={color} />
              {isTarget && <circle cx={x + POINT_WIDTH/2} cy={i < 12 ? y - 20 : y + 20} r="5" fill="#f1c40f" opacity="0.6" />}
              
              {board.points[i].pieces.map((piece, pIdx) => {
                const targetX = x + POINT_WIDTH/2;
                const targetY = i < 12 ? y - 20 - pIdx * 35 : y + 20 + pIdx * 35;
                
                return (
                  <g 
                    key={piece.id} 
                    transform={`translate(${targetX}, ${targetY})`} 
                    className="piece-group"
                    data-id={piece.id}
                  >
                    <Checker 
                      player={piece.player} 
                      isSelected={selectedSource === i && pIdx === board.points[i].pieces.length - 1} 
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {(['white', 'black'] as Player[]).map((p) => {
          const pieces = board.bar[p];
          return pieces.map((piece, pIdx) => (
            <g 
              key={piece.id} 
              transform={`translate(${BOARD_WIDTH/2}, ${p === 'white' ? BOARD_HEIGHT/2 + 30 + pIdx * 35 : BOARD_HEIGHT/2 - 30 - pIdx * 35})`}
              onClick={() => handlePointClick('bar')}
            >
              <Checker 
                player={p} 
                isSelected={selectedSource === 'bar' && pIdx === pieces.length - 1}
              />
            </g>
          ));
        })}

        {(['white', 'black'] as Player[]).map((p) => {
          const pieces = board.bornOff[p];
          return pieces.map((piece) => (
            <rect 
              key={piece.id}
              x={BOARD_WIDTH - 55}
              y={p === 'black' ? 15 + board.bornOff[p].indexOf(piece) * 10 : BOARD_HEIGHT - 25 - board.bornOff[p].indexOf(piece) * 10}
              width="40"
              height="8"
              fill={p === 'white' ? '#f0f0f0' : '#222222'}
              stroke="#666"
              rx="2"
            />
          ));
        })}
      </svg>
      
      {dice && dice.used.every((u: boolean) => u) && !winner && turn === 'white' && (
        <button 
          onClick={endTurn}
          className="action-btn"
          style={{
            position: 'absolute', bottom: '-60px', left: '50%', transform: 'translateX(-50%)',
            padding: '10px 24px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          DONE
        </button>
      )}

      {winner && (
        <div className="winner-overlay">
          <h2>{winner.toUpperCase()} WINS!</h2>
          <button onClick={resetGame} className="action-btn">PLAY AGAIN</button>
        </div>
      )}
    </div>
  );
};

export default Board;
