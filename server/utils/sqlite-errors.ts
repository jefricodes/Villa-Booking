
export function isD1UniqueConstraintError(
  error: unknown
): boolean {

  if (!(error instanceof Error)) {
    return false
  }

  return error.message.includes(
    'UNIQUE constraint failed'
  )

}


export function isD1ForeignKeyError(
  error: unknown
): boolean {

  if (!(error instanceof Error)) {
    return false
  }

  return error.message.includes(
    'FOREIGN KEY constraint failed'
  )

}
