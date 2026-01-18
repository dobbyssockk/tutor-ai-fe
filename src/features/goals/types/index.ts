export type GoalStatus = 'todo' | 'done';

export type Goal = {
  id: string;
  title: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
};

export type GoalInput = {
  title: string;
  notes?: string;
};

export type GoalUpdateInput = Partial<Pick<Goal, 'title' | 'notes' | 'status'>>;

export type GoalsResponse = {
  goals: Goal[];
};

export type GoalResponse = {
  goal: Goal;
};
