import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import {
  useAssessmentAttempt,
  useSubmitAssessment,
} from '@/features/assessments/hooks/useAssessments';

const AssessmentAttemptPage = () => {
  const { attemptId } = useParams();
  const { data, isLoading } = useAssessmentAttempt(attemptId);
  const { mutate: submitAssessment, isPending } = useSubmitAssessment();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const questions = useMemo(
    () => data?.attempt.questions ?? [],
    [data?.attempt.questions]
  );
  const totalCount = data?.attempt.totalCount ?? questions.length;

  const isComplete = useMemo(() => {
    if (!questions.length) return false;
    return questions.every((question) => Boolean(answers[question.id]));
  }, [answers, questions]);

  const handleSubmit = () => {
    if (!attemptId || questions.length === 0) return;
    const payload = questions.map((question) => ({
      questionId: question.id,
      answer: answers[question.id] || '',
    }));
    submitAssessment({ attemptId, answers: payload });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Тестирование</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Ответьте на вопросы
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} вопросов · После отправки тьютор разберет ошибки.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border bg-background/60 p-6 text-sm text-muted-foreground">
            Загружаем тест...
          </div>
        ) : questions.length ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-xl border bg-card/60 p-5 shadow-sm"
              >
                <p className="text-sm text-muted-foreground">
                  Вопрос {index + 1}
                </p>
                <h2 className="mt-2 text-base font-semibold">
                  {question.prompt}
                </h2>
                <div className="mt-4 space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 rounded-lg border border-transparent bg-background/60 px-3 py-2 text-sm transition hover:border-border"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: option,
                          }))
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between rounded-xl border bg-background/60 p-4 text-sm text-muted-foreground">
              <span>
                {Object.keys(answers).length}/{totalCount} ответов
              </span>
              <Button disabled={!isComplete || isPending} onClick={handleSubmit}>
                {isPending ? 'Отправляем...' : 'Отправить ответы'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-background/60 p-6 text-sm text-muted-foreground">
            Вопросы теста недоступны.
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentAttemptPage;
