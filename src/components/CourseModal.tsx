import { useState, useEffect, useRef, useId } from 'react'
import { X, BookOpen, Sparkles } from 'lucide-react'
import { Course, GradingScaleRow, EvaluationType } from '../types'
import { parseCreditHours, getGradeFromMarks, normalizeCourseCode } from '../utils/calculations'

interface CourseModalProps {
  isOpen: boolean
  semesterName: string
  initialCourse?: Course | null
  gradingScale: GradingScaleRow[]
  onSave: (courseData: Omit<Course, 'id'>) => void
  onClose: () => void
}

export function CourseModal({
  isOpen,
  semesterName,
  initialCourse,
  gradingScale,
  onSave,
  onClose,
}: CourseModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const titleId = useId()

  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [creditHoursRaw, setCreditHoursRaw] = useState('3')
  const [evaluationType, setEvaluationType] = useState<EvaluationType>('marks')
  const [marks, setMarks] = useState<string>('80')
  const [grade, setGrade] = useState('A')
  const [gradePoints, setGradePoints] = useState(4.0)
  const [touched, setTouched] = useState(false)

  // Populate fields when editing an existing course or opening fresh
  useEffect(() => {
    if (initialCourse) {
      setCode(initialCourse.code)
      setTitle(initialCourse.title)
      setCreditHoursRaw(initialCourse.creditHoursRaw)
      setEvaluationType(initialCourse.evaluationType)
      setMarks(initialCourse.marks !== undefined ? initialCourse.marks.toString() : '80')
      setGrade(initialCourse.grade)
      setGradePoints(initialCourse.gradePoints)
    } else {
      setCode('')
      setTitle('')
      setCreditHoursRaw('3(2-1)')
      setEvaluationType('marks')
      setMarks('80')
      const initialMap = getGradeFromMarks(80, gradingScale)
      setGrade(initialMap.grade)
      setGradePoints(initialMap.gradePoints)
    }
    setTouched(false)
  }, [initialCourse, isOpen, gradingScale])

  // Native showModal & close
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [isOpen])

  // Backdrop click light-dismiss fallback
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleBackdrop = (event: MouseEvent) => {
      if (event.target !== dialog) return
      const rect = dialog.getBoundingClientRect()
      const isInside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      if (!isInside) {
        onClose()
      }
    }

    dialog.addEventListener('click', handleBackdrop)
    return () => dialog.removeEventListener('click', handleBackdrop)
  }, [onClose])

  // Live auto-calculation when marks change
  const handleMarksChange = (val: string) => {
    setMarks(val)
    const num = parseFloat(val)
    if (!isNaN(num)) {
      const converted = getGradeFromMarks(num, gradingScale)
      setGrade(converted.grade)
      setGradePoints(converted.gradePoints)
    }
  }

  // Live calculation of parsed credits
  const parsedCredits = parseCreditHours(creditHoursRaw)
  const numericMarks = parseFloat(marks)
  const isMarksValid = !isNaN(numericMarks) && numericMarks >= 0 && numericMarks <= 100
  const isCodeValid = code.trim().length > 0
  const isCreditsValid = parsedCredits > 0
  const isFormValid = isCodeValid && isCreditsValid && (evaluationType === 'grade' || isMarksValid)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isFormValid) return

    onSave({
      code: normalizeCourseCode(code),
      title: title.trim() || normalizeCourseCode(code),
      creditHoursRaw: creditHoursRaw.trim(),
      creditHours: parsedCredits,
      evaluationType,
      marks: evaluationType === 'marks' ? numericMarks : undefined,
      grade,
      gradePoints,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as any)}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className="p-0 bg-transparent"
    >
      <div className="w-[94vw] max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white">
                {initialCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{semesterName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Course Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Course Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. CS-301"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                required
              />
              {touched && !isCodeValid && (
                <p className="mt-1 text-xs text-rose-500">Course code is required.</p>
              )}
            </div>

            {/* Credit Hours (Plain or UAF format) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Credit Hours <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={creditHoursRaw}
                onChange={(e) => setCreditHoursRaw(e.target.value)}
                placeholder="e.g. 3 or 3(2-1)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">
                  UAF format accepted (e.g. 3(2-1))
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  = {parsedCredits} cr
                </span>
              </div>
            </div>
          </div>

          {/* Course Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Course Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Evaluation Method Toggle */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Grade Input Mode
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setEvaluationType('marks')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  evaluationType === 'marks'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Marks (0 - 100)
              </button>
              <button
                type="button"
                onClick={() => setEvaluationType('grade')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  evaluationType === 'grade'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Direct Letter Grade
              </button>
            </div>
          </div>

          {/* Marks input OR Grade dropdown */}
          {evaluationType === 'marks' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Marks Obtained (0 to 100)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={marks}
                    onChange={(e) => handleMarksChange(e.target.value)}
                    placeholder="e.g. 85"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 font-mono text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                  <div className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                    / 100
                  </div>
                </div>
                {touched && !isMarksValid && (
                  <p className="mt-1 text-xs text-rose-500">Marks must be between 0 and 100.</p>
                )}
              </div>

              {/* Auto Conversion Preview Badge */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-emerald-50/80 dark:from-indigo-950/40 dark:to-emerald-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Auto-Converted Grade:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-600 text-white">
                    Grade {grade}
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                    {gradePoints.toFixed(2)} GP
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    ({(gradePoints * parsedCredits).toFixed(1)} QP)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Letter Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const selGrade = e.target.value
                    setGrade(selGrade)
                    const row = gradingScale.find((r) => r.grade === selGrade)
                    if (row) setGradePoints(row.gradePoints)
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {gradingScale.map((row) => (
                    <option key={row.id} value={row.grade}>
                      {row.grade} ({row.gradePoints.toFixed(2)} GP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Grade Points
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={gradePoints}
                  onChange={(e) => setGradePoints(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-indigo-600/25 transition-all"
            >
              {initialCourse ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
