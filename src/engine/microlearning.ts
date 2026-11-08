import { Challenge, AssessmentResult, MicroLesson } from '../types/domain';

export function selectLessons(
  challenge: Challenge,
  result: AssessmentResult
): { criterionId: string; lesson: MicroLesson }[] {
  if (result.passed) {
    return [];
  }

  const failedLessons: { criterionId: string; lesson: MicroLesson }[] = [];

  for (const criterionResult of result.criteria) {
    if (!criterionResult.passed) {
      const lesson = challenge.lessons[criterionResult.criterionId];
      if (lesson) {
        failedLessons.push({
          criterionId: criterionResult.criterionId,
          lesson,
        });
      }
    }
  }

  return failedLessons;
}
