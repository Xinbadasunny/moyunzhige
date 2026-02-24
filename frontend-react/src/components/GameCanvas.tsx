import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, GameStats, InputType, Rating } from '../types/game';
import { BambooScene, AudioManager, RhythmEngine, Player, EnemyManager, InputManager, EffectsManager, GameUI } from '../engine';

interface GameCanvasProps {
  gameState: GameState;
  onGameEnd: (stats: GameStats) => void;
  levelData?: any;
  bpm: number;
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onGameEnd, levelData, bpm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const bambooSceneRef = useRef<BambooScene | null>(null);
  const rhythmEngineRef = useRef<RhythmEngine | null>(null);
  const playerRef = useRef<Player | null>(null);
  const enemyManagerRef = useRef<EnemyManager | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const effectsManagerRef = useRef<EffectsManager | null>(null);
  const gameUIRef = useRef<GameUI | null>(null);

  const gameLoopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const scoreRef = useRef(0);
  const qiRef = useRef(0);
  const ultimateModeRef = useRef(false);
  const ultimateTimerRef = useRef(0);
  const lastBeatPlayedRef = useRef(0);
  const spawnedBeatsRef = useRef<Set<number>>(new Set());

  const playerXRef = useRef(CANVAS_WIDTH * 0.2);

  const initializeEngines = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    bambooSceneRef.current = new BambooScene(CANVAS_WIDTH, CANVAS_HEIGHT);
    rhythmEngineRef.current = new RhythmEngine({ bpm });
    playerRef.current = new Player(playerXRef.current, CANVAS_HEIGHT * 0.6);
    enemyManagerRef.current = new EnemyManager(CANVAS_WIDTH, CANVAS_HEIGHT);
    inputManagerRef.current = new InputManager();
    effectsManagerRef.current = new EffectsManager();
    gameUIRef.current = new GameUI(CANVAS_WIDTH, CANVAS_HEIGHT);

