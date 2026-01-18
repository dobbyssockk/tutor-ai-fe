import { type FormEvent, useState } from 'react';
import { CheckCircle2, Circle, Loader2, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoal,
} from '@/features/goals/hooks/useGoals';

const GoalsSection = () => {
  const { data: goalsData, isLoading: isLoadingGoals } = useGoals();
  const { mutate: createGoal, isPending: isCreatingGoal } = useCreateGoal();
  const { mutate: updateGoal } = useUpdateGoal();
  const { mutate: deleteGoal } = useDeleteGoal();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const goals = goalsData?.goals ?? [];
  const hasGoals = goals.length > 0;
  const isAddDisabled = title.trim().length === 0 || isCreatingGoal;
  const doneCount = goals.filter((goal) => goal.status === 'done').length;
  const openCount = goals.length - doneCount;

  const handleAddGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedNotes = notes.trim();
    if (!trimmedTitle) return;

    createGoal(
      { title: trimmedTitle, notes: trimmedNotes || undefined },
      {
        onSuccess: () => {
          setTitle('');
          setNotes('');
        },
      }
    );
  };

  return (
    <section className="lg:col-span-2 space-y-4 rounded-xl border bg-card/60 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Goals &amp; to-dos
          </p>
          <h2 className="mt-1 text-xl font-semibold">Plan your learning</h2>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background/80 px-3 py-1">
            Open: {openCount}
          </span>
          <span className="rounded-full bg-background/80 px-3 py-1">
            Done: {doneCount}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleAddGoal}
        className="space-y-3 rounded-lg border bg-background/60 p-4"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            placeholder="Add a goal or to-do"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button type="submit" disabled={isAddDisabled} className="md:w-[160px]">
            {isCreatingGoal ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isCreatingGoal ? 'Adding...' : 'Add'}
          </Button>
        </div>
        <Textarea
          placeholder="Optional notes or context"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="text-sm"
        />
      </form>

      <div className="space-y-3">
        {isLoadingGoals ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : hasGoals ? (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-start gap-3 rounded-lg border bg-background/60 p-4"
            >
              <button
                type="button"
                onClick={() =>
                  updateGoal({
                    id: goal.id,
                    payload: {
                      status: goal.status === 'done' ? 'todo' : 'done',
                    },
                  })
                }
                className="mt-1 text-muted-foreground transition hover:text-primary"
                aria-label={
                  goal.status === 'done'
                    ? 'Mark goal as in progress'
                    : 'Mark goal as done'
                }
              >
                {goal.status === 'done' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <div className="flex-1 min-w-0 space-y-1">
                <p
                  className={`text-sm font-medium break-words ${
                    goal.status === 'done'
                      ? 'text-muted-foreground line-through'
                      : ''
                  }`}
                >
                  {goal.title}
                </p>
                {goal.notes ? (
                  <p className="text-sm text-muted-foreground break-words">
                    {goal.notes}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Added {new Date(goal.createdAt).toLocaleDateString()}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Delete goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone and will remove the goal from
                      your list.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteGoal(goal.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed bg-background/60 p-6 text-sm text-muted-foreground">
            No goals yet. Add a goal or to-do to organize your next learning
            steps before jumping into the chat.
          </div>
        )}
      </div>
    </section>
  );
};

export default GoalsSection;
