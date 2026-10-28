import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import {
  StudentProfile,
  StoredAppState,
  Course,
  GradingScaleRow,
  RepeatPolicy,
  Semester,
} from '../types'
import { DEFAULT_GRADING_SCALE } from '../data/defaultGradingScale'
import { SAMPLE_SEMESTERS } from '../data/sampleData'
import { validateAgNumber } from '../utils/calculations'

const STORAGE_KEY = 'cgpa_pro_state_v1'

const initialAppState: StoredAppState = {
  activeAgNumber: null,
  profiles: {},
  lastActiveAgNumber: undefined,
}

export function useStudentProfile() {
  const [appState, setAppState] = useLocalStorage<StoredAppState>(STORAGE_KEY, initialAppState)

  const activeAgNumber = appState.activeAgNumber
  const activeProfile: StudentProfile | null = useMemo(() => {
    if (!activeAgNumber) return null
    return appState.profiles[activeAgNumber] || null
  }, [activeAgNumber, appState.profiles])

  const allAgNumbers = useMemo(() => Object.keys(appState.profiles), [appState.profiles])

  // Select or register a profile by AG number
  const selectOrCreateProfile = useCallback(
    (inputAg: string, studentName?: string, degreeProgram?: string) => {
      const validation = validateAgNumber(inputAg)
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid AG Number')
      }

      const ag = validation.normalized
      setAppState((prev) => {
        const existing = prev.profiles[ag]
        const profileToSet: StudentProfile = existing
          ? {
              ...existing,
              studentName: studentName !== undefined ? studentName : existing.studentName,
              degreeProgram: degreeProgram !== undefined ? degreeProgram : existing.degreeProgram,
              lastUpdated: new Date().toISOString(),
            }
          : {
              agNumber: ag,
              studentName,
              degreeProgram,
              semesters: [],
              gradingScale: DEFAULT_GRADING_SCALE,
              repeatPolicy: 'latest',
              lastUpdated: new Date().toISOString(),
            }

        return {
          ...prev,
          activeAgNumber: ag,
          lastActiveAgNumber: ag,
          profiles: {
            ...prev.profiles,
            [ag]: profileToSet,
          },
        }
      })
    },
    [setAppState]
  )

  const switchProfile = useCallback(
    (ag: string) => {
      const normalized = ag.trim().toLowerCase()
      setAppState((prev) => {
        if (!prev.profiles[normalized]) return prev
        return {
          ...prev,
          activeAgNumber: normalized,
          lastActiveAgNumber: normalized,
        }
      })
    },
    [setAppState]
  )

  const closeCurrentProfile = useCallback(() => {
    setAppState((prev) => ({
      ...prev,
      activeAgNumber: null,
    }))
  }, [setAppState])

  const deleteProfile = useCallback(
    (ag: string) => {
      const normalized = ag.trim().toLowerCase()
      setAppState((prev) => {
        const nextProfiles = { ...prev.profiles }
        delete nextProfiles[normalized]

        const nextActive = prev.activeAgNumber === normalized ? null : prev.activeAgNumber
        const nextLast = prev.lastActiveAgNumber === normalized ? undefined : prev.lastActiveAgNumber

        return {
          ...prev,
          activeAgNumber: nextActive,
          lastActiveAgNumber: nextLast,
          profiles: nextProfiles,
        }
      })
    },
    [setAppState]
  )

  const updateActiveProfile = useCallback(
    (updater: (prev: StudentProfile) => StudentProfile) => {
      if (!activeAgNumber) return
      setAppState((prev) => {
        const current = prev.profiles[activeAgNumber]
        if (!current) return prev
        const updated = updater(current)
        return {
          ...prev,
          profiles: {
            ...prev.profiles,
            [activeAgNumber]: {
              ...updated,
              lastUpdated: new Date().toISOString(),
            },
          },
        }
      })
    },
    [activeAgNumber, setAppState]
  )

  const updateProfileMetadata = useCallback(
    (studentName?: string, degreeProgram?: string) => {
      updateActiveProfile((prev) => ({
        ...prev,
        studentName,
        degreeProgram,
      }))
    },
    [updateActiveProfile]
  )

  // Semester Operations
  const addSemester = useCallback(
    (customName?: string) => {
      updateActiveProfile((prev) => {
        const nextIndex = prev.semesters.length + 1
        const newSem: Semester = {
          id: `sem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: customName?.trim() || `Semester ${nextIndex}`,
          courses: [],
        }
        return {
          ...prev,
          semesters: [...prev.semesters, newSem],
        }
      })
    },
    [updateActiveProfile]
  )

  const updateSemester = useCallback(
    (semesterId: string, name: string) => {
      updateActiveProfile((prev) => ({
        ...prev,
        semesters: prev.semesters.map((s) =>
          s.id === semesterId ? { ...s, name: name.trim() || s.name } : s
        ),
      }))
    },
    [updateActiveProfile]
  )

  const deleteSemester = useCallback(
    (semesterId: string) => {
      updateActiveProfile((prev) => ({
        ...prev,
        semesters: prev.semesters.filter((s) => s.id !== semesterId),
      }))
    },
    [updateActiveProfile]
  )

  // Course Operations
  const addCourse = useCallback(
    (semesterId: string, courseData: Omit<Course, 'id'>) => {
      const newCourse: Course = {
        ...courseData,
        id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      }
      updateActiveProfile((prev) => ({
        ...prev,
        semesters: prev.semesters.map((s) =>
          s.id === semesterId ? { ...s, courses: [...s.courses, newCourse] } : s
        ),
      }))
    },
    [updateActiveProfile]
  )

  const updateCourse = useCallback(
    (semesterId: string, courseId: string, updates: Partial<Course>) => {
      updateActiveProfile((prev) => ({
        ...prev,
        semesters: prev.semesters.map((s) => {
          if (s.id !== semesterId) return s
          return {
            ...s,
            courses: s.courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c)),
          }
        }),
      }))
    },
    [updateActiveProfile]
  )

  const deleteCourse = useCallback(
    (semesterId: string, courseId: string) => {
      updateActiveProfile((prev) => ({
        ...prev,
        semesters: prev.semesters.map((s) => {
          if (s.id !== semesterId) return s
          return {
            ...s,
            courses: s.courses.filter((c) => c.id !== courseId),
          }
        }),
      }))
    },
    [updateActiveProfile]
  )

  // Settings: Grading Scale & Repeat Policy
  const updateGradingScale = useCallback(
    (scale: GradingScaleRow[]) => {
      updateActiveProfile((prev) => ({
        ...prev,
        gradingScale: scale,
      }))
    },
    [updateActiveProfile]
  )

  const resetGradingScale = useCallback(() => {
    updateActiveProfile((prev) => ({
      ...prev,
      gradingScale: DEFAULT_GRADING_SCALE,
    }))
  }, [updateActiveProfile])

  const setRepeatPolicy = useCallback(
    (policy: RepeatPolicy) => {
      updateActiveProfile((prev) => ({
        ...prev,
        repeatPolicy: policy,
      }))
    },
    [updateActiveProfile]
  )

  const loadSampleData = useCallback(() => {
    updateActiveProfile((prev) => ({
      ...prev,
      semesters: SAMPLE_SEMESTERS,
    }))
  }, [updateActiveProfile])

  const importProfile = useCallback(
    (profile: StudentProfile) => {
      const validation = validateAgNumber(profile.agNumber)
      if (!validation.isValid) throw new Error(validation.error)
      const ag = validation.normalized

      setAppState((prev) => ({
        ...prev,
        activeAgNumber: ag,
        lastActiveAgNumber: ag,
        profiles: {
          ...prev.profiles,
          [ag]: {
            ...profile,
            agNumber: ag,
            lastUpdated: new Date().toISOString(),
          },
        },
      }))
    },
    [setAppState]
  )

  return {
    activeAgNumber,
    activeProfile,
    allAgNumbers,
    lastActiveAgNumber: appState.lastActiveAgNumber,
    selectOrCreateProfile,
    switchProfile,
    closeCurrentProfile,
    deleteProfile,
    updateProfileMetadata,
    addSemester,
    updateSemester,
    deleteSemester,
    addCourse,
    updateCourse,
    deleteCourse,
    updateGradingScale,
    resetGradingScale,
    setRepeatPolicy,
    loadSampleData,
    importProfile,
  }
}
