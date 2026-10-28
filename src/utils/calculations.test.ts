import { describe, it, expect } from 'vitest'
import {
  validateAgNumber,
  parseCreditHours,
  normalizeCourseCode,
  getGradeFromMarks,
  calculateSemesterGpa,
  calculateCgpa,
  calculateRequiredGpa,
} from './calculations'
import { DEFAULT_GRADING_SCALE } from '../data/defaultGradingScale'
import { Semester } from '../types'

describe('AG Number Validation', () => {
  it('validates correct UAF AG numbers and normalizes to lowercase', () => {
    const res1 = validateAgNumber('2024-ag-1234')
    expect(res1.isValid).toBe(true)
    expect(res1.normalized).toBe('2024-ag-1234')

    const res2 = validateAgNumber('2021-AG-567')
    expect(res2.isValid).toBe(true)
    expect(res2.normalized).toBe('2021-ag-567')

    const res3 = validateAgNumber('  2020-Ag-1  ')
    expect(res3.isValid).toBe(true)
    expect(res3.normalized).toBe('2020-ag-1')
  })

  it('rejects invalid AG formats', () => {
    expect(validateAgNumber('2024-cs-1234').isValid).toBe(false)
    expect(validateAgNumber('24-ag-1234').isValid).toBe(false)
    expect(validateAgNumber('2024ag1234').isValid).toBe(false)
    expect(validateAgNumber('2024-ag-').isValid).toBe(false)
    expect(validateAgNumber('2024-ag-123456').isValid).toBe(false)
    expect(validateAgNumber('').isValid).toBe(false)
  })
})

describe('Credit Hours Parsing', () => {
  it('parses plain numbers and strings', () => {
    expect(parseCreditHours(3)).toBe(3)
    expect(parseCreditHours('3')).toBe(3)
    expect(parseCreditHours('4.0')).toBe(4)
    expect(parseCreditHours('1.5')).toBe(1.5)
  })

  it('parses UAF Theory-Practical notation like "3(2-1)"', () => {
    expect(parseCreditHours('3(2-1)')).toBe(3)
    expect(parseCreditHours('4(3-1)')).toBe(4)
    expect(parseCreditHours('2(0-2)')).toBe(2)
    expect(parseCreditHours(' 3(2-1) ')).toBe(3)
  })

  it('handles invalid or empty inputs without crashing', () => {
    expect(parseCreditHours('')).toBe(0)
    expect(parseCreditHours('abc')).toBe(0)
    expect(parseCreditHours(-2)).toBe(0)
    expect(parseCreditHours(null)).toBe(0)
    expect(parseCreditHours(undefined)).toBe(0)
  })
})

describe('Course Code Normalization', () => {
  it('normalizes course codes consistently', () => {
    expect(normalizeCourseCode('cs 301')).toBe('CS-301')
    expect(normalizeCourseCode('CS-301')).toBe('CS-301')
    expect(normalizeCourseCode('  math  101  ')).toBe('MATH-101')
    expect(normalizeCourseCode('agr-101')).toBe('AGR-101')
  })
})

describe('Grading Scale Marks to Grade Mapping', () => {
  it('converts marks to letter grades and grade points according to default scale', () => {
    expect(getGradeFromMarks(85, DEFAULT_GRADING_SCALE)).toEqual({ grade: 'A', gradePoints: 4.0 })
    expect(getGradeFromMarks(80, DEFAULT_GRADING_SCALE)).toEqual({ grade: 'A', gradePoints: 4.0 })
    expect(getGradeFromMarks(75, DEFAULT_GRADING_SCALE)).toEqual({ grade: 'B', gradePoints: 3.0 })
    expect(getGradeFromMarks(65, DEFAULT_GRADING_SCALE)).toEqual({ grade: 'B', gradePoints: 3.0 })
    expect(getGradeFromMarks(55, DEFAULT_GRADING_SCALE)).toEqual({ grade: 'C', gradePoints: 2.0 })
    expect(getGradeFromMarks(45, DEFAULT_GRADING_SCALE)).toEqual({ grade: 'D', gradePoints: 1.0 })
    expect(getGradeFromMarks(35, DEFAULT_GRADING_SCALE)).toEqual({ grade: 'F', gradePoints: 0.0 })
  })

  it('handles out of bound marks gracefully', () => {
    expect(getGradeFromMarks(120, DEFAULT_GRADING_SCALE)).toEqual({ grade: 'A', gradePoints: 4.0 })
    expect(getGradeFromMarks(-10, DEFAULT_GRADING_SCALE)).toEqual({ grade: 'F', gradePoints: 0.0 })
  })
})

