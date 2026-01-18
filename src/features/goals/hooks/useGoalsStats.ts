import { useMemo } from 'react';

import { Goal } from '@/features/goals/types';

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseDateKey = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const useGoalsStats = (goals: Goal[]) =>
  useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((goal) => goal.status === 'done').length;
    const open = total - completed;
    const completionPct = total ? Math.round((completed / total) * 100) : 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const completedThisWeek = goals.filter(
      (goal) =>
        goal.status === 'done' && new Date(goal.updatedAt) >= oneWeekAgo
    ).length;

    const completionDays = new Set<string>();
    goals.forEach((goal) => {
      if (goal.status !== 'done') return;
      completionDays.add(formatDateKey(new Date(goal.updatedAt)));
    });

    let currentStreak = 0;
    let bestStreak = 0;

    if (completionDays.size > 0) {
      const today = new Date();
      const cursor = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      while (completionDays.has(formatDateKey(cursor))) {
        currentStreak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }

      const sorted = Array.from(completionDays).sort(
        (a, b) => parseDateKey(b).getTime() - parseDateKey(a).getTime()
      );

      let streak = 0;
      let prevDate: Date | null = null;

      sorted.forEach((key) => {
        const date = parseDateKey(key);
        if (!prevDate) {
          streak = 1;
        } else {
          const diffDays = Math.round(
            (prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
          );
          streak = diffDays === 1 ? streak + 1 : 1;
        }
        if (streak > bestStreak) bestStreak = streak;
        prevDate = date;
      });
    }

    const recentCompleted = goals
      .filter((goal) => goal.status === 'done')
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 2);

    return {
      total,
      completed,
      open,
      completionPct,
      completedThisWeek,
      currentStreak,
      bestStreak,
      recentCompleted,
    };
  }, [goals]);
