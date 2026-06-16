// Nominal daily effort that `durationWeeks` on a topic is calibrated to.
// Must match `TOPIC_DURATION_REFERENCE_MINUTES_PER_DAY` in tutor-ai-be `goalService.ts`.
export const TOPIC_DURATION_REFERENCE_MINUTES_PER_DAY = 45;

export const resolveGoalMinutesPerDay = (
  minutesPerDay: number | null | undefined
): number => Math.max(minutesPerDay ?? TOPIC_DURATION_REFERENCE_MINUTES_PER_DAY, 5);

// Calendar days allocated for the topic at the learner's daily pace.
export const topicCalendarDaySpan = (
  durationWeeks: number,
  minutesPerDay: number | null | undefined
): number => {
  const m = resolveGoalMinutesPerDay(minutesPerDay);
  const days =
    durationWeeks * 7 * (TOPIC_DURATION_REFERENCE_MINUTES_PER_DAY / m);
  return Math.max(1, Math.ceil(days));
};
