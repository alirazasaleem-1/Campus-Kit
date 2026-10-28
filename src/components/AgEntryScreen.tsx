import React, { useState, useEffect } from 'react'
import {
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  User,
  BookOpen,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { validateAgNumber } from '../utils/calculations'
import { StoredAppState } from '../types'

interface AgEntryScreenProps {
  lastActiveAgNumber?: string
  profiles: StoredAppState['profiles']
  onSelectProfile: (agNumber: string, name?: string, degree?: string) => void
  onDeleteProfile: (agNumber: string) => void
  onLoadDemo: () => void
}

export function AgEntryScreen({
  lastActiveAgNumber,
  profiles,
  onSelectProfile,
  onDeleteProfile,
  onLoadDemo,
}: AgEntryScreenProps) {
  const [agInput, setAgInput] = useState(lastActiveAgNumber || '')
  const [studentName, setStudentName] = useState('')
  const [degreeProgram, setDegreeProgram] = useState('')
  const [touched, setTouched] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null)

  const validation = validateAgNumber(agInput)
  const existingProfileKeys = Object.keys(profiles)

  // Auto-fill student name/degree if existing profile is typed
  useEffect(() => {
    const norm = agInput.trim().toLowerCase()
    if (profiles[norm]) {
      if (profiles[norm].studentName) setStudentName(profiles[norm].studentName || '')
      if (profiles[norm].degreeProgram) setDegreeProgram(profiles[norm].degreeProgram || '')
    }
  }, [agInput, profiles])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!validation.isValid) return

    onSelectProfile(
      validation.normalized,
      studentName.trim() || undefined,
      degreeProgram.trim() || undefined
    )
  }

  const handleQuickSelect = (ag: string) => {
    onSelectProfile(ag)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl">
        {/* Main Entry Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-soft-lg border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-4 transform hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-9 h-9" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome to <span className="text-indigo-600 dark:text-indigo-400">CGPA Pro</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-sm">
              Tailored for students at University of Agriculture Faisalabad (UAF)
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="agNumberInput"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                UAF AG Registration Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="agNumberInput"
                  type="text"
                  value={agInput}
                  onChange={(e) => {
                    setAgInput(e.target.value)
                    setTouched(true)
                  }}
                  placeholder="e.g. 2024-ag-1234"
                  autoComplete="off"
                  className={`w-full px-4 py-3 text-base font-mono rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-4 ${
                    touched && !validation.isValid && agInput.length > 0
                      ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 focus:ring-rose-500/20'
                      : validation.isValid
                      ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-emerald-500/20 text-slate-900 dark:text-white'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 dark:text-white'
                  }`}
                />
                <div className="absolute right-3.5 top-3.5 pointer-events-none">
                  {validation.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in fade-in" />
                  ) : touched && agInput.length > 0 ? (
                    <AlertCircle className="w-5 h-5 text-rose-500 animate-in fade-in" />
                  ) : null}
                </div>
              </div>

              {/* Validation helper */}
              <div className="mt-1.5 min-h-[20px] flex items-center justify-between text-xs">
                {touched && !validation.isValid && agInput.length > 0 ? (
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    {validation.error || 'Format should be: YYYY-ag-XXXXX'}
                  </span>
                ) : validation.isValid ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    ✓ Valid format: {validation.normalized}
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">
                    Format: 4-digit year, -ag-, followed by 1 to 5 digits (e.g. 2024-ag-1234)
                  </span>
                )}
              </div>
            </div>

            {/* Optional profile fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label
                  htmlFor="studentNameInput"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
                >
                  Student Name <span className="text-slate-400 text-[10px]">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="studentNameInput"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Ali Raza"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="degreeInput"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
                >
                  Degree Program <span className="text-slate-400 text-[10px]">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <input
                    id="degreeInput"
                    type="text"
                    value={degreeProgram}
                    onChange={(e) => setDegreeProgram(e.target.value)}
                    placeholder="e.g. BS Computer Science"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Privacy notice - MANDATORY requirement */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                <strong className="font-semibold">Privacy Notice:</strong> Your data is saved only on this device.
                Never enter passwords here. The AG number is used strictly as a local profile key.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!validation.isValid}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              <span>Continue to CGPA Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Want to test right away?</span>
            <button
              type="button"
              onClick={onLoadDemo}
              className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-1 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample UAF Profile
            </button>
          </div>
        </div>

        {/* Saved Profiles List on this device */}
        {existingProfileKeys.length > 0 && (
          <div className="mt-6 bg-white/70 dark:bg-slate-900/70 rounded-3xl p-5 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Saved Profiles on this Device ({existingProfileKeys.length})
              </h2>
            </div>

            <div className="space-y-2">
              {existingProfileKeys.map((agKey) => {
                const prof = profiles[agKey]
                const semCount = prof.semesters.length
                return (
                  <div
                    key={agKey}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-150 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleQuickSelect(agKey)}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs flex items-center justify-center">
                        AG
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {prof.agNumber}
                          </span>
                          {prof.studentName && (
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                              • {prof.studentName}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {prof.degreeProgram ? `${prof.degreeProgram} • ` : ''}
                          {semCount} {semCount === 1 ? 'semester' : 'semesters'} recorded
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        type="button"
                        onClick={() => handleQuickSelect(agKey)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfileToDelete(agKey)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete Profile"
                        aria-label={`Delete profile ${agKey}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {profileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Profile?</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete profile{' '}
              <strong className="font-mono text-rose-600 dark:text-rose-400">{profileToDelete}</strong> and all its
              semesters from this device?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setProfileToDelete(null)}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (profileToDelete) {
                    onDeleteProfile(profileToDelete)
                    setProfileToDelete(null)
                  }
                }}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
