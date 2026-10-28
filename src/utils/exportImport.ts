import { StudentProfile } from '../types'
import { validateAgNumber } from './calculations'

export function exportProfileToJson(profile: StudentProfile): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2))
  const downloadAnchor = document.createElement('a')
  const cleanAg = profile.agNumber.replace(/[^a-zA-Z0-9-]/g, '_')
  const dateStr = new Date().toISOString().slice(0, 10)
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `${cleanAg}_cgpa_pro_backup_${dateStr}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

export function validateProfileData(data: unknown): { isValid: boolean; profile?: StudentProfile; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid JSON file format: root must be an object.' }
  }

  const candidate = data as Partial<StudentProfile>

  if (!candidate.agNumber || typeof candidate.agNumber !== 'string') {
    return { isValid: false, error: 'Missing or invalid "agNumber" field.' }
  }

  const valAg = validateAgNumber(candidate.agNumber)
  if (!valAg.isValid) {
    return { isValid: false, error: `Invalid AG Number in backup file: ${valAg.error}` }
  }

  if (!Array.isArray(candidate.semesters)) {
    return { isValid: false, error: 'Missing or invalid "semesters" list in file.' }
  }

  const validProfile: StudentProfile = {
    agNumber: valAg.normalized,
    studentName: typeof candidate.studentName === 'string' ? candidate.studentName : undefined,
    degreeProgram: typeof candidate.degreeProgram === 'string' ? candidate.degreeProgram : undefined,
    semesters: candidate.semesters,
    gradingScale: Array.isArray(candidate.gradingScale) ? candidate.gradingScale : [],
    repeatPolicy: candidate.repeatPolicy === 'best' ? 'best' : 'latest',
    lastUpdated: new Date().toISOString(),
  }

  return { isValid: true, profile: validProfile }
}
