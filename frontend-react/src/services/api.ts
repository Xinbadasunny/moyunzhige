import { Question, StartResponse, SubmitAnswerRequest, SubmitResponse, TalentResult } from '../types/assessment';

const API_BASE_URL = '/api';

export const api = {
  async startAssessment(key: string, modelType: string): Promise<StartResponse> {
    const response = await fetch(`${API_BASE_URL}/assessment/start?key=${encodeURIComponent(key)}&modelType=${encodeURIComponent(modelType)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to start assessment');
    }
    
    return response.json();
  },

  async submitAnswer(sessionId: string, request: SubmitAnswerRequest): Promise<SubmitResponse> {
    const response = await fetch(`${API_BASE_URL}/assessment/${sessionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit answer');
    }
    
    return response.json();
  },

  async getResult(sessionId: string): Promise<TalentResult> {
    const response = await fetch(`${API_BASE_URL}/assessment/${sessionId}/result`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get result');
    }
    
    return response.json();
  },
};