import AccountPreviewCard from '@/features/dashboard/components/AccountPreviewCard';
import DashboardHeader from '@/features/dashboard/components/DashboardHeader';
import GoalsSection from '@/features/dashboard/components/GoalsSection';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <DashboardHeader />
        <AccountPreviewCard />

        <section className="space-y-6">
          <GoalsSection />
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
