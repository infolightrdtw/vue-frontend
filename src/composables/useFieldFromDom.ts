/**
 * Resolve a field name by inspecting the DOM around `root`.
 *
 * Mirrors the fallback logic that Combobox previously did inline in
 * onMounted: when no `field` prop is supplied, look for a sibling `<label>`
 * inside the closest `.row`, or — if the editor sits inside a `<table>` —
 * fall back to the corresponding `<thead>` cell text.
 *
 * Returns an empty string when nothing is found, so callers can treat the
 * result as a plain string.
 */
export function resolveFieldFromDom (root: Element | null | undefined): string {
  if (!root) return ''

  const fromRow = readLabelInRow(root)
  if (fromRow) return fromRow

  const fromTable = readHeaderInTable(root)
  if (fromTable) return fromTable

  return ''
}

function readLabelInRow (root: Element): string {
  const row = root.closest?.('.row')
  if (!row) return ''
  const label = row.querySelector('label')
  return (label?.textContent || '').trim()
}

function readHeaderInTable (root: Element): string {
  const table = findAncestor(root, el => el.tagName === 'TABLE') as HTMLTableElement | null
  if (!table) return ''

  const td = root.closest?.('td') as HTMLTableCellElement | null
  if (!td || !td.parentElement) return ''

  const cells = Array.from(td.parentElement.children)
  const colIndex = cells.indexOf(td)
  if (colIndex < 0) return ''

  const headerRow = table.querySelector('thead tr')
  if (!headerRow) return ''

  const ths = Array.from(headerRow.children)
  const targetTh = ths[colIndex]
  return (targetTh?.textContent || '').trim()
}

function findAncestor (
  start: Element,
  predicate: (el: Element) => boolean
): Element | null {
  let current: Element | null = start
  while (current) {
    if (predicate(current)) return current
    current = current.parentElement
  }
  return null
}
