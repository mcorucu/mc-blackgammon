import React from 'react';
import type { Player } from '../../engine/types';

interface CheckerProps {
  player: Player;
  isDragging?: boolean;
  isSelected?: boolean;
  isHighLighted?: boolean;
  onClick?: () => void;
}

const Checker: React.FC<CheckerProps> = ({ player, isSelected, isHighLighted, onClick }) => {
  const color = player === 'white' ? '#f0f0f0' : '#222222';
  const borderColor = player === 'white' ? '#cccccc' : '#444444';
  const innerColor = player === 'white' ? '#ffffff' : '#333333';

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Glow if selected */}
      {isSelected && (
        <circle cx="0" cy="0" r="22" fill="none" stroke="#f39c12" strokeWidth="3" />
      )}
      
      {/* Outer rim */}
      <circle cx="0" cy="0" r="18" fill={color} stroke={borderColor} strokeWidth="1" />
      
      {/* Inner detail (concentric circles for premium look) */}
      <circle cx="0" cy="0" r="14" fill="none" stroke={borderColor} strokeWidth="0.5" opacity="0.5" />
      <circle cx="0" cy="0" r="10" fill="none" stroke={borderColor} strokeWidth="0.5" opacity="0.5" />
      
      {/* Center cap */}
      <circle cx="0" cy="0" r="6" fill={innerColor} opacity="0.2" />

      {isHighLighted && (
        <circle cx="0" cy="0" r="18" fill="rgba(255, 255, 0, 0.2)" />
      )}
    </g>
  );
};

export default Checker;
