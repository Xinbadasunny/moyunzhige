import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="overlay start-screen">
      <h1 className="game-title">墨韵节拍：止戈</h1>
      <p className="game-subtitle">武术节奏游戏</p>
      <button className="start-button" onClick={onStart}>
        开始游戏
      </button>
      <div className="controls-hint">
        <kbd>←</kbd> 左拳 &nbsp;&nbsp;
        <kbd>→</kbd> 右拳 &nbsp;&nbsp;
        <kbd>↑</kbd> 跳闪 &nbsp;&nbsp;
        <kbd>↓</kbd> 蹲闪 &nbsp;&nbsp;
        <kbd>Space</kbd> 格挡
      </div>
    </div>
  );
};

export default StartScreen;
