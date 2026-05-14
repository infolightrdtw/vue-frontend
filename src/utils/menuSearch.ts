export function menuItemMatches(item: any, query: string): boolean {
    if (!query) return false
    const q = query.toLowerCase()
    return (item?.text ?? '').toString().toLowerCase().includes(q)
}

export function hasMatchingDescendant(item: any, query: string): boolean {
    if (!query || !item?.children) return false
    return item.children.some((c: any) => menuItemMatches(c, query) || hasMatchingDescendant(c, query))
}

export function isMenuItemVisible(item: any, query: string): boolean {
    if (!query) return true
    return menuItemMatches(item, query) || hasMatchingDescendant(item, query)
}

export function highlightSegments(text: any, query: string): Array<{ text: string, match: boolean }> {
    const safe = (text ?? '').toString()
    if (!query) return [{ text: safe, match: false }]
    const q = query.toLowerCase()
    const lowered = safe.toLowerCase()
    const segments: Array<{ text: string, match: boolean }> = []
    let idx = 0
    while (idx < safe.length) {
        const found = lowered.indexOf(q, idx)
        if (found === -1) {
            segments.push({ text: safe.slice(idx), match: false })
            break
        }
        if (found > idx) {
            segments.push({ text: safe.slice(idx, found), match: false })
        }
        segments.push({ text: safe.slice(found, found + q.length), match: true })
        idx = found + q.length
    }
    return segments
}
