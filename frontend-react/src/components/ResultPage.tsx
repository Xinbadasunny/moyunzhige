import React, { useState } from 'react';
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
import { TalentResult, TalentScore, CareerPath, ActionPlan } from '../types/assessment';

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

const CAREER_PATH_ICONS = ['🏢', '🚀', '💡'];
const CAREER_PATH_PREFIXES = ['精英职场', '创新事业', '超级个体'];

const DIMENSION_COLORS: Record<string, string> = {
  CREATIVITY: '#3182ce',
  ANALYSIS: '#2b6cb0',
  LOGIC: '#2c5282',
  LEADERSHIP: '#1a365d',
  COMMUNICATION: '#4299e1',
  EXECUTION: '#63b3ed',
  LEARNING: '#90cdf4',
};

interface CareerPathCardProps {
  path: CareerPath;
  index: number;
}

const CareerPathCard: React.FC<CareerPathCardProps> = ({ path, index }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const icon = CAREER_PATH_ICONS[index % CAREER_PATH_ICONS.length];
  
  return (
    <div style={{ 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px', 
      padding: '1.5rem',
      backgroundColor: '#ffffff',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ 
          fontSize: '2rem', 
          flexShrink: 0,
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: '0 0 0.75rem 0', 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#1a365d' 
          }}>
            {path.name}
          </h4>
          <p style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '0.9375rem', 
            color: '#4a5568', 
            lineHeight: '1.6' 
          }}>
            {path.generalAdvice}
          </p>
          
          {path.identityAdvice && Object.keys(path.identityAdvice).length > 0 && (
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#3182ce',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  ':hover': {
                    color: '#2b6cb0'
                  }
                }}
              >
                <span style={{ 
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  display: 'inline-block'
                }}>
                  ▼
                </span>
                {isExpanded ? '收起身份适配建议' : '展开身份适配建议'}
              </button>
              
              {isExpanded && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: 'rgba(49, 130, 206, 0.05)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(49, 130, 206, 0.1)'
                }}>
                  {Object.entries(path.identityAdvice).map(([identity, advice], idx) => (
                    <div key={idx} style={{ marginBottom: idx < Object.keys(path.identityAdvice).length - 1 ? '0.75rem' : '0' }}>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: '#1a365d', 
                        marginBottom: '0.25rem' 
                      }}>
                        {identity}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#4a5568', lineHeight: '1.5' }}>
                        {advice}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
              <circle cx="30" cy="30" r="28" fill="rgba(255, 255, 255, 0.15)" />
              <path
                d="M30 15 L33 25 L43 25 L35 32 L38 42 L30 36 L22 42 L25 32 L17 25 L27 25 Z"
                fill="white"
              />
            </svg>
            <h1 className="gradient-text">你的天赋报告</h1>
            <p className="result-hero-subtitle">启航导师 · 职业发展导航报告</p>
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
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              style={{ marginBottom: '1rem' }}
            >
              <text x="20" y="32" textAnchor="middle" fill="rgba(255, 255, 255, 0.3)" fontSize="48" fontFamily="Georgia, serif">"</text>
            </svg>
            <h2>{result.personalityType}</h2>
            <p>{result.personalityDescription}</p>
          </div>

          <div className="result-workstyle-card" style={{ marginBottom: '2rem' }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              style={{ marginBottom: '1rem' }}
            >
              <text x="20" y="32" textAnchor="middle" fill="rgba(255, 255, 255, 0.3)" fontSize="48" fontFamily="Georgia, serif">"</text>
            </svg>
            <h2>{result.workStyle}</h2>
            <p>{result.workStyleDescription}</p>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>你的天赋引擎</h3>
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

          {result.careerPaths && result.careerPaths.length > 0 && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#1a365d' }}>三大航向</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {result.careerPaths.map((path, index) => (
                  <CareerPathCard key={index} path={path} index={index} />
                ))}
              </div>
            </div>
          )}

          {result.actionPlan && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#1a365d' }}>
                下一步行动
              </h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '0.5rem 1rem', 
                  backgroundColor: 'rgba(49, 130, 206, 0.1)', 
                  color: '#3182ce', 
                  borderRadius: '8px', 
                  fontSize: '0.875rem', 
                  fontWeight: '500' 
                }}>
                  {result.actionPlan.identityLabel}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {result.actionPlan.steps.map((step, index) => (
                  <div key={index} style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    padding: '1.25rem',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      boxShadow: '0 4px 12px rgba(49, 130, 206, 0.1)',
                      borderColor: '#3182ce'
                    }
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: '#3182ce', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: '600', 
                        fontSize: '0.875rem',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#1a365d' }}>
                          {step.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#4a5568', lineHeight: '1.6' }}>
                          {step.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {result.actionPlan.closingMessage && (
                <div style={{ 
                  marginTop: '2rem', 
                  padding: '1.5rem', 
                  backgroundColor: 'rgba(49, 130, 206, 0.05)', 
                  borderRadius: '12px',
                  borderLeft: '4px solid #3182ce'
                }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '1rem', 
                    color: '#1a365d', 
                    lineHeight: '1.8',
                    fontWeight: '500',
                    textAlign: 'center'
                  }}>
                    {result.actionPlan.closingMessage}
                  </p>
                </div>
              )}
            </div>
          )}

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