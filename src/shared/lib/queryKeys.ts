export const queryKeys = {
  auth: {
    me: ['me'] as const,
  },
  goals: {
    all: ['goals'] as const,
  },
  assessments: {
    all: ['assessments'] as const,
    attempt: (attemptId?: string) => ['assessmentAttempt', attemptId] as const,
    result: (attemptId?: string) => ['assessmentResult', attemptId] as const,
  },
  chats: {
    all: ['chats'] as const,
    detail: (chatId?: string) => ['chat', chatId] as const,
  },
};