describe('Semester GPA Calculation', () => {
  it('calculates correct semester GPA with multiple courses', () => {
    const sem: Semester = {
      id: 'sem-1',
      name: 'Semester 1',
      courses: [
        {
          id: 'c1',
          code: 'CS-101',
          title: 'Intro to Computing',
          creditHoursRaw: '3(2-1)',
          creditHours: 3,
          evaluationType: 'marks',
          marks: 85, // A = 4.0 -> 12 quality points
          grade: 'A',
          gradePoints: 4.0,
        },
        {
          id: 'c2',
          code: 'MATH-101',
          title: 'Calculus I',
          creditHoursRaw: '3',
          creditHours: 3,
          evaluationType: 'grade',
          grade: 'B',
          gradePoints: 3.0, // B = 3.0 -> 9 quality points
        },
        {
          id: 'c3',
          code: 'ENG-101',
          title: 'English Comprehension',
          creditHoursRaw: '2',
          creditHours: 2,
          evaluationType: 'grade',
          grade: 'A',
          gradePoints: 4.0, // A = 4.0 -> 8 quality points
        },
      ],
    }

    // Total credits = 3 + 3 + 2 = 8
    // Total QP = 12 + 9 + 8 = 29
    // GPA = 29 / 8 = 3.625 -> 3.63
    const result = calculateSemesterGpa(sem, DEFAULT_GRADING_SCALE)
    expect(result.totalCredits).toBe(8)
    expect(result.qualityPoints).toBe(29)
    expect(result.gpa).toBe(3.63)
  })

  it('handles empty semester without crashing', () => {
    const emptySem: Semester = { id: 'sem-empty', name: 'Semester Empty', courses: [] }
    const result = calculateSemesterGpa(emptySem, DEFAULT_GRADING_SCALE)
    expect(result.totalCredits).toBe(0)
    expect(result.qualityPoints).toBe(0)
    expect(result.gpa).toBe(0.0)
  })
})

