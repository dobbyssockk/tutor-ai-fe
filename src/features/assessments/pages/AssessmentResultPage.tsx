import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import {
  useAssessmentResult,
  useCreateAssessmentReviewChat,
} from '@/features/assessments/hooks/useAssessments';

const AssessmentResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useAssessmentResult(attemptId);
  const { mutate: createReviewChat, isPending: isCreatingReviewChat } =
    useCreateAssessmentReviewChat(attemptId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
          <div className="rounded-lg border bg-background/60 p-6 text-sm text-muted-foreground">
            Загружаем результаты...
          </div>
        </div>
      </div>
    );
  }

  const result = data?.result;

  if (!result) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
          <div className="rounded-lg border bg-background/60 p-6 text-sm text-muted-foreground">
            Результаты теста пока недоступны.
          </div>
        </div>
      </div>
    );
  }

  const reviewItems = result.review ?? [];
  const handleOpenReviewChat = () => {
    if (result.chatId) {
      navigate(`/chat/${result.chatId}`);
      return;
    }

    createReviewChat(undefined, {
      onSuccess: (response) => {
        navigate(`/chat/${response.chatId}`);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Результаты теста</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Ваш результат — {result.score}%
            </h1>
            <p className="text-sm text-muted-foreground">
              {result.correctCount} верных из {result.totalCount} вопросов.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/dashboard">Назад к панели</Link>
          </Button>
        </div>

        {result.mistakesCount > 0 ? (
          <div className="rounded-xl border bg-card/60 p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Что дальше
            </p>
            <h2 className="mt-2 text-lg font-semibold">
              Разбор ошибок с тьютором
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Тьютор подготовил разбор по вопросам, где были ошибки.
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                disabled={isCreatingReviewChat}
                onClick={handleOpenReviewChat}
              >
                {isCreatingReviewChat ? 'Открываем...' : 'Разобрать в чате'}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border bg-card/60 p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Разбор вопросов
          </p>
          <div className="mt-4 space-y-4">
            {reviewItems.length > 0 ? (
              reviewItems.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-background/60 p-4"
                >
                  <p className="text-sm font-medium">
                    {index + 1}. {item.prompt}
                  </p>
                  <div className="mt-2 grid gap-2 text-sm">
                    <p>
                      Ваш ответ:{' '}
                      <span
                        className={
                          item.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {item.userAnswer || 'Нет ответа'}
                      </span>
                    </p>
                    <p>
                      Правильный ответ:{' '}
                      <span className="text-emerald-400">
                        {item.correctAnswer}
                      </span>
                    </p>
                    {item.explanation ? (
                      <p className="text-xs text-muted-foreground">
                        Пояснение: {item.explanation}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Подробный разбор вопросов появится после загрузки данных.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-background/60 p-4 text-sm text-muted-foreground">
          {result.mistakesCount === 0
            ? 'Отлично! Вы ответили на все вопросы правильно.'
            : `Ошибок: ${result.mistakesCount}. Тьютор разберет их вместе с вами.`}
        </div>
      </div>
    </div>
  );
};

export default AssessmentResultPage;
