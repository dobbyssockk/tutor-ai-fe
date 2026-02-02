import React from 'react';
import { IconRobot } from '@tabler/icons-react';

const AuthPage = ({ children }: { children: React.JSX.Element }) => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="#"
            className="flex items-center gap-2 font-medium tracking-wide"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <IconRobot />
            </div>
            Tutor AI
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>

      {/* right side */}
      <div className="relative hidden lg:flex items-center justify-center p-10 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Tutor AI
          </h1>
          <p className="text-base leading-relaxed">
            это интеллектуальный чат-тьютор с панелью обучения: вы получаете
            программы по дисциплинам, управляете целями и отслеживаете прогресс.
            Можно задать собственные инструкции для тьютора, чтобы он объяснял в
            нужном стиле. При необходимости он пояснит сложные темы или даст
            ответы, но фокус — на вашем обучении.
          </p>
          <div>
            <h2 className="mb-3 text-xl font-semibold">Как это работает?</h2>
            <ul className="list-disc space-y-2 pl-5 text-left text-sm">
              <li>
                <span className="font-medium">Задайте вопрос</span> — опишите,
                с чем возникли сложности.
              </li>
              <li>
                <span className="font-medium">Получите подсказки</span> — бот
                предложит направления, наводки и ключевые идеи.
              </li>
              <li>
                <span className="font-medium">Решайте задачу</span> — попробуйте
                применить знания и дойти до ответа самостоятельно.
              </li>
              <li>
                <span className="font-medium">Получите объяснение</span> — если
                застряли, бот разберет ошибки и подскажет верный ход.
              </li>
              <li>
                <span className="font-medium">Сохраняйте прогресс</span> — все
                чаты сохраняются, и вы можете возвращаться к ним в любое время.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
