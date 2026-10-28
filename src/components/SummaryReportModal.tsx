import { useEffect, useRef, useId } from 'react'
import {
  X,
  Printer,
  GraduationCap,
} from 'lucide-react'
import { StudentProfile, CgpaCalculationResult } from '../types'

interface SummaryReportModalProps {
  isOpen: boolean
  profile: StudentProfile
  cgpaResult: CgpaCalculationResult
  onClose: () => void
}

export function SummaryReportModal({
  isOpen,
  profile,
  cgpaResult,
  onClose,
}: SummaryReportModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
    } else {
      if (dialog.open) dialog.close()
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

  const handlePrint = () => {
    window.print()
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
      <div className="w-[96vw] max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 print:p-0 print:border-none print:shadow-none print:max-h-none print:overflow-visible">
        {/* Print Header Controls (Hidden during print) */}
        <div className="no-print flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span id={titleId} className="font-bold text-base text-slate-900 dark:text-white">
              Official Result Summary &amp; Transcript Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Transcript Document */}
        <div className="print-container bg-white text-slate-900 p-2 sm:p-6 rounded-2xl">
          {/* Institutional Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <GraduationCap className="w-8 h-8 text-indigo-700" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-slate-900">
                University of Agriculture Faisalabad
              </h1>
            </div>
            <p className="text-xs uppercase tracking-widest font-bold text-slate-600">
              Student Academic Performance Summary
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Generated via CGPA Pro (Offline Student Profile) • Date:{' '}
              {new Date().toLocaleDateString('en-PK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-500 block text-[10px]">
                AG Registration
              </span>
              <span className="font-mono font-bold text-base text-slate-900">
                {profile.agNumber}
              </span>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-500 block text-[10px]">
                Student Name
              </span>
              <span className="font-bold text-sm text-slate-900">
                {profile.studentName || 'Not Specified'}
              </span>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-500 block text-[10px]">
                Degree Program
              </span>
              <span className="font-bold text-xs text-slate-900">
                {profile.degreeProgram || 'General Degree'}
              </span>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-500 block text-[10px]">
                Repeat Policy
              </span>
              <span className="font-semibold text-xs text-indigo-700">
                {profile.repeatPolicy === 'latest' ? 'Latest Attempt' : 'Best Attempt'}
              </span>
            </div>
          </div>

          {/* Cumulative CGPA Hero Summary Block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 mb-8 text-center">
            <div className="border-b sm:border-b-0 sm:border-r border-indigo-200/80 pb-3 sm:pb-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                Cumulative CGPA
              </span>
              <div className="mt-1 text-4xl font-black font-mono text-indigo-700">
                {cgpaResult.cgpa.toFixed(2)}
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold">Scale of 4.00</span>
            </div>

            <div className="border-b sm:border-b-0 sm:border-r border-indigo-200/80 pb-3 sm:pb-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                Total Credit Hours
              </span>
              <div className="mt-1 text-4xl font-black font-mono text-slate-900">
                {cgpaResult.totalCreditHours}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Credits Earned</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                Total Quality Points
              </span>
              <div className="mt-1 text-4xl font-black font-mono text-emerald-700">
                {cgpaResult.totalQualityPoints.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Total QP</span>
            </div>
          </div>

          {/* Semesters & Courses Detail */}
          <div className="space-y-6">
            {profile.semesters.map((sem) => {
              const semRes = cgpaResult.semesterResults.find((r) => r.semesterId === sem.id)
              return (
                <div key={sem.id} className="page-break-inside-avoid border border-slate-300 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 p-3 flex items-center justify-between border-b border-slate-300 text-xs font-bold">
                    <span className="text-slate-900 font-extrabold text-sm">{sem.name}</span>
                    <div className="flex items-center gap-4">
                      <span>Credits: {semRes?.totalCredits || 0}</span>
                      <span>QP: {semRes?.qualityPoints.toFixed(2) || '0.00'}</span>
                      <span className="px-2.5 py-0.5 rounded bg-indigo-600 text-white font-mono">
                        GPA: {semRes?.gpa.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase">
                      <tr>
                        <th className="p-2.5">Course Code</th>
                        <th className="p-2.5">Title</th>
                        <th className="p-2.5 text-center">Credit Hours</th>
                        <th className="p-2.5 text-center">Marks</th>
                        <th className="p-2.5 text-center">Grade</th>
                        <th className="p-2.5 text-center">GP</th>
                        <th className="p-2.5 text-right">Quality Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sem.courses.map((c) => (
                        <tr key={c.id}>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{c.code}</td>
                          <td className="p-2.5 text-slate-700">{c.title || '-'}</td>
                          <td className="p-2.5 text-center font-mono">
                            {c.creditHoursRaw || c.creditHours}
                          </td>
                          <td className="p-2.5 text-center font-mono">
                            {c.marks !== undefined ? c.marks : 'Grade'}
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-900">{c.grade}</td>
                          <td className="p-2.5 text-center font-mono">{c.gradePoints.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                            {(c.gradePoints * c.creditHours).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>

          {/* Footer disclosure */}
          <div className="mt-8 pt-4 border-t border-slate-300 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              CGPA Pro for UAF Students • Standard 4.0 Scale Formula: CGPA = Total Quality Points / Total Credit Hours.
            </span>
            <span className="font-mono">Verify with official UAF controller of examinations.</span>
          </div>
        </div>

        {/* Modal Close Action */}
        <div className="no-print mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </dialog>
  )
}
