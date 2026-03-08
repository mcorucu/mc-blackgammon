import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../utils/soundManager';
import type { AIDifficulty } from '../../engine/ai';

const Settings: React.FC = () => {
  const { difficulty, setDifficulty } = useGameStore();
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
          width: '40px', height: '40px', color: 'white', cursor: 'pointer', fontSize: '1.2rem'
        }}
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="settings-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
    }}>
      <div style={{
        background: '#2c3e50', padding: '30px', borderRadius: '12px', width: '300px', textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#f39c12' }}>SETTINGS</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '10px' }}>AI DIFFICULTY</p>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
            {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(d => (
              <button 
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  padding: '5px 10px', background: difficulty === d ? '#f39c12' : '#34495e',
                  border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px'
                }}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={handleToggleSound}
            style={{ width: '100%', padding: '10px', background: '#34495e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            SOUND: {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <button 
          onClick={() => setIsOpen(false)}
          style={{ width: '100%', padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};

export default Settings;