    inputManagerRef.current.init(canvas);
  }, [bpm]);

  const startGame = useCallback(() => {
    AudioManager.init();
    AudioManager.startMusic(bpm);

    if (rhythmEngineRef.current) {
      rhythmEngineRef.current.reset();
      rhythmEngineRef.current.start();
      
      if (levelData) {
        rhythmEngineRef.current.loadFromApiData(levelData);
      }
    }

    comboRef.current = 0;
    maxComboRef.current = 0;
    scoreRef.current = 0;
    qiRef.current = 0;
    ultimateModeRef.current = false;
    ultimateTimerRef.current = 0;
    lastBeatPlayedRef.current = 0;
    spawnedBeatsRef.current.clear();

    if (enemyManagerRef.current) {
      enemyManagerRef.current.clear();
    }

    if (gameUIRef.current) {
      gameUIRef.current.setCombo(0);
      gameUIRef.current.setScore(0);
      gameUIRef.current.setQi(0);
      gameUIRef.current.setUltimateMode(false);
      gameUIRef.current.setProgress(0);
    }
  }, [bpm, levelData]);

  const handleInput = useCallback((input: { type: string; time: number }) => {
    if (gameState !== 'playing') return;
    if (!rhythmEngineRef.current || !playerRef.current || !enemyManagerRef.current || !effectsManagerRef.current || !gameUIRef.current) return;

    // 按键始终触发角色动作（视觉反馈）
    playerRef.current.performAction(input.type);

    const result = rhythmEngineRef.current.judge(input.type, input.time);
    
    if (result.beat) {
      let hitSuccess = false;
      let rating: Rating = result.rating;

      if (rating === 'miss') {
        comboRef.current = 0;
        effectsManagerRef.current.showJudgment('MISS', CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5, 'miss');
      } else {
        comboRef.current++;
        if (comboRef.current > maxComboRef.current) {
          maxComboRef.current = comboRef.current;
        }

        hitSuccess = enemyManagerRef.current.hitFrontEnemy(rating);
        
        if (hitSuccess) {
          effectsManagerRef.current.triggerInkSplash(playerXRef.current + 100, CANVAS_HEIGHT * 0.6, 1.5);
          effectsManagerRef.current.triggerShake(5, 100);
          
          const hitX = playerXRef.current + 80;
          const hitY = CANVAS_HEIGHT * 0.55;
          effectsManagerRef.current.showJudgment(result.rating.toUpperCase(), hitX, hitY - 50, rating);
          effectsManagerRef.current.showCombo(comboRef.current, hitX, hitY - 100);

          AudioManager.playHitSound(input.type);
          AudioManager.playJudgmentSound(rating);

          let scoreGain = 0;
          switch (rating) {
            case 'perfect':
              scoreGain = 300;
              break;
            case 'great':
              scoreGain = 200;
              break;
            case 'good':
              scoreGain = 100;
              break;
          }

          const comboMultiplier = 1 + (comboRef.current - 1) * 0.05;
          scoreGain = Math.floor(scoreGain * comboMultiplier);

          if (ultimateModeRef.current) {
            scoreGain = Math.floor(scoreGain * 1.5);
          }

          scoreRef.current += scoreGain;
          qiRef.current = Math.min(100, qiRef.current + 5);

          if (rating === 'perfect') {
            effectsManagerRef.current.triggerHitStop(50);
          }
        }
      }

      gameUIRef.current.setCombo(comboRef.current);
      gameUIRef.current.setScore(scoreRef.current);
      gameUIRef.current.setQi(qiRef.current);

      const musicIntensity = Math.min(3, Math.floor(comboRef.current / 10));
      AudioManager.setMusicIntensity(musicIntensity);
    }
  }, [gameState]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (effectsManagerRef.current && effectsManagerRef.current.isHitStopped()) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (bambooSceneRef.current) {
      bambooSceneRef.current.update(deltaTime);
      bambooSceneRef.current.render(ctx);
    }

    if (gameState === 'playing') {
      if (rhythmEngineRef.current && playerRef.current && enemyManagerRef.current && effectsManagerRef.current && gameUIRef.current) {
        rhythmEngineRef.current.update(timestamp);

        const currentBeats = rhythmEngineRef.current.getCurrentBeats();
        const elapsedTime = rhythmEngineRef.current.getElapsedTime();

        currentBeats.forEach(beat => {
          const beatTime = beat.time;
          const timeUntilBeat = beatTime - elapsedTime;

          if (timeUntilBeat <= 1500 && !spawnedBeatsRef.current.has(beatTime)) {
            enemyManagerRef.current.spawnEnemy(beat.enemyType, playerXRef.current);
            spawnedBeatsRef.current.add(beatTime);
          }

          if (timeUntilBeat <= 0 && timeUntilBeat > -50 && lastBeatPlayedRef.current < beatTime) {
            AudioManager.playBeat();
            lastBeatPlayedRef.current = beatTime;
          }
        });

        playerRef.current.update(deltaTime);
        enemyManagerRef.current.update(deltaTime);
        effectsManagerRef.current.update(deltaTime);
        gameUIRef.current.update(deltaTime);

        if (ultimateModeRef.current) {
          ultimateTimerRef.current -= deltaTime;
          if (ultimateTimerRef.current <= 0) {
            ultimateModeRef.current = false;
            playerRef.current.setUltimateMode(false);
            gameUIRef.current.setUltimateMode(false);
          }
        }

        if (qiRef.current >= 100 && !ultimateModeRef.current) {
          ultimateModeRef.current = true;
          ultimateTimerRef.current = 5000;
          playerRef.current.setUltimateMode(true);
          gameUIRef.current.setUltimateMode(true);
          qiRef.current = 0;
          gameUIRef.current.setQi(0);
          AudioManager.playPowerUp();
          effectsManagerRef.current.triggerShake(10, 500);
          effectsManagerRef.current.triggerInkWave(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5);
        }

        enemyManagerRef.current.render(ctx);
        playerRef.current.render(ctx);
        effectsManagerRef.current.render(ctx);

        const progress = rhythmEngineRef.current.getProgress();
        gameUIRef.current.setProgress(progress);
        gameUIRef.current.setBeatTimeline(currentBeats, elapsedTime, rhythmEngineRef.current.getBeatInterval());
        gameUIRef.current.render(ctx);

        if (rhythmEngineRef.current.isFinished()) {
          const stats = rhythmEngineRef.current.getStats();
          const gameStats: GameStats = {
            perfect: stats.perfect,
            great: stats.great,
            good: stats.good,
            miss: stats.miss,
            total: stats.total,
            accuracy: stats.accuracy,
            score: scoreRef.current,
            maxCombo: maxComboRef.current
          };
          onGameEnd(gameStats);
        }
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, onGameEnd]);

  const handleCanvasResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scaleX = containerWidth / CANVAS_WIDTH;
    const scaleY = containerHeight / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    canvas.style.width = `${CANVAS_WIDTH * scale}px`;
    canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
  }, []);

  // 引擎只在组件挂载时初始化一次
  useEffect(() => {
    initializeEngines();
    handleCanvasResize();
    window.addEventListener('resize', handleCanvasResize);

    return () => {
      if (inputManagerRef.current) {
        inputManagerRef.current.destroy();
      }
      window.removeEventListener('resize', handleCanvasResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // gameLoop 单独管理，gameState 变化时重新绑定
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  useEffect(() => {
    if (inputManagerRef.current) {
      inputManagerRef.current.onInput(handleInput);
    }
  }, [handleInput]);

  useEffect(() => {
    if (gameState === 'playing') {
      startGame();
    } else if (gameState === 'result') {
      AudioManager.stopMusic();
    }
  }, [gameState, startGame]);

  return (
    <canvas 
      ref={canvasRef} 
      className="game-canvas"
    />
  );
};

export default GameCanvas;
