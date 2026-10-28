import { useEffect, useRef, useId, useState } from 'react'
import {
  X,
  Users,
  Plus,
  Trash2,
} from 'lucide-react'
import { StoredAppState } from '../types'

interface ProfileSwitcherModalProps {
  isOpen: boolean
  activeAgNumber: string | null
  profiles: StoredAppState['profiles']
  onSwitchProfile: (ag: string) => void
  onDeleteProfile: (ag: string) => void
  onNewAgEntry: () => void
  onClose: () => void
}

export function ProfileSwitcherModal({
  isOpen,
  activeAgNumber,
  profiles,
  onSwitchProfile,
  onDeleteProfile,
  onNewAgEntry,
  onClose,
}: ProfileSwitcherModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const titleId = useId()
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null)

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

  const profileKeys = Object.keys(profiles)

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
      <div className="w-[94vw] max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white">
                Switch Student Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All saved AG profiles on this device
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

        {/* Profile List */}
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-1">
          {profileKeys.map((agKey) => {
            const prof = profiles[agKey]
            const isActive = agKey === activeAgNumber
            const semCount = prof.semesters.length

            return (
              <div
                key={agKey}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSwitchProfile(agKey)
                    onClose()
                  }}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <div
                    className={`w-9 h-9 rounded-xl font-mono font-bold text-xs flex items-center justify-center ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    AG
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {prof.agNumber}
                      </span>
                      {isActive && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {prof.studentName ? `${prof.studentName} • ` : ''}
                      {semCount} semester(s)
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-1">
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchProfile(agKey)
                        onClose()
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 rounded-xl transition-colors"
                    >
                      Select
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setProfileToDelete(agKey)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                    title="Delete profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose()
              onNewAgEntry()
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Enter Another AG Registration Number
          </button>
        </div>

        {/* Delete Confirmation Popup */}
        {profileToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-xs w-full shadow-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Profile?</h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to delete profile <strong className="font-mono">{profileToDelete}</strong>?
              </p>
              <div className="mt-4 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setProfileToDelete(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteProfile(profileToDelete)
                    setProfileToDelete(null)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </dialog>
  )
}
