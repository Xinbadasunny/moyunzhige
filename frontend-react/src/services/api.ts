const API_BASE_URL = '/api';

export interface LevelData {
  id: string;
  name: string;
  description: string;
  scene: string;
  bpm: number;
  difficulty: number;
  beats: BeatData[];
  createdAt: number;
  updatedAt: number;
}

export interface BeatData {
  time: number;
  type: string;
  duration: number;
  enemyType: string;
}

export interface ScoreSubmission {
  levelId: string;
  playerName: string;
  score: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  missCount: number;
  accuracy: number;
}

export interface LeaderboardEntry {
  rank: string;
  playerName: string;
  score: number;
  maxCombo: number;
  accuracy: number;
  grade: string;
  playedAt: number;
}

export async function fetchLevels(): Promise<LevelData[]> {
  const response = await fetch(`${API_BASE_URL}/levels`);
  if (!response.ok) throw new Error('获取关卡列表失败');
  return response.json();
}

export async function fetchLevelById(levelId: string): Promise<LevelData> {
  const response = await fetch(`${API_BASE_URL}/levels/${encodeURIComponent(levelId)}`);
  if (!response.ok) throw new Error('获取关卡详情失败');
  return response.json();
}

export async function submitScore(scoreData: ScoreSubmission): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scoreData),
  });
  if (!response.ok) throw new Error('提交成绩失败');
}

export async function fetchLeaderboard(levelId: string, limit = 10): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${API_BASE_URL}/scores/leaderboard/${encodeURIComponent(levelId)}?limit=${limit}`);
  if (!response.ok) throw new Error('获取排行榜失败');
  return response.json();
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    await fetch(`${API_BASE_URL}/levels`, { method: 'GET' });
    return true;
  } catch {
    return false;
  }
}
