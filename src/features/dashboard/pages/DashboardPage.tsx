import AccountPreviewCard from '@/features/dashboard/components/AccountPreviewCard';
import AssessmentCard from '@/features/dashboard/components/AssessmentCard';
import DashboardHeader from '@/features/dashboard/components/DashboardHeader';
import GoalsSection from '@/features/dashboard/components/GoalsSection';
import NextStepsCard from '@/features/dashboard/components/NextStepsCard';
import ProgressCard from '@/features/dashboard/components/ProgressCard';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <DashboardHeader />
        <AccountPreviewCard />

        <section className="grid gap-6 lg:grid-cols-3">
          <GoalsSection />

          <div className="space-y-6">
            <ProgressCard />
            <AssessmentCard />
          </div>
        </section>

        <NextStepsCard />
      </div>
    </div>
  );
};

export default DashboardPage;
