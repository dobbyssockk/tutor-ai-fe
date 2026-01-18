import { useGoals } from '@/features/goals/hooks/useGoals';
import { useGoalsStats } from '@/features/goals/hooks/useGoalsStats';

const ProgressCard = () => {
  const { data: goalsData } = useGoals();
  const goals = goalsData?.goals ?? [];

  const {
    total,
    completed,
    completionPct,
    completedThisWeek,
    currentStreak,
    bestStreak,
    recentCompleted,
  } = useGoalsStats(goals);

  return (
    <div className="rounded-xl border bg-card/60 p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">Progress</p>
      <h2 className="mt-2 text-xl font-semibold">Learning momentum</h2>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall completion</span>
          <span className="font-medium">{completionPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-background/40">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {completed} of {total || 0} goals done
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border bg-background/60 p-4">
          <p className="text-xs text-muted-foreground">Current streak</p>
          <p className="mt-1 text-lg font-semibold">
            {currentStreak} day{currentStreak === 1 ? '' : 's'}
          </p>
        </div>
        <div className="rounded-lg border bg-background/60 p-4">
          <p className="text-xs text-muted-foreground">Best streak</p>
          <p className="mt-1 text-lg font-semibold">
            {bestStreak} day{bestStreak === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-lg border bg-background/60 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Completed this week</span>
          <span className="font-semibold">{completedThisWeek}</span>
        </div>
        {recentCompleted.length > 0 ? (
          <div className="space-y-2 text-sm">
            {recentCompleted.map((goal) => (
              <div key={goal.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{goal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(goal.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  Done
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Finish a goal to see it here.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressCard;
