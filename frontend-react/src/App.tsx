import { useState, useEffect } from 'react';
import { GameState, GameStats, DEFAULT_CONFIG } from './types/game';
import { checkApiHealth, fetchLevelById, LeaderboardEntry } from './services/api';
import GameCanvas from './components/GameCanvas';
import StartScreen from './components/StartScreen';
import ResultScreen from './components/ResultScreen';

function App() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [resultStats, setResultStats] = useState<GameStats | null>(null);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [currentLevelId, setCurrentLevelId] = useState('bamboo_battle');
  const [levelData, setLevelData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const initialize = async () => {
      const health = await checkApiHealth();
      setApiAvailable(health);
      
      try {
        const level = await fetchLevelById(currentLevelId);
        setLevelData(level);
      } catch (error) {
        console.error('加载关卡数据失败:', error);
      }
      
      setGameState('start');
    };
    
    initialize();
  }, [currentLevelId]);

  const handleStart = () => {
    setGameState('playing');
  };

  const handleGameEnd = (stats: GameStats) => {
    setResultStats(stats);
    setGameState('result');
  };

  const handleRestart = () => {
    setResultStats(null);
    setGameState('playing');
  };

  return (
    <div className="game-container">
      <GameCanvas
        gameState={gameState}
        onGameEnd={handleGameEnd}
        levelData={levelData}
        bpm={DEFAULT_CONFIG.bpm}
      />
      
      {gameState === 'start' && (
        <StartScreen onStart={handleStart} />
      )}
      
      {gameState === 'result' && resultStats && (
        <ResultScreen
          stats={resultStats}
          onRestart={handleRestart}
          leaderboard={leaderboard}
        />
      )}
    </div>
  );
}

export default App;
