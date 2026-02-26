import React, { useState, useEffect } from 'react';
import { Question, SubmitAnswerRequest } from '../types/assessment';

interface QuestionPageProps {
  question: Question;
  currentNumber: number;
  totalQuestions: number;
  onSubmit: (answer: SubmitAnswerRequest) => void;
  loading?: boolean;
}

export const QuestionPage: React.FC<QuestionPageProps> = ({
  question,
  currentNumber,
  totalQuestions,
  onSubmit,
  loading = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const [answerContent, setAnswerContent] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setSelectedOption(undefined);
    setAnswerContent('');
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [question.id]);

  const getStageLabel = () => {
    if (currentNumber === 1) return '身份识别';
    if (currentNumber >= 2 && currentNumber <= 13) return '第一阶段 · 工作电池模式';
    if (currentNumber >= 14 && currentNumber <= 25) return '第二阶段 · 天生超能力';
    if (currentNumber >= 26 && currentNumber <= 35) return '第三阶段 · 未来事业地图';
    return '';
  };

  const handleSubmit = () => {
    if (loading) return;

    const answer: SubmitAnswerRequest = {};

    const isMultipleChoice = question.type === 'MULTIPLE_CHOICE' || question.type === 'choice';
    const isTextInput = question.type === 'TEXT_INPUT' || question.type === 'text';

    if (isMultipleChoice) {
      if (selectedOption === undefined) return;
      answer.selectedOption = selectedOption;
      answer.answerContent = question.options?.[selectedOption] || '';
    } else if (isTextInput) {
      if (!answerContent.trim()) return;
      answer.answerContent = answerContent;
    }

    onSubmit(answer);
  };

  const isMultipleChoice = question.type === 'MULTIPLE_CHOICE' || question.type === 'choice';
  const isTextInput = question.type === 'TEXT_INPUT' || question.type === 'text';

  return (
    <div className={`page-transition ${isAnimating ? 'fade-in' : ''}`}>
      <div className="container">
        <div className="card">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${(currentNumber / totalQuestions) * 100}%` }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <span style={{
              background: 'rgba(49, 130, 206, 0.1)',
              color: '#3182ce',
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8125rem'
            }}>
              {getStageLabel()}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="question-number">
              第 {currentNumber} 题 / 共 {totalQuestions} 题
            </span>
            <span style={{ color: '#718096', fontSize: '0.875rem' }}>
              {Math.round((currentNumber / totalQuestions) * 100)}% 完成
            </span>
          </div>

          <div className="question-content">
            {question.content}
          </div>

          {isMultipleChoice && question.options && (
            <div style={{ marginBottom: '2rem' }}>
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`option-card ${selectedOption === index ? 'selected' : ''}`}
                  onClick={() => !loading && setSelectedOption(index)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedOption(index);
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="option"
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    disabled={loading}
                  />
                  <span style={{ flex: 1, fontSize: '1.05rem' }}>{option}</span>
                </div>
              ))}
            </div>
          )}

          {!isMultipleChoice && isTextInput && (
            <div style={{ marginBottom: '2rem' }}>
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="请输入你的回答..."
                disabled={loading}
                style={{ minHeight: '150px' }}
              />
              <p style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.5rem' }}>
                请尽可能详细地描述你的想法和经历
              </p>
            </div>
          )}

          <div style={{ textAlign: 'right' }}>
            <button
              onClick={handleSubmit}
              disabled={loading || (isMultipleChoice && selectedOption === undefined) || (isTextInput && !answerContent.trim())}
              style={{ minWidth: '150px' }}
            >
              {loading ? '提交中...' : currentNumber === totalQuestions ? '完成测评' : '提交答案'}
            </button>
          </div>

          {loading && (
            <div className="loading">
              <div className="spinner" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};