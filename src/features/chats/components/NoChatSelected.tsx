import { useMemo, useState } from 'react';

import { MessageSquareDashed } from 'lucide-react';

import ChatInput from '@/features/chats/components/ChatInput';
import { useCreateChat } from '@/features/chats/hooks/useChats';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { Button } from '@/shared/components/ui/button';

const NoChatSelected = () => {
  const [text, setText] = useState(''); // for input

  const { mutate, isPending } = useCreateChat();
  const { data: goalsData } = useGoals();
  const previewGoals = useMemo(() => {
    const goals = goalsData?.goals ?? [];
    const activeGoals = goals.filter((goal) => goal.status !== 'done');
    return activeGoals.length > 0 ? activeGoals : goals;
  }, [goalsData?.goals]);

  const buildGoalPrompt = (goal: {
    title: string;
    notes?: string;
  }) => {
    const notes = goal.notes?.trim();
    return notes
      ? `Help me with this goal: ${goal.title}\nNotes: ${notes}`
      : `Help me with this goal: ${goal.title}`;
  };

  const handleSend = () => {
    if (!text.trim()) return;
    mutate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4">
        <MessageSquareDashed className="w-10 h-10 mb-4 text-muted" />
        <p className="text-lg font-medium">No chat selected yet.</p>
        <p className="text-sm opacity-70">
          Kinda like an empty div... waiting to be filled.
        </p>
        {previewGoals.length > 0 ? (
          <div className="mt-6 w-full max-w-xl rounded-xl border bg-background/60 p-4 text-left text-foreground">
            <p className="text-sm font-medium text-muted-foreground">
              Continue with a goal
            </p>
            <div className="mt-3 grid gap-2">
              {previewGoals.slice(0, 4).map((goal) => (
                <Button
                  key={goal.id}
                  type="button"
                  variant="outline"
                  className="h-auto justify-start px-3 py-2 text-left"
                  disabled={isPending}
                  onClick={() => mutate(buildGoalPrompt(goal))}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {goal.title}
                    </p>
                    {goal.notes ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {goal.notes}
                      </p>
                    ) : null}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <ChatInput
        loading={isPending}
        disabled={isPending}
        value={text}
        onClick={handleSend}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
      />
    </>
  );
};

export default NoChatSelected;
