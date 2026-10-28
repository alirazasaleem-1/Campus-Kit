import { useState, useEffect, useRef, useId } from 'react'
import {
  X,
  Target,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { calculateRequiredGpa, parseCreditHours } from '../utils/calculations'
import { CgpaCalculationResult } from '../types'

interface TargetPlannerModalProps {
  isOpen: boolean
  cgpaResult: CgpaCalculationResult
  onClose: () => void
}

export function TargetPlannerModal({
  isOpen,
  cgpaResult,
  onClose,
}: TargetPlannerModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const titleId = useId()

  const [targetCgpa, setTargetCgpa] = useState<string>('3.50')
  const [upcomingCreditsRaw, setUpcomingCreditsRaw] = useState<string>('18(12-6)')

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

  const parsedUpcomingCredits = parseCreditHours(upcomingCreditsRaw)
  const numericTarget = parseFloat(targetCgpa) || 0

  const planResult = calculateRequiredGpa(
    cgpaResult.cgpa,
    cgpaResult.totalCreditHours,
    numericTarget,
    parsedUpcomingCredits
  )

  // Quick scenarios
  const calculateScenarioCgpa = (scenarioGpa: number) => {
    const currentQp = cgpaResult.cgpa * cgpaResult.totalCreditHours
    const futureCredits = cgpaResult.totalCreditHours + parsedUpcomingCredits
    if (futureCredits <= 0) return 0
    return ((currentQp + scenarioGpa * parsedUpcomingCredits) / futureCredits).toFixed(2)
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
      <div className="w-[94vw] max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white">
                Target CGPA Planner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                &ldquo;What GPA do I need in my upcoming semester?&rdquo;
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

        {/* Current status bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Current CGPA:</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {cgpaResult.cgpa.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Completed Credits:</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {cgpaResult.totalCreditHours} cr
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Quality Points:</span>
            <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {cgpaResult.totalQualityPoints.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Desired Target CGPA
            </label>
            <input
              type="number"
              step="0.01"
              min="0.0"
              max="4.0"
              value={targetCgpa}
              onChange={(e) => setTargetCgpa(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. 3.50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Upcoming Semester Credits
            </label>
            <input
              type="text"
              value={upcomingCreditsRaw}
              onChange={(e) => setUpcomingCreditsRaw(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. 18 or 18(12-6)"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              = {parsedUpcomingCredits} credit hours
            </span>
          </div>
        </div>

        {/* Result Output Card */}
        <div className="mt-6">
          {planResult.status === 'achievable' && (
            <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Target is Achievable
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                  Required GPA
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300">
                  {planResult.requiredGpa.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  in upcoming {parsedUpcomingCredits} credit hours
                </span>
              </div>

              <p className="text-xs text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
                {planResult.message}
              </p>
            </div>
          )}

          {planResult.status === 'impossible_high' && (
            <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4" />
                Mathematically Impossible
              </div>
              <p className="text-xs text-rose-900 dark:text-rose-200/90 leading-relaxed">
                {planResult.message}
              </p>
              <div className="mt-3 pt-3 border-t border-rose-200 dark:border-rose-800/60 flex items-center justify-between text-xs font-medium">
                <span>Maximum reachable CGPA (with 4.00):</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                  {planResult.maxPossibleCgpa.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {planResult.status === 'already_achieved' && (
            <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-200">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                <Sparkles className="w-4 h-4" />
                Target Secured!
              </div>
              <p className="text-xs text-blue-900 dark:text-blue-200/90 leading-relaxed">
                {planResult.message}
              </p>
            </div>
          )}
        </div>

        {/* Projected Scenarios Table */}
        {parsedUpcomingCredits > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Projected CGPA Based on Semester Performance
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">If 4.00 GPA</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {calculateScenarioCgpa(4.0)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">If 3.50 GPA</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {calculateScenarioCgpa(3.5)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">If 3.00 GPA</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {calculateScenarioCgpa(3.0)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">If 2.50 GPA</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {calculateScenarioCgpa(2.5)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 pt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  )
}
