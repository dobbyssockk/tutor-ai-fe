export type GoalStatus = 'todo' | 'done';

export type GoalTopicStatus = 'locked' | 'in_progress' | 'done';

export type GoalTopic = {
  id: string;
  order: number;
  title: string;
  summary?: string | null;
  subtopics?: string[] | null;
  durationWeeks: number;
  status: GoalTopicStatus;
  startAt?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  lessonChatId?: string | null;
  assessmentAttemptId?: string | null;
};

export type Goal = {
  id: string;
  title: string;
  description?: string | null;
  currentLevel?: string | null;
  targetLevel?: string | null;
  minutesPerDay?: number | null;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
  topics?: GoalTopic[];
};

export type GoalInput = {
  title: string;
  description: string;
  currentLevel?: string;
  targetLevel?: string;
  minutesPerDay: number;
  notes?: string;
};

export type GoalsResponse = {
  goals: Goal[];
};

export type GoalResponse = {
  goal: Goal;
};
