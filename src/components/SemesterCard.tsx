import { useState } from 'react'
import {
  Semester,
  Course,
  RepeatPolicy,
  SemesterCalculationResult,
} from '../types'
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  BookOpen,
  Layers,
  Repeat,
} from 'lucide-react'

interface SemesterCardProps {
  semester: Semester
  semesterResult: SemesterCalculationResult
  repeatPolicy: RepeatPolicy
  repeatedCourseCodes: string[]
  onUpdateSemesterName: (semesterId: string, name: string) => void
  onDeleteSemester: (semesterId: string) => void
  onAddCourse: (semesterId: string) => void
  onEditCourse: (semesterId: string, course: Course) => void
  onDeleteCourse: (semesterId: string, courseId: string) => void
}

export function SemesterCard({
  semester,
  semesterResult,
  repeatPolicy,
  repeatedCourseCodes,
  onUpdateSemesterName,
  onDeleteSemester,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
}: SemesterCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(semester.name)

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      onUpdateSemesterName(semester.id, tempTitle.trim())
    }
    setIsEditingTitle(false)
  }

  const handleCancelTitle = () => {
    setTempTitle(semester.name)
    setIsEditingTitle(false)
  }

  const getGradeBadgeClass = (grade: string) => {
    const g = grade.toUpperCase()
    if (g.startsWith('A')) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
    }
    if (g.startsWith('B')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-700'
    }
    if (g.startsWith('C')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700'
    }
    if (g.startsWith('D')) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300 dark:border-orange-700'
    }
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-700'
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-soft border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-all duration-200 hover:shadow-soft-lg">
      {/* Semester Header */}
      <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Edit */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-sm">
            <Layers className="w-5 h-5" />
          </div>

          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle()
                  if (e.key === 'Escape') handleCancelTitle()
                }}
                className="px-3 py-1 text-base font-bold rounded-xl border border-indigo-400 dark:border-indigo-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg"
                title="Save title"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCancelTitle}
                className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{semester.name}</h3>
              <button
                type="button"
                onClick={() => {
                  setTempTitle(semester.name)
                  setIsEditingTitle(true)
                }}
                className="opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity rounded-md"
                title="Rename Semester"
                aria-label={`Rename ${semester.name}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* GPA Summary Badges & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Credits:</span>
            <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
              {semesterResult.totalCredits}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-950/50 dark:to-emerald-950/50 border border-indigo-200/80 dark:border-indigo-800/80 shadow-sm">
            <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold">GPA:</span>
            <span className="text-base font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
              {semesterResult.gpa.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAddCourse(semester.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Course
          </button>

          <button
            type="button"
            onClick={() => onDeleteSemester(semester.id)}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            title="Delete this semester"
            aria-label={`Delete ${semester.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Courses List */}
      <div className="p-4 sm:p-6">
        {semester.courses.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No courses added yet in {semester.name}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Click &quot;Add Course&quot; to enter your course code, credit hours, and marks or grade.
            </p>
            <button
              type="button"
              onClick={() => onAddCourse(semester.id)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Course
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="pb-3 pl-2">Course</th>
                  <th className="pb-3 text-center">Credit Hours</th>
                  <th className="pb-3 text-center">Marks / Mode</th>
                  <th className="pb-3 text-center">Grade</th>
                  <th className="pb-3 text-center">GP</th>
                  <th className="pb-3 text-center">Quality Pts</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60 text-sm">
                {semester.courses.map((course) => {
                  const isRepeated = repeatedCourseCodes.includes(course.code.trim().toUpperCase())
                  const qualityPoints = (course.gradePoints * course.creditHours).toFixed(2)

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Code & Title */}
                      <td className="py-3 pl-2 max-w-[200px] sm:max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {course.code}
                          </span>
                          {isRepeated && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                              title={`Repeated Course. Policy: ${
                                repeatPolicy === 'latest' ? 'Only Latest Attempt Counts' : 'Highest Grade Counts'
                              }`}
                            >
                              <Repeat className="w-3 h-3" />
                              Repeat
                            </span>
                          )}
                        </div>
                        {course.title && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {course.title}
                          </div>
                        )}
                      </td>

                      {/* Credit Hours */}
                      <td className="py-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {course.creditHoursRaw || course.creditHours}
                        {course.creditHoursRaw && course.creditHoursRaw !== String(course.creditHours) && (
                          <span className="text-[10px] text-slate-400 block font-sans">
                            ({course.creditHours} cr)
                          </span>
                        )}
                      </td>

                      {/* Marks / Mode */}
                      <td className="py-3 text-center text-xs text-slate-600 dark:text-slate-300">
                        {course.evaluationType === 'marks' && course.marks !== undefined ? (
                          <span className="font-mono font-semibold">
                            {course.marks} <span className="text-slate-400 text-[10px]">/ 100</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Direct Grade</span>
                        )}
                      </td>

                      {/* Letter Grade */}
                      <td className="py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-extrabold border ${getGradeBadgeClass(
                            course.grade
                          )}`}
                        >
                          {course.grade}
                        </span>
                      </td>

                      {/* Grade Points */}
                      <td className="py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {course.gradePoints.toFixed(2)}
                      </td>

                      {/* Quality Points */}
                      <td className="py-3 text-center font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {qualityPoints}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEditCourse(semester.id, course)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Course"
                            aria-label={`Edit ${course.code}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCourse(semester.id, course.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete Course"
                            aria-label={`Delete ${course.code}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
