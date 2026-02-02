import customAxios from '@/shared/lib/axios';

import {
  AssessmentAnswerPayload,
  AssessmentAttemptResponse,
  AssessmentCreateResponse,
  AssessmentListResponse,
  AssessmentResultResponse,
  AssessmentSubmitResponse,
} from '@/features/assessments/types';

export const getAssessments = async (): Promise<AssessmentListResponse> => {
  const { data } = await customAxios.get('/assessments');
  return data;
};

export const startAssessment = async (
  assessmentId: string
): Promise<AssessmentAttemptResponse> => {
  const { data } = await customAxios.post(
    `/assessments/${assessmentId}/attempts`
  );
  return data;
};

export const getAssessmentAttempt = async (
  attemptId: string
): Promise<AssessmentAttemptResponse> => {
  const { data } = await customAxios.get(`/assessments/attempts/${attemptId}`);
  return data;
};

export const submitAssessment = async (
  attemptId: string,
  answers: AssessmentAnswerPayload[]
): Promise<AssessmentSubmitResponse> => {
  const { data } = await customAxios.post(
    `/assessments/attempts/${attemptId}/submit`,
    { answers }
  );
  return data;
};

export const getAssessmentResult = async (
  attemptId: string
): Promise<AssessmentResultResponse> => {
  const { data } = await customAxios.get(
    `/assessments/attempts/${attemptId}/results`
  );
  return data;
};

export const createTopicAssessment = async (
  goalId: string,
  topicId: string,
  regenerate?: boolean
): Promise<AssessmentCreateResponse> => {
  const { data } = await customAxios.post(
    `/goals/${goalId}/topics/${topicId}/assessment`,
    regenerate ? { regenerate: true } : undefined
  );
  return data;
};
