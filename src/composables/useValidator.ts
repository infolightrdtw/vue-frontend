/**
 * Validation rules ported from the jQuery runtime
 * (`$.fn.validatebox.defaults.rules` in bootstrap.infolight.js, ~line 15845).
 *
 * Behavior matches the jQuery `$.validate(rule, value, ...)` contract:
 *   - returns '' when the value passes
 *   - returns the formatted error message when it fails
 *   - empty values pass (jQuery convention) — required-checks live in the
 *     editor itself (see Textbox.vue / Combobox.vue `required` prop)
 *
 * Rule string syntax mirrors jQuery: `"ruleName"` or `"ruleName[a,b]"`.
 *
 * Not ported:
 *   - `unique` — requires a server roundtrip; do that inside the editor / form
 *   - `function` — dynamic callback; pass a custom rule via `customRules` instead
 */

export interface ValidatorRule {
  validator: (value: string, params: unknown[]) => boolean
  /** Message template; `{0}`, `{1}` … reference `params` (matches jQuery). */
  message: string
}

export type ValidatorRuleMap = Record<string, ValidatorRule>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

const URL_RE = /^((https?|ftp|rtsp|mms):\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/[^\s]*)?$/i

// Mainland China resident ID: 15 digits, or 18 digits/17+X
const CID_RE = /^(?:\d{15}|\d{17}[\dXx])$/

export const defaultRules: ValidatorRuleMap = {
  email: {
    validator: value => EMAIL_RE.test(value),
    message: 'Please enter a valid email address.'
  },
  url: {
    validator: value => URL_RE.test(value),
    message: 'Please enter a valid URL.'
  },
  length: {
    validator: (value, p) => {
      const len = value.trim().length
      return len >= toNumber(p[0]) && len <= toNumber(p[1])
    },
    message: 'Length must be between {0} and {1}.'
  },
  minLength: {
    validator: (value, p) => value.length >= toNumber(p[0]),
    message: 'Minimum length is {0}.'
  },
  maxLength: {
    validator: (value, p) => value.length <= toNumber(p[0]),
    message: 'Maximum length is {0}.'
  },
  greater: {
    validator: (value, p) => {
      const a = parseFloat(value)
      const b = parseFloat(String(p[0]))
      if (!isNaN(a) && !isNaN(b)) return a >= b
      return value >= String(p[0])
    },
    message: 'Value must be greater than or equal to {0}.'
  },
  less: {
    validator: (value, p) => {
      const a = parseFloat(value)
      const b = parseFloat(String(p[0]))
      if (!isNaN(a) && !isNaN(b)) return a <= b
      return value <= String(p[0])
    },
    message: 'Value must be less than or equal to {0}.'
  },
  range: {
    validator: (value, p) => {
      const a = parseFloat(value)
      const lo = parseFloat(String(p[0]))
      const hi = parseFloat(String(p[1]))
      if (!isNaN(a) && !isNaN(lo) && !isNaN(hi)) return a >= lo && a <= hi
      if (p[0] === '' || p[0] == null) return true
      return value >= String(p[0]) && value <= String(p[1])
    },
    message: 'Value must be between {0} and {1}.'
  },
  cid: {
    validator: value => CID_RE.test(value),
    message: 'Please enter a valid ID number.'
  },
  // Taiwan resident ID — 1 letter + 9 digits, weighted checksum
  tid: {
    validator: value => isValidTaiwanResidentId(value),
    message: 'Please enter a valid ID number.'
  },
  // Taiwan unified business number (統一編號) — 8 digits, weighted checksum
  uid: {
    validator: value => isValidTaiwanBusinessId(value),
    message: 'Please enter a valid business ID.'
  }
}

/**
 * Run a validation rule string against a value.
 *
 * Empty values pass (matching jQuery `$.validate`). Pass `customRules` to add
 * or override specific rules (the local map wins on name collisions).
 */
export function validate (
  rule: string | null | undefined,
  value: string | number | null | undefined,
  customRules?: ValidatorRuleMap
): string {
  if (!rule) return ''

  const match = /([a-zA-Z_]+)(.*)/.exec(rule)
  if (!match) return ''

  const ruleName = match[1]
  const allRules = customRules ? { ...defaultRules, ...customRules } : defaultRules
  const rec = allRules[ruleName]
  if (!rec) return ''

  if (value == null || value === '') return ''
  const text = String(value)

  const params = parseRuleParams(match[2])
  if (rec.validator(text, params)) return ''
  return formatMessage(rec.message, params)
}

function parseRuleParams (raw: string): unknown[] {
  const trimmed = (raw || '').trim()
  if (!trimmed) return []
  // jQuery uses eval(); we only need to support the array literal form `[…]`.
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return []

  const inner = trimmed.slice(1, -1).trim()
  if (!inner) return []

  return inner.split(',').map(parseScalar)
}

function parseScalar (raw: string): unknown {
  const s = raw.trim()
  if (s === 'true') return true
  if (s === 'false') return false
  if (s === 'null') return null
  if ((s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith('\'') && s.endsWith('\''))) {
    return s.slice(1, -1)
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : s
}

function formatMessage (msg: string, args: unknown[]): string {
  return msg.replace(/\{(\d+)\}/g, (_, idx) => {
    const v = args[Number(idx)]
    return v == null ? '' : String(v)
  })
}

function toNumber (v: unknown): number {
  if (typeof v === 'number') return v
  const n = parseFloat(String(v))
  return Number.isFinite(n) ? n : 0
}

function isValidTaiwanResidentId (value: string): boolean {
  if (!/^[A-Z][12]\d{8}$/.test(value)) return false
  const letterMap: Record<string, number> = {
    A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34,
    J: 18, K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25,
    S: 26, T: 27, U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33
  }
  const letterVal = letterMap[value[0]]
  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]
  const digits = [
    Math.floor(letterVal / 10),
    letterVal % 10,
    ...value.slice(1).split('').map(d => Number(d))
  ]
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0)
  return sum % 10 === 0
}

function isValidTaiwanBusinessId (value: string): boolean {
  if (!/^\d{8}$/.test(value)) return false
  if (value === '00000000' || value === '11111111') return false
  const multipliers = [1, 2, 1, 2, 1, 2, 4, 1]
  const digitSum = (n: number) => Math.floor(n / 10) + (n % 10)
  const sum = multipliers.reduce(
    (acc, m, i) => acc + digitSum(Number(value[i]) * m),
    0
  )
  return sum % 5 === 0 || (value[6] === '7' && (sum + 1) % 5 === 0)
}
