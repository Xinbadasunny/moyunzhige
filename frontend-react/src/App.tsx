import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { QuestionPage } from './components/QuestionPage';
import { ResultPage } from './components/ResultPage';
import { api } from './services/api';
import { Question, SubmitAnswerRequest, TalentResult } from './types/assessment';
import './styles/index.css';

type Page = 'home' | 'question' | 'result';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentNumber, setCurrentNumber] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [result, setResult] = useState<TalentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [assessmentKey, setAssessmentKey] = useState<string>('');
  const [modelType, setModelType] = useState<string>('qwen');

  const handleStart = async (key: string, selectedModelType: string) => {
    setLoading(true);
    setError('');
    setAssessmentKey(key);
    setModelType(selectedModelType);
    try {
      const response = await api.startAssessment(key, selectedModelType);
      
      if (response.existingResult) {
        setResult(response.existingResult);
        setPage('result');
      } else {
        setSessionId(response.sessionId);
        setCurrentQuestion(response.firstQuestion);
        setCurrentNumber(1);
        setTotalQuestions(response.totalQuestions);
        setPage('question');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '启动测评失败，请稍后重试';
      setError(errorMessage);
      console.error('Failed to start assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answer: SubmitAnswerRequest) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.submitAnswer(sessionId, answer);

      if (response.completed && response.result) {
        setResult(response.result);
        setPage('result');
      } else if (response.nextQuestion) {
        setCurrentQuestion(response.nextQuestion);
        setCurrentNumber(response.currentNumber);
      }
    } catch (err) {
      setError('提交答案失败，请稍后重试');
      console.error('Failed to submit answer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setPage('home');
    setSessionId('');
    setCurrentQuestion(null);
    setCurrentNumber(0);
    setTotalQuestions(0);
    setResult(null);
    setError('');
    setAssessmentKey('');
    setModelType('qwen');
  };

  if (loading && !currentQuestion) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ color: '#e53e3e' }}>出错了</h2>
          <p>{error}</p>
          <button onClick={handleRestart} style={{ marginTop: '1rem' }}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  switch (page) {
    case 'home':
      return <HomePage onStart={handleStart} />;
    case 'question':
      return currentQuestion ? (
        <QuestionPage
          question={currentQuestion}
          currentNumber={currentNumber}
          totalQuestions={totalQuestions}
          onSubmit={handleSubmitAnswer}
          loading={loading}
        />
      ) : null;
    case 'result':
      return result ? (
        <ResultPage result={result} onRestart={handleRestart} />
      ) : null;
    default:
      return <HomePage onStart={handleStart} />;
  }
}

export default App;