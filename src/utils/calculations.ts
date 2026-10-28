import {
  Course,
  Semester,
  GradingScaleRow,
  RepeatPolicy,
  CgpaCalculationResult,
  SemesterCalculationResult,
  RequiredGpaResult,
} from '../types'

/**
 * Validates UAF AG Number format.
 * Format: 4 digits, "-ag-", followed by 1 to 5 digits.
 * Example: 2024-ag-1234, 2021-AG-567
 */
export const AG_NUMBER_REGEX = /^\d{4}-ag-\d{1,5}$/i

export function validateAgNumber(input: string): { isValid: boolean; normalized: string; error?: string } {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) {
    return { isValid: false, normalized: '', error: 'AG Number is required.' }
  }

  if (!AG_NUMBER_REGEX.test(trimmed)) {
    return {
      isValid: false,
      normalized: trimmed,
      error: 'Invalid format. Example format: 2024-ag-1234 or 2021-ag-567',
    }
  }

  return { isValid: true, normalized: trimmed }
}

/**
 * Parses credit hours string or number.
 * Supports:
 * - Plain numbers: "3", 3, "4.0", "1.5"
 * - UAF lab/theory format: "3(2-1)" -> 3 (total credit hours is the leading number)
 * - "4(3-1)" -> 4
 * - "2(0-2)" -> 2
 * - Invalid or empty inputs safely return 0.
 */
export function parseCreditHours(input: string | number | undefined | null): number {
  if (input === undefined || input === null) return 0
  if (typeof input === 'number') {
    return isNaN(input) || input < 0 ? 0 : input
  }

  const str = input.trim()
  if (!str) return 0

  // Match leading number before any parentheses or non-digit chars
  // e.g. "3(2-1)" -> "3", "1.5(1-1)" -> "1.5"
  const match = str.match(/^(\d+(\.\d+)?)/)
  if (!match) return 0

  const val = parseFloat(match[1])
  return isNaN(val) || val < 0 ? 0 : val
}

/**
 * Normalizes a course code for deduplication & repeat checks.
 * e.g., "cs 301", "CS-301", "cs-301 " -> "CS-301"
 */
export function normalizeCourseCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Maps marks (0-100) to corresponding letter grade and grade points based on scale.
 */
export function getGradeFromMarks(
  marks: number,
  scale: GradingScaleRow[]
): { grade: string; gradePoints: number } {
  // Sort scale descending by minMarks
  const sortedScale = [...scale].sort((a, b) => b.minMarks - a.minMarks)

  // Clamp marks between 0 and 100 for safety
  const clampedMarks = Math.max(0, Math.min(100, marks))

  for (const tier of sortedScale) {
    if (clampedMarks >= tier.minMarks) {
      return { grade: tier.grade, gradePoints: tier.gradePoints }
    }
  }

  // Fallback to lowest tier if marks are below all thresholds
  const lowest = sortedScale[sortedScale.length - 1]
  return lowest ? { grade: lowest.grade, gradePoints: lowest.gradePoints } : { grade: 'F', gradePoints: 0.0 }
}

/**
 * Calculates GPA and Quality Points for a single semester.
 * Semester GPA = sum(gradePoints * creditHours) / sum(creditHours)
 */
export function calculateSemesterGpa(
  semester: Semester,
  scale: GradingScaleRow[]
): SemesterCalculationResult {
  let totalCredits = 0
  let qualityPoints = 0
  let coursesCount = 0

  for (const course of semester.courses) {
    const credits = course.creditHours > 0 ? course.creditHours : parseCreditHours(course.creditHoursRaw)
    if (credits <= 0) continue

    let gp = course.gradePoints
    if (course.evaluationType === 'marks' && course.marks !== undefined) {
      const mapped = getGradeFromMarks(course.marks, scale)
      gp = mapped.gradePoints
    }

    qualityPoints += gp * credits
    totalCredits += credits
    coursesCount++
  }

  const gpa = totalCredits > 0 ? Number((qualityPoints / totalCredits).toFixed(2)) : 0.0

  return {
    semesterId: semester.id,
    semesterName: semester.name,
    totalCredits,
    qualityPoints: Number(qualityPoints.toFixed(2)),
    gpa,
    coursesCount,
  }
}

interface CourseAttemptMeta {
  course: Course
  semesterIndex: number
  courseIndex: number
  effectiveCredits: number
  effectiveGradePoints: number
  effectiveQualityPoints: number
}

/**
 * Calculates cumulative CGPA across all semesters with repeated course handling.
 *
 * Repeat Policy:
 * - 'latest': Only the chronologically latest attempt of a repeated course code counts.
 * - 'best': The attempt with the highest grade points (or marks if tied) counts.
 */
