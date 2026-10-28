import { useState, useEffect, useRef, useId } from 'react'
import {
  X,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileJson,
} from 'lucide-react'
import { StudentProfile } from '../types'
import { exportProfileToJson, validateProfileData } from '../utils/exportImport'

interface ExportImportModalProps {
  isOpen: boolean
  activeProfile: StudentProfile
  onImportProfile: (profile: StudentProfile) => void
  onClose: () => void
}

export function ExportImportModal({
  isOpen,
  activeProfile,
  onImportProfile,
  onClose,
}: ExportImportModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const titleId = useId()

  const [importCandidate, setImportCandidate] = useState<StudentProfile | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
      setImportCandidate(null)
      setImportError(null)
      setImportSuccess(false)
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

  const handleExport = () => {
    exportProfileToJson(activeProfile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    setImportCandidate(null)
    setImportSuccess(false)

    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        const validation = validateProfileData(parsed)
        if (!validation.isValid || !validation.profile) {
          setImportError(validation.error || 'Failed to validate backup JSON.')
        } else {
          setImportCandidate(validation.profile)
        }
      } catch {
        setImportError('Invalid JSON file. Please ensure the file is valid JSON.')
      }
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = () => {
    if (!importCandidate) return
    onImportProfile(importCandidate)
    setImportSuccess(true)
    setTimeout(() => {
      onClose()
    }, 1200)
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
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white">
                Data Backup &amp; Restore
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Profile: <span className="font-mono font-semibold">{activeProfile.agNumber}</span>
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

        {/* Content */}
        <div className="mt-5 space-y-6">
          {/* Section 1: Export */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Export Profile JSON Backup
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Download a copy of your semesters, courses, and custom grading scale as a portable JSON file.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors flex-shrink-0"
              >
                Download JSON
              </button>
            </div>
          </div>

          {/* Section 2: Import */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Import Profile JSON Backup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Restore a previously saved backup file. This will update or add the profile on this device.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 flex flex-col items-center justify-center gap-1.5 bg-white dark:bg-slate-900 transition-colors"
            >
              <FileJson className="w-6 h-6 text-emerald-500" />
              <span>Click to select backup .json file</span>
            </button>

            {/* Error Message */}
            {importError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}

            {/* Validation Candidate Preview */}
            {importCandidate && !importSuccess && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <span>Valid Backup File Found</span>
                  <span className="font-mono">{importCandidate.agNumber}</span>
                </div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Found {importCandidate.semesters.length} semester(s) with courses.
                  {importCandidate.studentName ? ` Student: ${importCandidate.studentName}` : ''}
                </div>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Confirm &amp; Load This Backup
                </button>
              </div>
            )}

            {/* Success indicator */}
            {importSuccess && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Backup restored successfully! Switching to profile...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  )
}
