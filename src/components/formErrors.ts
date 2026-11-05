import type { FieldError, FieldErrors, FieldPath } from 'react-hook-form'
import type { JobApplicationData } from '../form/schema'

export const getFieldError = (
  errors: FieldErrors<JobApplicationData>,
  path: FieldPath<JobApplicationData>,
): FieldError | undefined => {
  let current: unknown = errors

  for (const key of path.split('.')) {
    if (typeof current !== 'object' || current === null || !(key in current)) {
      return undefined
    }

    current = (current as Record<string, unknown>)[key]
  }

  if (current && typeof current === 'object' && 'message' in current) {
    return current as FieldError
  }

  return undefined
}
