import { type DataBaseError } from "../globalTypes/db-types.ts"

export function isDataBaseError(error: unknown): error is DataBaseError {
  // Check if it's a direct database error
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return true
  }

  // Check if it's a Drizzle error with cause property
  if (
    typeof error === 'object' &&
    error !== null &&
    'cause' in error &&
    typeof error.cause === 'object' &&
    error.cause !== null &&
    'code' in error.cause &&
    typeof error.cause.code === 'string'
  ) {
    return true
  }

  return false
}

export function getDatabaseError(error: unknown): DataBaseError | null {
  if (!isDataBaseError(error)) {
    return null
  }

  // If it has a cause, return the cause (Drizzle wrapped error)
  if ('cause' in error && typeof error.cause === 'object' && error.cause !== null) {
    return error.cause as DataBaseError
  }

  // Otherwise return the error itself
  return error as DataBaseError
}
