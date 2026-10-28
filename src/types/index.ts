export interface GradingScaleRow {
  id: string
  minMarks: number
  maxMarks: number
  grade: string
  gradePoints: number
  description?: string
}

export type EvaluationType = 'marks' | 'grade'

export interface Course {
  id: string
  code: string
  title: string
  creditHoursRaw: string // Can be "3", "3(2-1)", "4(3-1)", "1.5"
  creditHours: number    // Parsed numeric credits, e.g., 3
  evaluationType: EvaluationType
  marks?: number         // 0 - 100
  grade: string          // e.g., "A", "B", "C", "D", "F"
  gradePoints: number    // e.g., 4.0, 3.0, 2.0, 1.0, 0.0
  notes?: string
}

export interface Semester {
  id: string
  name: string
  courses: Course[]
}

export type RepeatPolicy = 'latest' | 'best'

export interface StudentProfile {
  agNumber: string
  studentName?: string
  degreeProgram?: string
  semesters: Semester[]
  gradingScale: GradingScaleRow[]
  repeatPolicy: RepeatPolicy
  lastUpdated: string
}

export interface StoredAppState {
  activeAgNumber: string | null
  profiles: Record<string, StudentProfile>
  lastActiveAgNumber?: string
}

export interface SemesterCalculationResult {
  semesterId: string
  semesterName: string
  totalCredits: number
  qualityPoints: number
  gpa: number
  coursesCount: number
}

export interface CgpaCalculationResult {
  cgpa: number
  totalCreditHours: number
  totalQualityPoints: number
  totalCoursesCount: number
  effectiveCoursesCount: number
  semesterResults: SemesterCalculationResult[]
  repeatedCourseCodes: string[]
}

export interface RequiredGpaResult {
  status: 'achievable' | 'impossible_high' | 'impossible_low' | 'already_achieved'
  requiredGpa: number
  maxPossibleCgpa: number
  minPossibleCgpa: number
  message: string
}