export function calculateCgpa(
  semesters: Semester[],
  scale: GradingScaleRow[],
  repeatPolicy: RepeatPolicy = 'latest'
): CgpaCalculationResult {
  const semesterResults: SemesterCalculationResult[] = []

  // Group attempts by normalized course code
  const courseCodeAttempts = new Map<string, CourseAttemptMeta[]>()

  semesters.forEach((sem, sIdx) => {
    // Calculate individual semester GPA
    const semResult = calculateSemesterGpa(sem, scale)
    semesterResults.push(semResult)

    sem.courses.forEach((c, cIdx) => {
      const credits = c.creditHours > 0 ? c.creditHours : parseCreditHours(c.creditHoursRaw)
      if (credits <= 0) return // Skip 0 credit courses from GPA

      let gp = c.gradePoints
      if (c.evaluationType === 'marks' && c.marks !== undefined) {
        gp = getGradeFromMarks(c.marks, scale).gradePoints
      }

      const normCode = normalizeCourseCode(c.code)
      if (!normCode) return

      const attempt: CourseAttemptMeta = {
        course: c,
        semesterIndex: sIdx,
        courseIndex: cIdx,
        effectiveCredits: credits,
        effectiveGradePoints: gp,
        effectiveQualityPoints: gp * credits,
      }

      const list = courseCodeAttempts.get(normCode) || []
      list.push(attempt)
      courseCodeAttempts.set(normCode, list)
    })
  })

  // Identify repeated courses and choose which attempt is effective
  const repeatedCourseCodes: string[] = []
  const effectiveAttempts: CourseAttemptMeta[] = []
  let totalCoursesCount = 0

  courseCodeAttempts.forEach((attempts, code) => {
    totalCoursesCount += attempts.length

    if (attempts.length > 1) {
      repeatedCourseCodes.push(code)
    }

    if (attempts.length === 1) {
      effectiveAttempts.push(attempts[0])
      return
    }

    if (repeatPolicy === 'latest') {
      // Sort by semesterIndex ascending, then courseIndex ascending -> pick last
      attempts.sort((a, b) => {
        if (a.semesterIndex !== b.semesterIndex) return a.semesterIndex - b.semesterIndex
        return a.courseIndex - b.courseIndex
      })
      effectiveAttempts.push(attempts[attempts.length - 1])
    } else {
      // 'best' policy: pick highest gradePoints. In case of tie, pick latest
      attempts.sort((a, b) => {
        if (b.effectiveGradePoints !== a.effectiveGradePoints) {
          return b.effectiveGradePoints - a.effectiveGradePoints
        }
        const bMarks = b.course.marks ?? 0
        const aMarks = a.course.marks ?? 0
        if (bMarks !== aMarks) return bMarks - aMarks
        if (b.semesterIndex !== a.semesterIndex) return b.semesterIndex - a.semesterIndex
        return b.courseIndex - a.courseIndex
      })
      effectiveAttempts.push(attempts[0])
    }
  })

  let totalCreditHours = 0
  let totalQualityPoints = 0

  effectiveAttempts.forEach((att) => {
    totalCreditHours += att.effectiveCredits
    totalQualityPoints += att.effectiveQualityPoints
  })

  const rawCgpa = totalCreditHours > 0 ? totalQualityPoints / totalCreditHours : 0.0
  const cgpa = Number(rawCgpa.toFixed(2))

  return {
    cgpa,
    totalCreditHours,
    totalQualityPoints: Number(totalQualityPoints.toFixed(2)),
    totalCoursesCount,
    effectiveCoursesCount: effectiveAttempts.length,
    semesterResults,
    repeatedCourseCodes,
  }
}

/**
 * Calculates Required GPA for Target CGPA Planner ("What do I need?")
 *
 * Formula:
 * Target CGPA * (Current Credits + Upcoming Credits) = Current Quality Points + Needed Quality Points
 * Needed Quality Points = Target * TotalCredits - Current Quality Points
 * Required GPA = Needed Quality Points / Upcoming Credits
 */
export function calculateRequiredGpa(
  currentCgpa: number,
  currentCredits: number,
  targetCgpa: number,
  upcomingCredits: number,
  maxScaleGpa: number = 4.0
): RequiredGpaResult {
  if (upcomingCredits <= 0) {
    return {
      status: 'impossible_high',
      requiredGpa: 0,
      maxPossibleCgpa: currentCgpa,
      minPossibleCgpa: currentCgpa,
      message: 'Upcoming semester credit hours must be greater than 0.',
    }
  }

  if (targetCgpa < 0 || targetCgpa > maxScaleGpa) {
    return {
      status: 'impossible_high',
      requiredGpa: 0,
      maxPossibleCgpa: 0,
      minPossibleCgpa: 0,
      message: `Target CGPA must be between 0.00 and ${maxScaleGpa.toFixed(2)}.`,
    }
  }

  const currentQualityPoints = currentCgpa * currentCredits
  const totalFutureCredits = currentCredits + upcomingCredits

  const targetQualityPoints = targetCgpa * totalFutureCredits
  const neededQualityPoints = targetQualityPoints - currentQualityPoints
  const rawRequiredGpa = neededQualityPoints / upcomingCredits
  const requiredGpa = Number(rawRequiredGpa.toFixed(2))

  // Max and Min possible CGPA achievable
  const maxPossibleCgpa = Number(
    ((currentQualityPoints + maxScaleGpa * upcomingCredits) / totalFutureCredits).toFixed(2)
  )
  const minPossibleCgpa = Number(
    (currentQualityPoints / totalFutureCredits).toFixed(2)
  )

  if (rawRequiredGpa > maxScaleGpa) {
    return {
      status: 'impossible_high',
      requiredGpa,
      maxPossibleCgpa,
      minPossibleCgpa,
      message: `Mathematically impossible. Even with a perfect ${maxScaleGpa.toFixed(2)} GPA in this semester, the maximum CGPA you can reach is ${maxPossibleCgpa.toFixed(2)}.`,
    }
  }

  if (rawRequiredGpa <= 0) {
    return {
      status: 'already_achieved',
      requiredGpa: 0.0,
      maxPossibleCgpa,
      minPossibleCgpa,
      message: `You have already secured enough quality points to meet or exceed your target CGPA of ${targetCgpa.toFixed(2)}, even with a 0.00 GPA in the upcoming semester!`,
    }
  }

  return {
    status: 'achievable',
    requiredGpa,
    maxPossibleCgpa,
    minPossibleCgpa,
    message: `You need a minimum GPA of ${requiredGpa.toFixed(2)} in the upcoming ${upcomingCredits} credit hours to achieve your target CGPA of ${targetCgpa.toFixed(2)}.`,
  }
}
