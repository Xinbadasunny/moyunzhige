export type GameState = 'loading' | 'start' | 'playing' | 'result';

export interface GameStats {
  score: number;
  maxCombo: number;
  perfect: number;
  great: number;
  good: number;
  miss: number;
  total: number;
  accuracy: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  bpm: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  canvasWidth: 1280,
  canvasHeight: 720,
  bpm: 120,
};
