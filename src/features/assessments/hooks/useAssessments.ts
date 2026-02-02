import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  createTopicAssessment,
  getAssessmentAttempt,
  getAssessmentResult,
  getAssessments,
  startAssessment,
  submitAssessment,
} from '@/features/assessments/services';
import {
  AssessmentAttemptResponse,
  AssessmentResultResponse,
} from '@/features/assessments/types';

export const useAssessments = () =>
  useQuery({ queryKey: ['assessments'], queryFn: getAssessments });

export const useAssessmentAttempt = (attemptId?: string) =>
  useQuery({
    queryKey: ['assessmentAttempt', attemptId],
    queryFn: () => getAssessmentAttempt(attemptId as string),
    enabled: !!attemptId,
  });

export const useAssessmentResult = (attemptId?: string) =>
  useQuery({
    queryKey: ['assessmentResult', attemptId],
    queryFn: () => getAssessmentResult(attemptId as string),
    enabled: !!attemptId,
  });

export const useStartAssessment = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: startAssessment,
    onSuccess: (data) => {
      const attemptId = data.attempt.id;
      const assessmentId = data.attempt.assessmentId;

      qc.setQueryData<AssessmentAttemptResponse>(
        ['assessmentAttempt', attemptId],
        data
      );

      navigate(`/assessments/${assessmentId}/attempts/${attemptId}`);
    },
    onError: (err) => {
      console.error('Start assessment error:', err);
    },
  });
};

export const useSubmitAssessment = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({
      attemptId,
      answers,
    }: {
      attemptId: string;
      answers: { questionId: string; answer: string }[];
    }) => submitAssessment(attemptId, answers),
    onSuccess: (data, variables) => {
      qc.setQueryData<AssessmentResultResponse>(
        ['assessmentResult', variables.attemptId],
        {
          result: {
            attemptId: data.attempt.id,
            assessmentId: data.attempt.assessmentId,
            score: data.attempt.score,
            correctCount: data.attempt.correctCount,
            totalCount: data.attempt.totalCount,
            completedAt: data.attempt.completedAt,
            chatId: data.chatId,
            mistakesCount: data.mistakesCount,
            goalId: null,
            goalTopicId: null,
            review: [],
          },
        }
      );

      qc.invalidateQueries({ queryKey: ['goals'] });
      qc.invalidateQueries({ queryKey: ['assessments'] });

      navigate(`/assessments/attempts/${variables.attemptId}/results`);
    },
    onError: (err) => {
      console.error('Submit assessment error:', err);
    },
  });
};

export const useCreateTopicAssessment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      goalId,
      topicId,
      regenerate,
    }: {
      goalId: string;
      topicId: string;
      regenerate?: boolean;
    }) => createTopicAssessment(goalId, topicId, regenerate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assessments'] });
    },
    onError: (err) => {
      console.error('Create topic assessment error:', err);
    },
  });
};
