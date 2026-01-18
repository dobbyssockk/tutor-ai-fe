const AssessmentCard = () => {
  return (
    <div className="rounded-xl border bg-card/60 p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">Assessment</p>
      <h2 className="mt-2 text-xl font-semibold">Check readiness</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        A short test will appear here. We&apos;ll use your results to personalize
        the chat and review any mistakes.
      </p>
    </div>
  );
};

export default AssessmentCard;
