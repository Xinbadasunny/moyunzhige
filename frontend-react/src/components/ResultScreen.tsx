import React from 'react';
import { GameStats } from '../types/game';
import { LeaderboardEntry } from '../services/api';

interface ResultScreenProps {
  stats: GameStats;
  onRestart: () => void;
  leaderboard: LeaderboardEntry[];
}

const ResultScreen: React.FC<ResultScreenProps> = ({ stats, onRestart, leaderboard }) => {
  const calculateGrade = (accuracy: number, miss: number): string => {
    if (accuracy >= 95 && miss === 0) return 'S';
    if (accuracy >= 90) return 'A';
    if (accuracy >= 75) return 'B';
    return 'C';
  };

  const accuracy = Math.round(stats.accuracy * 100);
  const grade = calculateGrade(accuracy, stats.miss);

  return (
    <div className="overlay result-screen">
      <h2>游戏结束</h2>
      <div className={`grade grade-${grade.toLowerCase()}`}>{grade}</div>
      <div className="final-score">最终分数: {stats.score}</div>
      <div className="max-combo">最大连击: {stats.maxCombo}</div>
      
      <div className="stats-grid">
        <div className="stat-item perfect">
          <div className="stat-value">{stats.perfect}</div>
          <div className="stat-label">Perfect</div>
        </div>
        <div className="stat-item great">
          <div className="stat-value">{stats.great}</div>
          <div className="stat-label">Great</div>
        </div>
        <div className="stat-item good">
          <div className="stat-value">{stats.good}</div>
          <div className="stat-label">Good</div>
        </div>
        <div className="stat-item miss">
          <div className="stat-value">{stats.miss}</div>
          <div className="stat-label">Miss</div>
        </div>
      </div>

      {leaderboard && leaderboard.length > 0 && (
        <div className="leaderboard">
          <h3>排行榜</h3>
          <table>
            <thead>
              <tr>
                <th>排名</th>
                <th>玩家</th>
                <th>分数</th>
                <th>连击</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.rank}</td>
                  <td>{entry.playerName}</td>
                  <td>{entry.score}</td>
                  <td>{entry.maxCombo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="restart-button" onClick={onRestart}>
        重新开始
      </button>
    </div>
  );
};

export default ResultScreen;
