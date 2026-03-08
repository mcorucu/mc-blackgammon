import Board from './components/game/Board';
import DiceArea from './components/game/Dice';
import Settings from './components/game/Settings';
import { useGameStore } from './store/gameStore';

function App() {
  const { turn, dice, rollDiceAction, winner, resetGame, stats } = useGameStore();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>McBlackGammon</h1>
        <div className="turn-indicator" style={{ 
          fontSize: '1.2rem', 
          color: turn === 'white' ? '#f0f0f0' : '#222222',
          background: turn === 'white' ? '#222' : '#f0f0f0',
          padding: '5px 20px',
          borderRadius: '20px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}>
          {turn.toUpperCase()}'S TURN
        </div>
        <Settings />
      </header>

      <main className="game-layout">
        <div className="game-sidebar left">
           <div className="stat-card">
              <h3>WHITE</h3>
              <p>Wins: {stats.whiteWins}</p>
           </div>
        </div>

        <Board />

        <div className="game-sidebar right">
           <div className="stat-card">
              <h3>BLACK</h3>
              <p>Wins: {stats.blackWins}</p>
           </div>
           
           <div className="controls">
              <button className="secondary-btn" onClick={resetGame}>NEW GAME</button>
           </div>
        </div>
      </main>

      <footer className="game-footer">
        <DiceArea 
          roll={dice} 
          onRoll={rollDiceAction} 
          onDiceClick={() => {}} 
          canRoll={!dice && !winner}
        />
      </footer>
    </div>
  );
}

export default App;
