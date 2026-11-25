
export function isSqliteUniqueConstraintError(
  error: unknown
): boolean {

  if (!(error instanceof Error)) {
    return false
  }

  if (!('code' in error)) {
    return false
  }

  return error.code === 'SQLITE_CONSTRAINT_UNIQUE'

}
