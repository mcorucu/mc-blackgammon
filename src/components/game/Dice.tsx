import React from 'react';
import type { DiceRoll, DiceValue } from '../../engine/types';
import gsap from 'gsap';

interface DiceProps {
  roll: DiceRoll | null;
  onRoll: () => void;
  onDiceClick: (index: number) => void;
  canRoll: boolean;
}

const Die: React.FC<{ value: DiceValue; used: boolean; onClick: () => void }> = ({ value, used, onClick }) => {
  const dieRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (dieRef.current && !used) {
      gsap.fromTo(dieRef.current, 
        { rotation: -20, scale: 0.8 }, 
        { rotation: 0, scale: 1, duration: 0.4, ease: "bounce.out" }
      );
    }
  }, [value, used]);

  const dots = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [25, 75], [75, 25], [75, 75]],
    5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
    6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]],
  };

  return (
    <div 
      ref={dieRef}
      className={`die ${used ? 'used' : ''}`} 
      onClick={onClick}
      style={{
        width: '50px',
        height: '50px',
        background: 'white',
        borderRadius: '8px',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        opacity: used ? 0.4 : 1,
        margin: '5px',
        display: 'inline-block'
      }}
    >
      {dots[value].map(([x, y], i) => (
        <div 
          key={i} 
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: '8px',
            height: '8px',
            background: '#333',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
    </div>
  );
};

const DiceArea: React.FC<DiceProps> = ({ roll, onRoll, onDiceClick, canRoll }) => {
  return (
    <div className="dice-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70px' }}>
      {!roll && canRoll && (
        <button 
          onClick={onRoll}
          style={{
            padding: '10px 20px',
            fontSize: '1.2rem',
            background: '#f39c12',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 0 #d35400'
          }}
        >
          ROLL DICE
        </button>
      )}
      {roll && (
        <div style={{ display: 'flex' }}>
          {roll.values.map((v, i) => (
            <Die key={i} value={v} used={roll.used[i]} onClick={() => onDiceClick(i)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DiceArea;
