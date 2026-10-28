import { useState, useEffect, useRef, useId } from 'react'
import {
  X,
  Settings,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  Repeat,
  User,
  GraduationCap,
} from 'lucide-react'
import { GradingScaleRow, RepeatPolicy, StudentProfile } from '../types'
import { DEFAULT_GRADING_SCALE } from '../data/defaultGradingScale'

interface SettingsModalProps {
  isOpen: boolean
  profile: StudentProfile
  onSaveGradingScale: (scale: GradingScaleRow[]) => void
  onResetGradingScale: () => void
  onSaveRepeatPolicy: (policy: RepeatPolicy) => void
  onUpdateMetadata: (name?: string, degree?: string) => void
  onClose: () => void
}

export function SettingsModal({
  isOpen,
  profile,
  onSaveGradingScale,
  onResetGradingScale,
  onSaveRepeatPolicy,
  onUpdateMetadata,
  onClose,
}: SettingsModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const titleId = useId()

  const [scaleRows, setScaleRows] = useState<GradingScaleRow[]>([])
  const [repeatPolicy, setRepeatPolicy] = useState<RepeatPolicy>('latest')
  const [studentName, setStudentName] = useState('')
  const [degreeProgram, setDegreeProgram] = useState('')
  const [activeTab, setActiveTab] = useState<'grading' | 'profile' | 'policy'>('grading')

  useEffect(() => {
    if (isOpen) {
      setScaleRows(profile.gradingScale && profile.gradingScale.length > 0 ? profile.gradingScale : DEFAULT_GRADING_SCALE)
      setRepeatPolicy(profile.repeatPolicy || 'latest')
      setStudentName(profile.studentName || '')
      setDegreeProgram(profile.degreeProgram || '')
    }
  }, [isOpen, profile])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
    } else {
      if (dialog.open) dialog.close()
    }
  }, [isOpen])

  // Backdrop light dismiss fallback
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

  const handleRowChange = (id: string, field: keyof GradingScaleRow, value: string | number) => {
    setScaleRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        return {
          ...r,
          [field]: typeof r[field] === 'number' ? parseFloat(value.toString()) || 0 : value,
        }
      })
    )
  }

  const handleAddRow = () => {
    const newRow: GradingScaleRow = {
      id: `custom-scale-${Date.now()}`,
      minMarks: 0,
      maxMarks: 100,
      grade: 'B+',
      gradePoints: 3.5,
      description: 'Custom Grade',
    }
    setScaleRows((prev) => [...prev, newRow])
  }

  const handleDeleteRow = (id: string) => {
    setScaleRows((prev) => prev.filter((r) => r.id !== id))
  }

  const handleResetToDefault = () => {
    setScaleRows(DEFAULT_GRADING_SCALE)
    onResetGradingScale()
  }

  const handleSaveAll = () => {
    onSaveGradingScale(scaleRows)
    onSaveRepeatPolicy(repeatPolicy)
    onUpdateMetadata(studentName.trim() || undefined, degreeProgram.trim() || undefined)
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
      <div className="w-[95vw] max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white">
                Academic Settings &amp; Policies
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Profile: <span className="font-mono font-semibold">{profile.agNumber}</span>
              </p>
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

        {/* Tab selection */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('grading')}
            className={`px-3 py-2 rounded-xl transition-colors ${
              activeTab === 'grading'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Grading Scale
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-2 rounded-xl transition-colors ${
              activeTab === 'policy'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Course Repeat Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 rounded-xl transition-colors ${
              activeTab === 'profile'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Profile Info
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {activeTab === 'grading' && (
            <div className="space-y-4">
              {/* Mandatory Warning Label */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                  <strong className="font-bold">Important Notice: </strong>
                  Verify this against your official UAF grading policy. UAF departments or degree programs may follow
                  specific minimum marks and grade points rules. All calculations in CGPA Pro immediately update to
                  reflect your configured scale.
                </div>
              </div>

              {/* Table of scale rows */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Min Marks</th>
                      <th className="p-3">Max Marks</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Grade Points</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {scaleRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={row.minMarks}
                            onChange={(e) => handleRowChange(row.id, 'minMarks', e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={row.maxMarks}
                            onChange={(e) => handleRowChange(row.id, 'maxMarks', e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={row.grade}
                            onChange={(e) => handleRowChange(row.id, 'grade', e.target.value)}
                            className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold uppercase"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="4.0"
                            value={row.gradePoints}
                            onChange={(e) => handleRowChange(row.id, 'gradePoints', e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-indigo-600 dark:text-indigo-400"
                          />
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add row & Reset buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Grade Tier
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Default 4.0 Scale
                </button>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Repeated / Improved Courses CGPA Rule
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  When a student registers and repeats the same course code across different semesters, how should the
                  CGPA calculation treat multiple attempts?
                </p>

                <div className="space-y-2.5 pt-2">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-500 transition-colors">
                    <input
                      type="radio"
                      name="repeatPolicy"
                      checked={repeatPolicy === 'latest'}
                      onChange={() => setRepeatPolicy('latest')}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        Count Latest Attempt (UAF Standard)
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Only the most recent attempt of the course is factored into the cumulative CGPA and total credit hours. Earlier attempts are ignored in CGPA.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-500 transition-colors">
                    <input
                      type="radio"
                      name="repeatPolicy"
                      checked={repeatPolicy === 'best'}
                      onChange={() => setRepeatPolicy('best')}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        Count Best Attempt
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        The attempt with the highest grade points (and higher marks) is counted towards CGPA, protecting the student if a repeat resulted in a lower grade.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  UAF AG Registration Number
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.agNumber}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-sm cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  AG Number is fixed as profile key. To use a different AG number, create or switch profile.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Student Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Muhammad Usman"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Degree / Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={degreeProgram}
                    onChange={(e) => setDegreeProgram(e.target.value)}
                    placeholder="e.g. B.Sc. (Hons.) Agriculture (Agronomy)"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </dialog>
  )
}
