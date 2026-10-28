import { GradingScaleRow } from '../types'

/**
 * Default placeholder grading scale (Standard 4.0 Scale).
 *
 * NOTE: Students are explicitly advised in the UI:
 * "Verify this against your official UAF grading policy"
 *
 * Users can edit min marks, letter grades, and grade points anytime
 * or reset to this baseline.
 */
export const DEFAULT_GRADING_SCALE: GradingScaleRow[] = [
  {
    id: 'scale-a',
    minMarks: 80,
    maxMarks: 100,
    grade: 'A',
    gradePoints: 4.0,
    description: 'Outstanding / Excellent',
  },
  {
    id: 'scale-b',
    minMarks: 65,
    maxMarks: 79,
    grade: 'B',
    gradePoints: 3.0,
    description: 'Good',
  },
  {
    id: 'scale-c',
    minMarks: 50,
    maxMarks: 64,
    grade: 'C',
    gradePoints: 2.0,
    description: 'Satisfactory',
  },
  {
    id: 'scale-d',
    minMarks: 40,
    maxMarks: 49,
    grade: 'D',
    gradePoints: 1.0,
    description: 'Pass',
  },
  {
    id: 'scale-f',
    minMarks: 0,
    maxMarks: 39,
    grade: 'F',
    gradePoints: 0.0,
    description: 'Fail',
  },
]
