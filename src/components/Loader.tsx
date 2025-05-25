import { Loader2 } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Loader2 size="80" className="animate-spin" />
      <p className="text-3xl font-semibold text-center">Loading...</p>
    </div>
  );
};

export default Loader;
