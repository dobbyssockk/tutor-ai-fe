import { IconRobot } from '@tabler/icons-react';
import { LoginForm } from '@/components/login-form';

const LoginPage = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
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
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:flex items-center justify-center p-10 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Tutor AI
          </h1>
          <p className="text-base leading-relaxed">
            is an intelligent chatbot that guides you with hints and
            explanations, helping you find solutions independently. If needed,
            it can clarify complex concepts or provide answers, but the focus is
            on your learning.
          </p>
          <div>
            <h2 className="mb-3 text-xl font-semibold">How it works?</h2>
            <ul className="list-disc space-y-2 pl-5 text-left text-sm">
              <li>
                <span className="font-medium">Ask a question</span> – Describe
                the difficulty you're facing.
              </li>
              <li>
                <span className="font-medium">Receive hints</span> – The bot
                will suggest logical directions, clues, and key ideas.
              </li>
              <li>
                <span className="font-medium">Work on the solution</span> – Try
                applying your knowledge and figuring it out independently.
              </li>
              <li>
                <span className="font-medium">Get an explanation</span> – If you
                get stuck, the bot will help you understand mistakes and guide
                you to the right answer.
              </li>
              <li>
                <span className="font-medium">Save your progress</span> – All
                your chats are saved, so you can revisit them anytime.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
