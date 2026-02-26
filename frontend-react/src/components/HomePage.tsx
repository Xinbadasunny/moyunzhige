import React, { useState } from 'react';

interface HomePageProps {
  onStart: (key: string, modelType: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  const [key, setKey] = useState<string>('');
  const [modelType, setModelType] = useState<string>('qwen');
  const [error, setError] = useState<string>('');

  const handleStart = () => {
    if (!key.trim()) {
      setError('请输入测评密钥');
      return;
    }
    setError('');
    onStart(key.trim(), modelType);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  return (
    <div className="page-transition">
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              style={{ margin: '0 auto 1.5rem' }}
            >
              <circle cx="40" cy="40" r="36" fill="rgba(26, 54, 93, 0.1)" />
              <circle cx="40" cy="40" r="28" fill="rgba(49, 130, 206, 0.15)" />
              <path
                d="M40 20 L45 35 L60 35 L48 45 L53 60 L40 50 L27 60 L32 45 L20 35 L35 35 Z"
                fill="#1a365d"
              />
            </svg>
            <h1>天赋测评系统</h1>
            <h2 style={{ color: '#3182ce', fontSize: '1.25rem', marginTop: '0.5rem' }}>
              发现你的隐藏天赋
            </h2>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              通过科学的测评体系，全面了解你的六大核心天赋维度。
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              无论你是职场新人还是资深专业人士，这份报告都将帮助你认识自我，
              找准发展方向，释放内在潜能。
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              测评涵盖创造力、逻辑思维、领导力、沟通能力、执行力和学习能力等维度，
              为你提供个性化的人才分析报告。
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
              测评密钥
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="请输入测评密钥"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                border: `1px solid ${error ? '#e53e3e' : '#e2e8f0'}`,
                borderRadius: '8px',
                marginBottom: '0.5rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3182ce'}
              onBlur={(e) => e.target.style.borderColor = error ? '#e53e3e' : '#e2e8f0'}
            />
            {error && (
              <p style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {error}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
              选择模型
            </label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3182ce'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            >
              <option value="qwen">通义千问</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button
              onClick={handleStart}
              style={{
                fontSize: '1.125rem',
                padding: '1rem 2.5rem',
                minWidth: '200px',
              }}
            >
              验证并开始测评
            </button>
          </div>

          <div className="decorative-line" />

          <div className="footer-note">
            <p style={{ margin: 0 }}>
              共 10 道题，约 5 分钟完成
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem' }}>
              请根据你的真实情况作答，以获得最准确的分析结果
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