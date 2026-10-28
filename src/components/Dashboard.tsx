import { useMemo } from 'react'
import {
  StudentProfile,
  CgpaCalculationResult,
  Course,
  RepeatPolicy,
} from '../types'
import { SemesterCard } from './SemesterCard'
import {
  Award,
  BookOpen,
  Calendar,
  Plus,
  TrendingUp,
  Sparkles,
  Repeat,
  Target,
  Printer,
  Info,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface DashboardProps {
  profile: StudentProfile
  cgpaResult: CgpaCalculationResult
  isDark: boolean
  onAddSemester: () => void
  onUpdateSemesterName: (semesterId: string, name: string) => void
  onDeleteSemester: (semesterId: string) => void
  onAddCourse: (semesterId: string) => void
  onEditCourse: (semesterId: string, course: Course) => void
  onDeleteCourse: (semesterId: string, courseId: string) => void
  onToggleRepeatPolicy: (policy: RepeatPolicy) => void
  onOpenPlanner: () => void
  onOpenPrintSummary: () => void
  onLoadSampleData: () => void
}

export function Dashboard({
  profile,
  cgpaResult,
  isDark,
  onAddSemester,
  onUpdateSemesterName,
  onDeleteSemester,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onToggleRepeatPolicy,
  onOpenPlanner,
  onOpenPrintSummary,
  onLoadSampleData,
}: DashboardProps) {
  // Chart data: semester name and GPA
  const chartData = useMemo(() => {
    return cgpaResult.semesterResults
      .filter((s) => s.totalCredits > 0)
      .map((s) => ({
        name: s.semesterName,
        gpa: s.gpa,
        credits: s.totalCredits,
      }))
  }, [cgpaResult.semesterResults])

  // Academic standing badge text & style
  const standing = useMemo(() => {
    const val = cgpaResult.cgpa
    if (cgpaResult.totalCreditHours === 0) {
      return { text: 'New Profile', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' }
    }
    if (val >= 3.8) {
      return { text: "Dean's Honor Roll", bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300' }
    }
    if (val >= 3.5) {
      return { text: 'High Distinction', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300' }
    }
    if (val >= 3.0) {
      return { text: 'First Division (Good)', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300' }
    }
    if (val >= 2.5) {
      return { text: 'Second Division / Satisfactory', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300' }
    }
    if (val >= 2.0) {
      return { text: 'Pass / Probation Risk', bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300' }
    }
    return { text: 'Academic Warning', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300' }
  }, [cgpaResult.cgpa, cgpaResult.totalCreditHours])

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Welcome Info */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono font-bold text-xs uppercase px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md">
                AG: {profile.agNumber}
              </span>
              {profile.degreeProgram && (
                <span className="text-xs text-indigo-100 font-medium hidden sm:inline">
                  • {profile.degreeProgram}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile.studentName ? `Hi, ${profile.studentName}` : 'Student Academic Overview'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-indigo-100 max-w-xl">
              Automatic GPA &amp; CGPA calculations for University of Agriculture Faisalabad. All data is saved
              exclusively in your browser.
            </p>
          </div>

          {/* Quick Action Pills */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onOpenPlanner}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-900 font-bold text-xs sm:text-sm shadow-md hover:bg-indigo-50 transition-colors"
            >
              <Target className="w-4 h-4 text-indigo-600" />
              Target Planner
            </button>
            <button
              type="button"
              onClick={onOpenPrintSummary}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              PDF Transcript
            </button>
          </div>
        </div>
      </div>

      {/* Hero Stat Cards & Recharts Progress Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Big CGPA Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-soft border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cumulative CGPA
              </span>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {cgpaResult.cgpa.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-400 font-mono">/ 4.00</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            {/* Standing pill */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standing:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${standing.bg}`}>
                {standing.text}
              </span>
            </div>

            {/* Total Credit Hours */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Credit Hours:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {cgpaResult.totalCreditHours} cr
              </span>
            </div>

            {/* Quality Points */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Quality Points:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {cgpaResult.totalQualityPoints.toFixed(2)}
              </span>
            </div>

            {/* Repeat Policy Toggle */}
            <div className="pt-2 flex items-center justify-between border-t border-dashed border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Repeat className="w-3.5 h-3.5 text-indigo-500" />
                <span>Repeat Policy:</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onToggleRepeatPolicy(profile.repeatPolicy === 'latest' ? 'best' : 'latest')
                }
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                title="Click to toggle between Latest Attempt and Best Attempt"
              >
                {profile.repeatPolicy === 'latest' ? 'Count Latest Attempt' : 'Count Best Attempt'}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Trend Chart (Recharts) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-soft border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                GPA Trend per Semester
              </h2>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {chartData.length} {chartData.length === 1 ? 'semester plotted' : 'semesters plotted'}
            </span>
          </div>

          {chartData.length > 0 ? (
            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#334155' : '#e2e8f0'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={isDark ? '#94a3b8' : '#64748b'}
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 4.0]}
                    ticks={[1.0, 2.0, 3.0, 4.0]}
                    stroke={isDark ? '#94a3b8' : '#64748b'}
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '1rem',
                      boxShadow: '0 10px 25px -3px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [`${val.toFixed(2)} GPA`, 'Semester GPA']}
                  />
                  <ReferenceLine
                    y={3.0}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: '1st Div (3.0)',
                      fill: '#10b981',
                      fontSize: 10,
                      position: 'insideBottomRight',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="gpa"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#gpaGradient)"
                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Calendar className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No semester GPA data to plot yet
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Add courses with credit hours and grades to visualize your progress curve.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Repeated Course Note if any */}
      {cgpaResult.repeatedCourseCodes.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong className="font-bold">Repeated Courses Detected: </strong>
            You have repeated {cgpaResult.repeatedCourseCodes.join(', ')}. Under current policy (
            <em>{profile.repeatPolicy === 'latest' ? 'Latest Attempt' : 'Best Attempt'}</em>), only the effective
            attempt counts toward your CGPA ({cgpaResult.effectiveCoursesCount} out of {cgpaResult.totalCoursesCount}{' '}
            total course records).
          </div>
        </div>
      )}

      {/* Semesters Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Semesters &amp; Courses ({profile.semesters.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your courses, credit hours, and grades for each semester
          </p>
        </div>

        <button
          type="button"
          onClick={onAddSemester}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Semester
        </button>
      </div>

      {/* Semesters List */}
      {profile.semesters.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-800 shadow-soft flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Semesters Added Yet</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Start building your profile by creating your first semester, or load a sample UAF curriculum to test out all features.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onAddSemester}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Semester
            </button>
            <button
              type="button"
              onClick={onLoadSampleData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-sm border border-emerald-300 dark:border-emerald-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Load Sample UAF Courses
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {profile.semesters.map((sem) => {
            const semRes =
              cgpaResult.semesterResults.find((r) => r.semesterId === sem.id) || {
                semesterId: sem.id,
                semesterName: sem.name,
                totalCredits: 0,
                qualityPoints: 0,
                gpa: 0,
                coursesCount: 0,
              }

            return (
              <SemesterCard
                key={sem.id}
                semester={sem}
                semesterResult={semRes}
                repeatPolicy={profile.repeatPolicy}
                repeatedCourseCodes={cgpaResult.repeatedCourseCodes}
                onUpdateSemesterName={onUpdateSemesterName}
                onDeleteSemester={onDeleteSemester}
                onAddCourse={onAddCourse}
                onEditCourse={onEditCourse}
                onDeleteCourse={onDeleteCourse}
              />
            )
          })}

          {/* Quick Add Semester bottom button */}
          <button
            type="button"
            onClick={onAddSemester}
            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-3xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Another Semester
          </button>
        </div>
      )}
    </div>
  )
}
