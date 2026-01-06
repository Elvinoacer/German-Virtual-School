export interface EvaluationMetrics {
  attendanceScore?: number | null;
  participationScore?: number | null;
  assignmentScore?: number | null;
  languageProficiency?: number | null;
  behaviorScore?: number | null;
}

/**
 * Calculates the overall grade based on available metrics.
 * Uses a simple average of the non-null metrics.
 */
export function calculateEvaluationGrade(metrics: EvaluationMetrics): number {
  const scores = [
    metrics.attendanceScore,
    metrics.participationScore,
    metrics.assignmentScore,
    metrics.languageProficiency,
    metrics.behaviorScore
  ].filter((s): s is number => typeof s === 'number' && s !== null);

  if (scores.length === 0) return 0;

  const total = scores.reduce((sum, score) => sum + score, 0);
  return Number((total / scores.length).toFixed(1));
}

/**
 * Calculates a simple average for a list of grades (0-100 scale).
 */
export function calculateAverage(grades: number[]): number {
  if (grades.length === 0) return 0;
  const total = grades.reduce((sum, g) => sum + g, 0);
  return Number((total / grades.length).toFixed(1));
}
