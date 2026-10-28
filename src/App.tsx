import { useState, useMemo } from 'react'
import { Navbar } from './components/Navbar'
import { AgEntryScreen } from './components/AgEntryScreen'
import { Dashboard } from './components/Dashboard'
import { CourseModal } from './components/CourseModal'
import { SettingsModal } from './components/SettingsModal'
import { TargetPlannerModal } from './components/TargetPlannerModal'
import { SummaryReportModal } from './components/SummaryReportModal'
import { ExportImportModal } from './components/ExportImportModal'
import { ProfileSwitcherModal } from './components/ProfileSwitcherModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { useStudentProfile } from './hooks/useStudentProfile'
import { useDarkMode } from './hooks/useDarkMode'
import { calculateCgpa } from './utils/calculations'
import { Course, RepeatPolicy } from './types'

export function App() {
  const [isDark, toggleDarkMode] = useDarkMode()
  const {
    activeAgNumber,
    activeProfile,
    allAgNumbers,
    lastActiveAgNumber,
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
  } = useStudentProfile()

  // Modal visibility states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPlannerOpen, setIsPlannerOpen] = useState(false)
  const [isPrintSummaryOpen, setIsPrintSummaryOpen] = useState(false)
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState(false)
  const [isBackupOpen, setIsBackupOpen] = useState(false)

  // Course modal state
  const [courseModalState, setCourseModalState] = useState<{
    isOpen: boolean
    semesterId: string
    semesterName: string
    initialCourse?: Course | null
  }>({
    isOpen: false,
    semesterId: '',
    semesterName: '',
    initialCourse: null,
  })

  // Confirmation dialog states
  const [confirmDeleteSem, setConfirmDeleteSem] = useState<{
    isOpen: boolean
    semesterId: string
    semesterName: string
  }>({
    isOpen: false,
    semesterId: '',
    semesterName: '',
  })

  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState<{
    isOpen: boolean
    semesterId: string
    courseId: string
    courseCode: string
  }>({
    isOpen: false,
    semesterId: '',
    courseId: '',
    courseCode: '',
  })

  // Automatic calculation of CGPA and semester results
  const cgpaResult = useMemo(() => {
    if (!activeProfile) {
      return {
        cgpa: 0,
        totalCreditHours: 0,
        totalQualityPoints: 0,
        totalCoursesCount: 0,
        effectiveCoursesCount: 0,
        semesterResults: [],
        repeatedCourseCodes: [],
      }
    }
    return calculateCgpa(
      activeProfile.semesters,
      activeProfile.gradingScale,
      activeProfile.repeatPolicy
    )
  }, [activeProfile])

  // Profile map for switcher and entry screen
  const profilesMap = useMemo(() => {
    // Reconstruct profiles object for children
    try {
      const raw = localStorage.getItem('cgpa_pro_state_v1')
      if (raw) {
        const parsed = JSON.parse(raw)
        return parsed.profiles || {}
      }
    } catch {
      // fallback
    }
    return {}
  }, [activeAgNumber, allAgNumbers])

  // Course actions
  const handleOpenAddCourse = (semesterId: string) => {
    const sem = activeProfile?.semesters.find((s) => s.id === semesterId)
    setCourseModalState({
      isOpen: true,
      semesterId,
      semesterName: sem?.name || 'Semester',
      initialCourse: null,
    })
  }

  const handleOpenEditCourse = (semesterId: string, course: Course) => {
    const sem = activeProfile?.semesters.find((s) => s.id === semesterId)
    setCourseModalState({
      isOpen: true,
      semesterId,
      semesterName: sem?.name || 'Semester',
      initialCourse: course,
    })
  }

  const handleSaveCourse = (courseData: Omit<Course, 'id'>) => {
    if (courseModalState.initialCourse) {
      updateCourse(
        courseModalState.semesterId,
        courseModalState.initialCourse.id,
        courseData
      )
    } else {
      addCourse(courseModalState.semesterId, courseData)
    }
    setCourseModalState((prev) => ({ ...prev, isOpen: false }))
  }

  // Delete Semester handlers
  const handleRequestDeleteSemester = (semesterId: string) => {
    const sem = activeProfile?.semesters.find((s) => s.id === semesterId)
    setConfirmDeleteSem({
      isOpen: true,
      semesterId,
      semesterName: sem?.name || 'this semester',
    })
  }

  const handleConfirmDeleteSemester = () => {
    if (confirmDeleteSem.semesterId) {
      deleteSemester(confirmDeleteSem.semesterId)
    }
    setConfirmDeleteSem({ isOpen: false, semesterId: '', semesterName: '' })
  }

  // Delete Course handlers
  const handleRequestDeleteCourse = (semesterId: string, courseId: string) => {
    const sem = activeProfile?.semesters.find((s) => s.id === semesterId)
    const course = sem?.courses.find((c) => c.id === courseId)
    setConfirmDeleteCourse({
      isOpen: true,
      semesterId,
      courseId,
      courseCode: course?.code || 'this course',
    })
  }

  const handleConfirmDeleteCourse = () => {
    if (confirmDeleteCourse.semesterId && confirmDeleteCourse.courseId) {
      deleteCourse(confirmDeleteCourse.semesterId, confirmDeleteCourse.courseId)
    }
    setConfirmDeleteCourse({ isOpen: false, semesterId: '', courseId: '', courseCode: '' })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeProfile={activeProfile}
        isDark={isDark}
        onToggleDarkMode={toggleDarkMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPlanner={() => setIsPlannerOpen(true)}
        onOpenPrintSummary={() => setIsPrintSummaryOpen(true)}
        onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!activeProfile ? (
          <AgEntryScreen
            lastActiveAgNumber={lastActiveAgNumber}
            profiles={profilesMap}
            onSelectProfile={selectOrCreateProfile}
            onDeleteProfile={deleteProfile}
            onLoadDemo={() => {
              selectOrCreateProfile('2024-ag-5000', 'Hamza Tariq', 'B.Sc. (Hons.) Agriculture')
              loadSampleData()
            }}
          />
        ) : (
          <Dashboard
            profile={activeProfile}
            cgpaResult={cgpaResult}
            isDark={isDark}
            onAddSemester={() => addSemester()}
            onUpdateSemesterName={updateSemester}
            onDeleteSemester={handleRequestDeleteSemester}
            onAddCourse={handleOpenAddCourse}
            onEditCourse={handleOpenEditCourse}
            onDeleteCourse={handleRequestDeleteCourse}
            onToggleRepeatPolicy={(policy: RepeatPolicy) => setRepeatPolicy(policy)}
            onOpenPlanner={() => setIsPlannerOpen(true)}
            onOpenPrintSummary={() => setIsPrintSummaryOpen(true)}
            onLoadSampleData={loadSampleData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print py-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          CGPA Pro • University of Agriculture Faisalabad (UAF) • 100% Client-Side &amp; Offline-First
        </p>
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
          Your data is never transmitted to any external server. Always verify with your official departmental transcript.
        </p>
      </footer>

      {/* Modals & Dialogs */}
      {activeProfile && (
        <>
          {/* Add / Edit Course Dialog */}
          <CourseModal
            isOpen={courseModalState.isOpen}
            semesterName={courseModalState.semesterName}
            initialCourse={courseModalState.initialCourse}
            gradingScale={activeProfile.gradingScale}
            onSave={handleSaveCourse}
            onClose={() => setCourseModalState((prev) => ({ ...prev, isOpen: false }))}
          />

          {/* Academic Settings Modal */}
          <SettingsModal
            isOpen={isSettingsOpen}
            profile={activeProfile}
            onSaveGradingScale={updateGradingScale}
            onResetGradingScale={resetGradingScale}
            onSaveRepeatPolicy={setRepeatPolicy}
            onUpdateMetadata={updateProfileMetadata}
            onClose={() => setIsSettingsOpen(false)}
          />

          {/* Target CGPA Planner Modal */}
          <TargetPlannerModal
            isOpen={isPlannerOpen}
            cgpaResult={cgpaResult}
            onClose={() => setIsPlannerOpen(false)}
          />

          {/* Printable Result Summary / PDF Modal */}
          <SummaryReportModal
            isOpen={isPrintSummaryOpen}
            profile={activeProfile}
            cgpaResult={cgpaResult}
            onClose={() => setIsPrintSummaryOpen(false)}
          />

          {/* Data Backup (Export/Import) Modal */}
          <ExportImportModal
            isOpen={isBackupOpen}
            activeProfile={activeProfile}
            onImportProfile={importProfile}
            onClose={() => setIsBackupOpen(false)}
          />

          {/* Profile Switcher Modal */}
          <ProfileSwitcherModal
            isOpen={isProfileSwitcherOpen}
            activeAgNumber={activeAgNumber}
            profiles={profilesMap}
            onSwitchProfile={switchProfile}
            onDeleteProfile={deleteProfile}
            onNewAgEntry={closeCurrentProfile}
            onClose={() => setIsProfileSwitcherOpen(false)}
          />

          {/* Confirm Delete Semester Dialog */}
          <ConfirmDialog
            isOpen={confirmDeleteSem.isOpen}
            title="Delete Semester?"
            message={`Are you sure you want to delete "${confirmDeleteSem.semesterName}" and all of its course records? This action cannot be undone.`}
            confirmText="Delete Semester"
            isDestructive={true}
            onConfirm={handleConfirmDeleteSemester}
            onCancel={() => setConfirmDeleteSem({ isOpen: false, semesterId: '', semesterName: '' })}
          />

          {/* Confirm Delete Course Dialog */}
          <ConfirmDialog
            isOpen={confirmDeleteCourse.isOpen}
            title="Delete Course?"
            message={`Are you sure you want to remove course "${confirmDeleteCourse.courseCode}"?`}
            confirmText="Delete Course"
            isDestructive={true}
            onConfirm={handleConfirmDeleteCourse}
            onCancel={() =>
              setConfirmDeleteCourse({ isOpen: false, semesterId: '', courseId: '', courseCode: '' })
            }
          />
        </>
      )}
    </div>
  )
}
