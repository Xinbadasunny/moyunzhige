export type QuestionType = 'MULTIPLE_CHOICE' | 'TEXT_INPUT';

export type TalentDimension = 
  | 'CREATIVITY'
  | 'LOGIC'
  | 'LEADERSHIP'
  | 'COMMUNICATION'
  | 'EXECUTION'
  | 'LEARNING';

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  options?: string[];
  questionNumber: number;
}

export interface SubmitAnswerRequest {
  answerContent?: string;
  selectedOption?: number;
}

export interface StartResponse {
  sessionId: string;
  firstQuestion: Question;
  totalQuestions: number;
  existingResult?: TalentResult;
}

export interface SubmitResponse {
  completed: boolean;
  nextQuestion?: Question;
  currentNumber: number;
  totalQuestions: number;
  result?: TalentResult;
}

export interface TalentScore {
  dimension: TalentDimension;
  score: number;
}

export interface TalentResult {
  talentScores: Record<string, number> | TalentScore[];
  personalityType: string;
  personalityDescription: string;
  workStyle: string;
  workStyleDescription: string;
  strengths: string[];
  summary: string;
}