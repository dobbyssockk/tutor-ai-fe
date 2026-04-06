import { type FormEvent, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import type { GoalInput } from '@/features/goals/types';

type GoalFormProps = {
  isCreating: boolean;
  onCreateGoal: (
    payload: GoalInput,
    options?: { onSuccess?: () => void }
  ) => void;
};

const MIN_MINUTES = 5;

const GoalForm = ({ isCreating, onCreateGoal }: GoalFormProps) => {
  const [title, setTitle] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [minutesPerDay, setMinutesPerDay] = useState('');
  const [details, setDetails] = useState('');

  const normalizedMinutes = Math.floor(Number(minutesPerDay) || 0);
  const isAddDisabled =
    !title.trim() ||
    !normalizedMinutes ||
    normalizedMinutes < MIN_MINUTES ||
    isCreating;

  const resetForm = () => {
    setTitle('');
    setCurrentLevel('');
    setTargetLevel('');
    setMinutesPerDay('');
    setDetails('');
  };

  const handleAddGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedCurrentLevel = currentLevel.trim();
    const trimmedTargetLevel = targetLevel.trim();
    const trimmedDetails = details.trim();
    const minutes = Math.floor(Number(minutesPerDay) || 0);

    if (!trimmedTitle || !minutes || minutes < MIN_MINUTES) {
      return;
    }

    const payload: GoalInput = {
      title: trimmedTitle,
      description: trimmedDetails,
      minutesPerDay: minutes,
    };

    if (trimmedCurrentLevel) {
      payload.currentLevel = trimmedCurrentLevel;
    }

    if (trimmedTargetLevel) {
      payload.targetLevel = trimmedTargetLevel;
    }

    onCreateGoal(
      payload,
      { onSuccess: resetForm }
    );
  };

  return (
    <form
      onSubmit={handleAddGoal}
      className="space-y-3 rounded-lg border bg-background/60 p-4"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Цель \ Дисциплина
          </label>
          <Input
            placeholder="Изучить английский"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Минут в день
          </label>
          <Input
            placeholder="45"
            type="number"
            min={MIN_MINUTES}
            max={480}
            value={minutesPerDay}
            onChange={(e) => setMinutesPerDay(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Описание и заметки
          </label>
          <Textarea
            placeholder="Опишите цель, контекст, ограничения, предпочтения и темы, на которые хотите сделать упор."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Текущий уровень
          </label>
          <Input
            placeholder="A2, начинающий, школьный курс"
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Целевой уровень
          </label>
          <Input
            placeholder="B2, свободное общение"
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" disabled={isAddDisabled} className="w-full">
        {isCreating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {isCreating ? 'Создаем программу...' : 'Сформировать программу'}
      </Button>
    </form>
  );
};

export default GoalForm;
