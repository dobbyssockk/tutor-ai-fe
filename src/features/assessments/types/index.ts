export type AssessmentSummary = {
  id: string;
  title: string;
  description?: string | null;
  topic?: string | null;
  level?: string | null;
  goalId?: string | null;
  goalTitle?: string | null;
  goalTopicId?: string | null;
  goalTopicTitle?: string | null;
  goalTopicDueAt?: string | null;
  questionCount: number;
  attemptsCount?: number;
  passesRequired?: number;
  passesCompleted?: number;
  recentAttempts?: Array<{
    id: string;
    score: number;
    completedAt: string;
  }>;
  lastAttempt?: {
    id: string;
    score: number | null;
    completedAt: string;
  } | null;
  canStart: boolean;
  nextAvailableAt?: string | null;
  recommended?: boolean;
};

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer?: string;
};

export type AssessmentAttempt = {
  id: string;
  assessmentId: string;
  questions: AssessmentQuestion[];
  totalCount: number;
  createdAt: string;
};

export type AssessmentListResponse = {
  assessments: AssessmentSummary[];
};

export type AssessmentAttemptResponse = {
  attempt: AssessmentAttempt;
};

export type AssessmentSubmitResponse = {
  attempt: {
    id: string;
    assessmentId: string;
    score: number;
    correctCount: number;
    totalCount: number;
    completedAt: string;
  };
  chatId: string | null;
  mistakesCount: number;
};

export type AssessmentReviewChatResponse = {
  chatId: string;
};

export type AssessmentCreateResponse = {
  assessment: {
    id: string;
    title: string;
    description?: string | null;
    topic?: string | null;
    level?: string | null;
    questionCount: number;
  };
};

export type AssessmentResult = {
  attemptId: string;
  assessmentId: string;
  score: number;
  correctCount: number;
  totalCount: number;
  completedAt: string;
  chatId: string | null;
  mistakesCount: number;
  goalId?: string | null;
  goalTopicId?: string | null;
  review: Array<{
    id: string;
    prompt: string;
    options: string[];
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
    explanation?: string | null;
  }>;
};

export type AssessmentResultResponse = {
  result: AssessmentResult;
};

export type AssessmentAnswerPayload = {
  questionId: string;
  answer: string;
};
