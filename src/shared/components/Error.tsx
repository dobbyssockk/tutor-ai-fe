import { CircleAlert } from 'lucide-react';

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <CircleAlert size="40" color="var(--destructive)" />
      <p className="text-3xl font-semibold text-center">
        Something went wrong. Please try again.
      </p>
    </div>
  );
};

export default Error;