describe('Cumulative CGPA & Repeat Policy Handling', () => {
  const sem1: Semester = {
    id: 'sem-1',
    name: 'Semester 1',
    courses: [
      {
        id: 'c1',
        code: 'CS-101',
        title: 'Programming Fundamentals',
        creditHoursRaw: '4(3-1)',
        creditHours: 4,
        evaluationType: 'marks',
        marks: 45, // Grade D = 1.0 -> 4 QP
        grade: 'D',
        gradePoints: 1.0,
      },
      {
        id: 'c2',
        code: 'MATH-101',
        title: 'Calculus',
        creditHoursRaw: '3',
        creditHours: 3,
        evaluationType: 'grade',
        grade: 'A',
        gradePoints: 4.0, // Grade A = 4.0 -> 12 QP
      },
    ],
  }

  const sem2: Semester = {
    id: 'sem-2',
    name: 'Semester 2',
    courses: [
      {
        id: 'c3',
        code: 'CS-101', // Repeated course!
        title: 'Programming Fundamentals',
        creditHoursRaw: '4(3-1)',
        creditHours: 4,
        evaluationType: 'marks',
        marks: 85, // Improved to Grade A = 4.0 -> 16 QP
        grade: 'A',
        gradePoints: 4.0,
      },
      {
        id: 'c4',
        code: 'CS-102',
        title: 'Data Structures',
        creditHoursRaw: '3',
        creditHours: 3,
        evaluationType: 'grade',
        grade: 'B',
        gradePoints: 3.0, // 9 QP
      },
    ],
  }

  it('correctly detects repeated courses across semesters', () => {
    const result = calculateCgpa([sem1, sem2], DEFAULT_GRADING_SCALE, 'latest')
    expect(result.repeatedCourseCodes).toContain('CS-101')
  })

  it('uses only latest attempt when repeatPolicy is "latest"', () => {
    // Effective courses:
    // CS-101 (from Sem 2): 4 cr * 4.0 = 16 QP
    // MATH-101 (from Sem 1): 3 cr * 4.0 = 12 QP
    // CS-102 (from Sem 2): 3 cr * 3.0 = 9 QP
    // Total Credits = 4 + 3 + 3 = 10
    // Total QP = 16 + 12 + 9 = 37
    // CGPA = 37 / 10 = 3.70
    const result = calculateCgpa([sem1, sem2], DEFAULT_GRADING_SCALE, 'latest')
    expect(result.totalCreditHours).toBe(10)
    expect(result.totalQualityPoints).toBe(37)
    expect(result.cgpa).toBe(3.7)
    expect(result.effectiveCoursesCount).toBe(3)
  })

  it('uses highest grade points attempt when repeatPolicy is "best"', () => {
    // Suppose student had A in first attempt, then got C in repeat
    const attempt1Best: Semester = {
      id: 'sem-a',
      name: 'Sem A',
      courses: [
        {
          id: 'ca1',
          code: 'PHY-101',
          title: 'Physics',
          creditHoursRaw: '3',
          creditHours: 3,
          evaluationType: 'grade',
          grade: 'A',
          gradePoints: 4.0,
        },
      ],
    }
    const attempt2Worse: Semester = {
      id: 'sem-b',
      name: 'Sem B',
      courses: [
        {
          id: 'ca2',
          code: 'PHY-101',
          title: 'Physics',
          creditHoursRaw: '3',
          creditHours: 3,
          evaluationType: 'grade',
          grade: 'C',
          gradePoints: 2.0,
        },
      ],
    }

    const latestResult = calculateCgpa([attempt1Best, attempt2Worse], DEFAULT_GRADING_SCALE, 'latest')
    expect(latestResult.cgpa).toBe(2.0) // Latest was C (2.0)

    const bestResult = calculateCgpa([attempt1Best, attempt2Worse], DEFAULT_GRADING_SCALE, 'best')
    expect(bestResult.cgpa).toBe(4.0) // Best was A (4.0)
  })
})

describe('Target CGPA Planner ("What do I need?")', () => {
  it('calculates required GPA for achievable target', () => {
    // Current CGPA = 3.0 with 30 credits (QP = 90)
    // Target = 3.2 after upcoming 15 credits (Total credits = 45)
    // Desired QP = 3.2 * 45 = 144
    // Needed QP = 144 - 90 = 54
    // Required GPA = 54 / 15 = 3.60
    const res = calculateRequiredGpa(3.0, 30, 3.2, 15)
    expect(res.status).toBe('achievable')
    expect(res.requiredGpa).toBe(3.6)
  })

  it('detects mathematically impossible targets exceeding max scale 4.0', () => {
    // Current CGPA = 2.0 with 60 credits (QP = 120)
    // Target = 3.8 after 10 credits (Total credits = 70)
    // Desired QP = 3.8 * 70 = 266
    // Needed QP = 146 in 10 credits -> 14.6 GPA (Impossible)
    const res = calculateRequiredGpa(2.0, 60, 3.8, 10)
    expect(res.status).toBe('impossible_high')
    expect(res.message).toContain('Mathematically impossible')
  })

  it('detects already achieved target', () => {
    // Current CGPA = 3.8 with 60 credits (QP = 228)
    // Target = 3.0 after 10 credits
    const res = calculateRequiredGpa(3.8, 60, 3.0, 10)
    expect(res.status).toBe('already_achieved')
    expect(res.requiredGpa).toBe(0.0)
  })

  it('rejects invalid inputs safely', () => {
    const resZeroCredits = calculateRequiredGpa(3.0, 30, 3.5, 0)
    expect(resZeroCredits.status).toBe('impossible_high')

    const resInvalidTarget = calculateRequiredGpa(3.0, 30, 4.5, 15)
    expect(resInvalidTarget.status).toBe('impossible_high')
  })
})
