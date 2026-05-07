const MAX_DECIMAL_PLACES = 5
const MAX_HISTORY_CHARS = 20

export function getDisplayPresentation(rawDisplay: string): string {
  const display = rawDisplay || '0'

  // Only truncate plain decimals — not expressions (spaces) or scientific notation (e)
  if (!display.includes(' ') && !display.toLowerCase().includes('e')) {
    const dotIndex = display.indexOf('.')
    if (dotIndex !== -1 && display.length > dotIndex + 1 + MAX_DECIMAL_PLACES) {
      return display.slice(0, dotIndex + 1 + MAX_DECIMAL_PLACES)
    }
  }

  return display
}

export function getHistoryPresentation(
  resolvedExpression: string | null,
): string {
  if (!resolvedExpression) {
    return ''
  }

  const stripped = resolvedExpression.replace(/ =$/, '')

  if (stripped.length > MAX_HISTORY_CHARS) {
    return `…${stripped.slice(-(MAX_HISTORY_CHARS - 1))}`
  }

  return stripped
}
