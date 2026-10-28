import { useState } from 'react'
import {
  GraduationCap,
  Moon,
  Sun,
  Settings,
  Target,
  Printer,
  Users,
  Download,
  Menu,
  X,
} from 'lucide-react'
import { StudentProfile } from '../types'

interface NavbarProps {
  activeProfile: StudentProfile | null
  isDark: boolean
  onToggleDarkMode: () => void
  onOpenSettings: () => void
  onOpenPlanner: () => void
  onOpenPrintSummary: () => void
  onOpenProfileSwitcher: () => void
  onOpenBackup: () => void
}

export function Navbar({
  activeProfile,
  isDark,
  onToggleDarkMode,
  onOpenSettings,
  onOpenPlanner,
  onOpenPrintSummary,
  onOpenProfileSwitcher,
  onOpenBackup,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & UAF Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  CGPA <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  UAF
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                University of Agriculture Faisalabad
              </p>
            </div>
          </div>

          {/* Active Profile Badge (Desktop) */}
          {activeProfile && (
            <button
              type="button"
              onClick={onOpenProfileSwitcher}
              className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors text-xs font-medium border border-slate-200 dark:border-slate-700/60 group"
              title="Click to switch or manage profiles"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {activeProfile.agNumber}
              </span>
              {activeProfile.studentName && (
                <span className="text-slate-500 dark:text-slate-400 max-w-[120px] truncate">
                  ({activeProfile.studentName})
                </span>
              )}
              <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors ml-0.5" />
            </button>
          )}

          {/* Desktop Navigation Icons */}
          <div className="hidden md:flex items-center gap-2">
            {activeProfile && (
              <>
                <button
                  type="button"
                  onClick={onOpenPlanner}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                >
                  <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Target Planner
                </button>

                <button
                  type="button"
                  onClick={onOpenPrintSummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Print or Save as PDF Summary"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  PDF Transcript
                </button>

                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Grading Scale & Policies"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  Settings
                </button>

                <button
                  type="button"
                  onClick={onOpenBackup}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title="Export / Import Profile Backup"
                  aria-label="Backup and restore data"
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {activeProfile && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && activeProfile && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Profile:</span>
              <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                {activeProfile.agNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenProfileSwitcher()
              }}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 underline"
            >
              Switch Profile
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false)
              onOpenPlanner()
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40"
          >
            <Target className="w-4 h-4" />
            Target CGPA Planner
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false)
              onOpenPrintSummary()
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print / PDF Summary
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false)
              onOpenSettings()
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            Grading Scale & Policies
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false)
              onOpenBackup()
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export / Import JSON Backup
          </button>
        </div>
      )}
    </header>
  )
}
