import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dataApi so loadRelationValues' loadData returns a controllable related-table set.
// Note: with total:false the backend returns a bare array (see Core ToDynamic(false)).
const loadDataMock = vi.fn(async () => ([] as any[]))
vi.mock('@/utils/dataApi', () => ({
  default: () => ({ loadData: loadDataMock })
}))

import pageApiFactory from '../pageApi'

function makeApi () {
  // funcs / controls / addOn — none needed for the relation cache helpers
  return pageApiFactory({}, {}, undefined as any)
}

beforeEach(() => {
  loadDataMock.mockReset()
})

describe('pageApi relation cache: trims space-padded CHAR keys', () => {
  const opts = { remoteName: 'm.ref', valueField: 'code', textField: 'name' }

  it('matches a padded row value against the related-table key', async () => {
    // related table returns padded CHAR codes (typical EEP/Informix)
    loadDataMock.mockResolvedValue([
      { code: '001 ', name: '台北' },
      { code: '002', name: '台中' }
    ])
    const $ = makeApi()
    await $.loadRelationValues(opts, '001,002')

    // lookup with a padded value (as it would arrive from the grid row) still resolves
    expect(await $.getRelationValue(opts, '001  ')).toBe('台北')
    expect(await $.getRelationValue(opts, '002')).toBe('台中')
    expect(await $.getRelationValue(opts, '999')).toBe('')
  })

  it('does not crash the cache when the relation query fails (data undefined)', async () => {
    loadDataMock.mockRejectedValue(new Error('backend down'))
    const $ = makeApi()
    // must not throw — previously data.reduce on undefined blew up the whole grid load
    await expect($.loadRelationValues(opts, '001')).resolves.toBeUndefined()
    expect(await $.getRelationValue(opts, '001')).toBe('')
  })

  it('keys the cache by remoteName+valueField+textField (no cross-relation collision)', async () => {
    const optsA = { remoteName: 'm.ref', valueField: 'code', textField: 'name' }
    const optsB = { remoteName: 'm.ref', valueField: 'code', textField: 'shortName' }
    const $ = makeApi()
    loadDataMock.mockResolvedValueOnce([{ code: '001', name: '台北市', shortName: '北' }])
    await $.loadRelationValues(optsA, '001')
    loadDataMock.mockResolvedValueOnce([{ code: '001', name: '台北市', shortName: '北' }])
    await $.loadRelationValues(optsB, '001')
    // optsA still resolves to its own textField even though optsB shares remoteName
    expect(await $.getRelationValue(optsA, '001')).toBe('台北市')
    expect(await $.getRelationValue(optsB, '001')).toBe('北')
  })
})

describe('pageApi autoseq defaultValue rule (detail-grid path) supports prefix + fixes padding', () => {
  // getDefaultValue('autoseq[...]', { autoseq: rows }) is what DataGrid.getDefaultValues drives.
  it('strips a prefix from existing values, increments, pads, and re-applies the prefix', async () => {
    const $ = makeApi()
    const rows = [{ 編號: 'A001' }, { 編號: 'A002' }]
    expect($.getDefaultValue("autoseq['編號',3,1,1,'A']", { autoseq: rows })).toBe('A003')
  })

  it('starts at startValue (prefixed + padded) when there are no rows yet', () => {
    const $ = makeApi()
    expect($.getDefaultValue("autoseq['編號',3,5,1,'A']", { autoseq: [] })).toBe('A005')
  })

  it('auto-detects a non-numeric prefix in existing values even without an explicit prefix arg', () => {
    const $ = makeApi()
    const rows = [{ 編號: 'A007' }]
    // no prefix arg → trailing digits parsed (007) → +1 → 008, padded to 3
    expect($.getDefaultValue("autoseq['編號',3,1,1]", { autoseq: rows })).toBe('008')
  })

  it('plain numeric detail sequence increments with correct zero-padding (padding-bug fix)', () => {
    const $ = makeApi()
    const rows = [{ 次序: '1' }, { 次序: '2' }]
    expect($.getDefaultValue("autoseq['次序',2,1,1]", { autoseq: rows })).toBe('03')
  })

  it('first numeric detail row pads the startValue (not the old "0-1" bug)', () => {
    const $ = makeApi()
    expect($.getDefaultValue("autoseq['次序',2,1,1]", { autoseq: [] })).toBe('01')
  })
})
