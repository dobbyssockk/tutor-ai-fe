import type {
  AssessmentCreateResponse,
  AssessmentSummary,
} from '@/features/assessments/types';
import type { Goal, GoalTopic } from '@/features/goals/types';

export type GoalCardProps = {
  goal: Goal;
  assessmentsByTopic: Map<string, AssessmentSummary>;
  onDeleteGoal: (goalId: string) => void;
  onStartLesson: (payload: { goalId: string; topicId: string }) => void;
  onCreateTopicAssessment: (
    payload: { goalId: string; topicId: string; regenerate?: boolean },
    options?: {
      onSuccess?: (data: AssessmentCreateResponse) => void;
      onSettled?: () => void;
    }
  ) => void;
  onStartAssessment: (assessmentId: string) => void;
  isStartingLesson: boolean;
  isStartingAssessment: boolean;
  isCreatingAssessment: boolean;
};

export type GoalTopicCardProps = {
  goalId: string;
  minutesPerDay?: number | null;
  topic: GoalTopic;
  index: number;
  now: number;
  assessment?: AssessmentSummary;
  onStartLesson: (payload: { goalId: string; topicId: string }) => void;
  onCreateTopicAssessment: (
    payload: { goalId: string; topicId: string; regenerate?: boolean },
    options?: {
      onSuccess?: (data: AssessmentCreateResponse) => void;
      onSettled?: () => void;
    }
  ) => void;
  onStartAssessment: (assessmentId: string) => void;
  isStartingLesson: boolean;
  isStartingAssessment: boolean;
  isCreatingAssessment: boolean;
  creatingTopicId: string | null;
  setCreatingTopicId: (topicId: string | null) => void;
};
