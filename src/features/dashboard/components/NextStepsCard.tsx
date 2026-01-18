import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import { useGetChats, useCreateChat } from '@/features/chats/hooks/useChats';
import { useGoals } from '@/features/goals/hooks/useGoals';

const NextStepsCard = () => {
  const { data: chatsData } = useGetChats();
  const { data: goalsData } = useGoals();
  const { mutate: createChat, isPending } = useCreateChat();

  const lastChat = chatsData?.chats?.[0];
  const nextGoal = goalsData?.goals?.find((goal) => goal.status !== 'done');

  const steps = [
    lastChat
      ? {
          title: 'Resume last chat',
          body: `Continue "${lastChat.title}".`,
          action: (
            <Button asChild size="sm" variant="outline">
              <Link to={`/chat/${lastChat.id}`}>Resume</Link>
            </Button>
          ),
        }
      : null,
    nextGoal
      ? {
          title: 'Work on a goal',
          body: nextGoal.title,
          action: (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                createChat(`Help me with this goal: ${nextGoal.title}`)
              }
            >
              Start
            </Button>
          ),
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string;
    body: string;
    action: React.ReactNode;
  }>;

  const genericTips = [
    'Capture a learning goal to track progress from this page.',
    'Explore a topic in chat and save a few key questions to revisit.',
    'Use the dashboard to plan your next focused study session.',
    'Check back soon for assessments and tailored feedback.',
  ];

  return (
    <section className="rounded-xl border bg-card/60 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Next steps</p>
          <h3 className="text-lg font-semibold">Pick up where you left off</h3>
        </div>
        <Button asChild size="sm">
          <Link to="/chat">Go to chat</Link>
        </Button>
      </div>
      {steps.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex items-start justify-between gap-3 rounded-lg border bg-background/60 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.body}
                </p>
              </div>
              <div className="shrink-0">{step.action}</div>
            </div>
          ))}
          <div className="rounded-lg border bg-background/60 p-3 text-sm text-muted-foreground">
            Assessment is coming soon with personalized feedback.
          </div>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          {genericTips.map((tip) => (
            <li key={tip} className="rounded-lg border bg-background/60 p-3">
              {tip}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default NextStepsCard;
