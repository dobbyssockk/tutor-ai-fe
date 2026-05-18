import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/shared/lib/utils';

import {
  createAssessmentReviewChat,
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
import { queryKeys } from '@/shared/lib/queryKeys';

export const useAssessments = () =>
  useQuery({ queryKey: queryKeys.assessments.all, queryFn: getAssessments });

const createRequiredIdQueryFn = <T>(
  id: string | undefined,
  fetcher: (requiredId: string) => Promise<T>,
  idName: string
) => {
  return async () => {
    if (!id) {
      throw new Error(`${idName} is required`);
    }
    return fetcher(id);
  };
};

export const useAssessmentAttempt = (attemptId?: string) => {
  return useQuery({
    queryKey: queryKeys.assessments.attempt(attemptId),
    queryFn: createRequiredIdQueryFn(
      attemptId,
      getAssessmentAttempt,
      'attemptId'
    ),
    enabled: Boolean(attemptId),
  });
};

export const useAssessmentResult = (attemptId?: string) => {
  return useQuery({
    queryKey: queryKeys.assessments.result(attemptId),
    queryFn: createRequiredIdQueryFn(
      attemptId,
      getAssessmentResult,
      'attemptId'
    ),
    enabled: Boolean(attemptId),
  });
};

export const useStartAssessment = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: startAssessment,
    onSuccess: (data) => {
      const attemptId = data.attempt.id;
      const assessmentId = data.attempt.assessmentId;

      qc.setQueryData<AssessmentAttemptResponse>(
        queryKeys.assessments.attempt(attemptId),
        data
      );

      navigate(`/assessments/${assessmentId}/attempts/${attemptId}`);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err) || 'Не удалось начать тест. Попробуйте еще раз.');
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
        queryKeys.assessments.result(variables.attemptId),
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

      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
      qc.invalidateQueries({ queryKey: queryKeys.assessments.all });

      navigate(`/assessments/attempts/${variables.attemptId}/results`);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err) || 'Не удалось отправить тест. Попробуйте еще раз.');
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
      qc.invalidateQueries({ queryKey: queryKeys.assessments.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err) || 'Не удалось создать тест. Попробуйте еще раз.');
    },
  });
};

export const useCreateAssessmentReviewChat = (attemptId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!attemptId) {
        throw new Error('attemptId is required');
      }
      return createAssessmentReviewChat(attemptId);
    },
    onSuccess: (data) => {
      if (!attemptId) return;
      qc.setQueryData<AssessmentResultResponse>(
        queryKeys.assessments.result(attemptId),
        (prev) =>
          prev
            ? {
                result: {
                  ...prev.result,
                  chatId: data.chatId,
                },
              }
            : prev
      );
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err) || 'Не удалось открыть разбор в чате. Попробуйте еще раз.');
    },
  });
};
