import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { TalentResult, TalentScore } from '../types/assessment';

interface ResultPageProps {
  result: TalentResult;
  onRestart: () => void;
}

const DIMENSION_LABELS: Record<string, string> = {
  CREATIVITY: '创造力',
  ANALYSIS: '分析力',
  LOGIC: '逻辑思维',
  LEADERSHIP: '领导力',
  COMMUNICATION: '沟通力',
  EXECUTION: '执行力',
  LEARNING: '学习力',
};

const DIMENSION_COLORS: Record<string, string> = {
  CREATIVITY: '#3182ce',
  ANALYSIS: '#2b6cb0',
  LOGIC: '#2c5282',
  LEADERSHIP: '#1a365d',
  COMMUNICATION: '#4299e1',
  EXECUTION: '#63b3ed',
  LEARNING: '#90cdf4',
};

export const ResultPage: React.FC<ResultPageProps> = ({ result, onRestart }) => {
  const normalizeTalentScores = (scores: Record<string, number> | TalentScore[]): TalentScore[] => {
    if (Array.isArray(scores)) {
      return scores;
    }
    return Object.entries(scores).map(([dimension, score]) => ({
      dimension: dimension as any,
      score,
    }));
  };

  const normalizedScores = normalizeTalentScores(result.talentScores);

  const radarData = normalizedScores.map((item) => ({
    dimension: DIMENSION_LABELS[item.dimension] || item.dimension,
    value: item.score,
    fullMark: 100,
  }));

  const barData = [...normalizedScores]
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      name: DIMENSION_LABELS[item.dimension] || item.dimension,
      score: item.score,
      color: DIMENSION_COLORS[item.dimension] || '#3182ce',
    }));

  return (
    <div className="page-transition">
      <div className="container">
        <div className="card">
          <div className="result-hero">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              style={{ margin: '0 auto 1rem' }}
            >
              <circle cx="30" cy="30" r="28" fill="rgba(26, 54, 93, 0.08)" />
              <path
                d="M30 15 L33 25 L43 25 L35 32 L38 42 L30 36 L22 42 L25 32 L17 25 L27 25 Z"
                fill="#1a365d"
              />
            </svg>
            <h1>你的天赋报告</h1>
            <p className="result-hero-subtitle">基于 RIASEC 霍兰德职业兴趣理论</p>
          </div>

          <div className="result-summary-card">
            <h3>综合总结</h3>
            {result.summary.split('\n').map((paragraph, index) => (
              <p key={index} className={index === 0 ? 'result-summary-quote' : 'result-summary-text'}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="card result-chart-card" style={{ marginBottom: '2rem' }}>
            <h3>天赋维度分析</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: '#4a5568', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#718096', fontSize: 11 }}
                  />
                  <Radar
                    name="天赋分数"
                    dataKey="value"
                    stroke="#3182ce"
                    fill="#3182ce"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card result-chart-card" style={{ marginBottom: '2rem' }}>
            <h3>天赋排名</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: '#718096', fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#4a5568', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [`${value}分`, '天赋分数']}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="result-personality-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.75rem' }}>性格类型</h3>
            <h2>{result.personalityType}</h2>
            <p>{result.personalityDescription}</p>
          </div>

          <div className="result-workstyle-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.75rem' }}>做事风格</h3>
            <h2>{result.workStyle}</h2>
            <p>{result.workStyleDescription}</p>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>擅长的事情</h3>
            <div className="result-strength-list">
              {result.strengths.map((strength, index) => (
                <div key={index} className="result-strength-item">
                  <span className="result-strength-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="result-strength-text">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="decorative-line" />

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={onRestart}
              className="secondary"
              style={{ minWidth: '180px' }}
            >
              重新测评
            </button>
          </div>

          <div className="footer-note">
            <p style={{ margin: 0 }}>
              报告生成时间：{new Date().toLocaleDateString('zh-CN')}
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem' }}>
              本报告基于你的回答生成，建议定期重新测评以追踪个人成长
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <svg
            width="200"
            height="40"
            viewBox="0 0 200 40"
            fill="none"
          >
            <line x1="0" y1="20" x2="60" y2="20" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="100" cy="20" r="4" fill="rgba(49, 130, 206, 0.2)" />
            <circle cx="120" cy="12" r="2" fill="rgba(26, 54, 93, 0.15)" />
            <circle cx="80" cy="28" r="2" fill="rgba(26, 54, 93, 0.15)" />
            <line x1="140" y1="20" x2="200" y2="20" stroke="#e2e8f0" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
};