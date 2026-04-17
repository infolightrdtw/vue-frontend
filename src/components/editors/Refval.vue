
<template>
  <div class="refval w-100" :class="{ 'is-readonly': isReadonly }">
    <div class="input-group refval-group">
      <input
        v-if="!showValueText"
        :type="inputType"
        class="form-control"
        :placeholder="placeholder"
        :readonly="selectOnly"
        :value="inputDisplay"
        @click="onClickInput"
        @focus="onFocusInput"
        @blur="onBlurInput"
        @input="onInput($event)"
        @keydown.enter.prevent="onPressEnter"
      />
      <template v-else>
        <input
          :type="inputType"
          class="form-control"
          :placeholder="valueTitle || 'Value'"
          :readonly="true"
          :value="String(modelValue ?? '')"
          @click="openPicker"
        />
        <input
          :type="inputType"
          class="form-control"
          :placeholder="textTitle || 'Text'"
          :readonly="true"
          :value="textValue"
          @click="openPicker"
        />
      </template>

      <button
        class="btn btn-outline-secondary refval-btn"
        type="button"
        :disabled="isReadonly"
        @click="openPicker"
        title="選擇"
      >
        <i class="bi bi-search"></i>
      </button>

    </div>

    <div v-if="!showValueText && selectOnly" class="mt-1">
      <p class="form-control-static refval-text mb-0">{{ textValue }}</p>
    </div>

    <!-- Picker Modal -->
    <div v-if="showModal" class="modal fade show" style="display:block;" tabindex="-1" role="dialog">
      <div class="modal-dialog refval-dialog modal-xl modal-dialog-scrollable" role="document">
        <div class="modal-content shadow">
          <div class="modal-header">
            <h5 class="modal-title">{{ panelTitle }}</h5>
            <button type="button" class="btn-close" @click="closePicker" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-2 mb-3">
              <div class="col-12 col-md-8">
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-funnel"></i></span>
                  <input
                    v-model.trim="keyword"
                    type="search"
                    class="form-control"
                    :placeholder="searchPlaceholder"
                    @keyup.enter="onSearch"
                  />
                  <button type="button" class="btn btn-primary" @click="onSearch">{{ lm.query }}</button>
                </div>
              </div>
              <div class="col-12 col-md-4 d-flex align-items-center justify-content-end gap-3">
               <small class="text-muted" v-if="totalRows >= 0">{{ (lm.pageCount).replace('{0}', totalPages) }}</small>
                <div class="d-flex align-items-center gap-2">
                  <select class="form-select form-select-sm" v-model.number="pageSize">
                    <option v-for="n in pageListResolved" :key="n" :value="n">{{ n }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-sm table-hover align-middle">
                <thead class="table-light sticky-top">
                  <tr>
                    <th v-for="col in normalizedColumns" :key="col.field" :class="thClass(col)">
                      {{ col.title || col.field }}
                        <button
                          type="button"
                          v-if="col.sortable"
                          class="btn btn-link btn-sm p-0 ms-1"
                          @click="toggleSort(col.field)"
                          :title="(lm.sort) + '：' + (sort.field === col.field ? (sort.dir === 'asc' ? 'ASC' : 'DESC') : '')"
                        >
                        <i class="bi" :class="sortIcon(col.field)"></i>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in pagedRows"
                    :key="rowKey(row)"
                    @click="selectRow(row)"
                    class="row-selectable"
                    tabindex="0"
                    @keydown.enter.prevent="selectRow(row)"
                  >
                    <td v-for="col in normalizedColumns" :key="col.field" :class="tdClass(col)">
                      <span>{{ formatCell(row, col) }}</span>
                    </td>
                  </tr>
                  <tr v-if="!loading && pagedRows.length === 0">
                    <td :colspan="normalizedColumns.length" class="text-center text-muted py-4">
                     {{ lm.dataNotFound.replace(':{0}', '') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer">
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="goPage(1)">«</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="goPage(currentPage - 1)">‹</a>
                </li>
                <li class="page-item" v-for="p in visiblePages" :key="p" :class="{ active: currentPage === p }">
                  <a class="page-link" href="#" @click.prevent="goPage(p)">{{ p }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                  <a class="page-link" href="#" @click.prevent="goPage(currentPage + 1)">›</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                  <a class="page-link" href="#" @click.prevent="goPage(totalPages)">»</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import dataUtils from '@/utils/dataApi'
import pageUtils from '@/utils/pageApi'

type Column = {
  title?: string
  field: string
  alignment?: 'left' | 'center' | 'right'
  sortable?: boolean
  format?: string
}
type WhereItem = {
  field: string
  operator?: string
  value?: unknown
  isWhereItem?: boolean
  or?: boolean
  isNvarChar?: boolean
}
type ColumnMatch = { targetField: string; sourceField: string }
type SortState = { field: string; dir: 'asc' | 'desc' }

const props = withDefaults(defineProps<{ 
  root?: any; 
  onText?: (t: string | null) => void; onApply?: (mapped: Record<string, any>, row: Record<string, any>) => void; onError?: (message: string) => void; onFocusCb?: () => void;
  modelValue: string | number | null
  text?: string | null
  remoteName: string
  valueField: string
  textField: string
  valueTitle?: string
  textTitle?: string
  columns?: Column[]
  pageSize?: number
  pageList?: number[]
  validateXss?: boolean
  queryMode?: 'none' | 'fuzzy'
  whereItems?: WhereItem[]
  columnMatchs?: ColumnMatch[]
  showValueText?: boolean
  checkData?: boolean
  autoQueryColumn?: boolean
  panelTitle?: string
  selectOnly?: boolean
  readonly?: boolean
  fit?: boolean
  placeholder?: string
}>(), {
  text: null,
  columns: () => [],
  pageSize: 10,
  pageList: () => [10, 20, 50, 100],
  validateXss: true,
  queryMode: 'fuzzy',
  whereItems: () => [],
  columnMatchs: () => [],
  showValueText: false,
  checkData: true,
  autoQueryColumn: false,
  panelTitle: '',
  selectOnly: true,
  readonly: false,
  fit: false,
  placeholder: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number | null): void
  (e: 'update:text', v: string | null): void
  (e: 'select', row: Record<string, any>): void
  (e: 'apply', mapped: Record<string, any>, row: Record<string, any>): void
  (e: 'focus'): void
  (e: 'error', message: string): void
}>()
const $this = pageUtils({}, {})
const lm = computed(() => $this.localeMessages?.value || {})

const optionsObj = computed(() => ({
  remoteName: props.remoteName,
  valueField: props.valueField,
  textField: props.textField,
  valueTitle: props.valueTitle,
  textTitle: props.textTitle,
  columns: props.columns,
  pageSize: pageSize.value,
  pageList: props.pageList,
  validateXss: props.validateXss,
  queryMode: props.queryMode,
  whereItems: props.whereItems,
  columnMatchs: props.columnMatchs,
  showValueText: props.showValueText,
  checkData: props.checkData,
  autoQueryColumn: props.autoQueryColumn,
  panelTitle: props.panelTitle,
  selectOnly: props.selectOnly,
  readonly: props.readonly,
  fit: props.fit
}))


const showModal = ref(false)
const loading   = ref(false)
const rows      = ref<any[]>([])
const totalRows = ref(0)
const currentPage = ref(1)
const pageSize  = ref(props.pageSize || 10)
const keyword   = ref('')
const sort      = reactive<SortState>({ field: '', dir: 'asc' })
const textValue = ref<string>('')

const tempInputValue = ref<string>('')
const tempSavedValue = ref<string>('') 
const tempSearchValue = ref<string>('') 
const tempChanged = ref<boolean>(false)
const isFocused = ref<boolean>(false)
const localWhereStr = ref<string | null>(null)         
const localWhereItems = ref<WhereItem[] | null>(null)  
const forceReadonly = ref<boolean | null>(null)     

const inputType = 'text'
const isReadonly = computed(() => forceReadonly.value === null ? !!props.readonly : !!forceReadonly.value)

function parseRemote(remoteName: string) {
  const seg = (remoteName || '').split('.')
  return { module: seg[0] || '', command: seg[1] || '' }
}

async function hydrateDisplay() {
  if (props.modelValue === undefined || props.modelValue === null || props.modelValue === '') {
    textValue.value = ''
    return
  }

  try {
    const { module, command } = parseRemote(props.remoteName)
    const { loadData } = dataUtils(props.remoteName)
    const body: any = {
      mode: 'getDataset',
      module,
      command,
      remoteName: props.remoteName,
      whereItems: [{ field: props.valueField, operator: '=', value: props.modelValue }]
    }

    const r: any = await loadData(body)
    const rows: any[] = Array.isArray(r) ? r : (Array.isArray(r?.rows) ? r.rows : [])
    const row = rows.find(x => x?.[props.valueField] == props.modelValue)
    const txt = row?.[props.textField] ?? ''

    textValue.value = txt
    emit('update:text', txt)
  } catch (e) {
    console.error('refval hydrateDisplay error:', e)
  }
}

onMounted(() => {
  if (props.text != null) textValue.value = String(props.text)

  tempInputValue.value = props.modelValue == null ? '' : String(props.modelValue)
  tempSavedValue.value = tempInputValue.value

  hydrateDisplay()
})
watch(() => props.modelValue, () => { hydrateDisplay() }, { immediate: false })
watch(() => props.remoteName, () => { hydrateDisplay() })


watch(() => props.text, (nv) => { if (nv !== undefined) textValue.value = nv == null ? '' : String(nv) })
watch(pageSize, () => { currentPage.value = 1 })

const inputDisplay = computed(() => {
  if (isFocused.value) {
    return props.modelValue == null ? '' : String(props.modelValue)
  }
  return (props.text ?? textValue.value) || ''
})


const searchPlaceholder = ''
const pageListResolved  = computed(() => props.pageList?.length ? props.pageList : [10, 20, 50, 100])

const normalizedColumns = computed<Column[]>(() => {
  const map = new Map<string, Column>()
  for (const c of props.columns || []) {
    if (c?.field) map.set(c.field, { title: c.title ?? c.field, field: c.field, alignment: c.alignment ?? 'left', sortable: !!c.sortable, format: c.format })
  }
  if (props.valueField && !map.has(props.valueField)) {
    map.set(props.valueField, { field: props.valueField, title: props.valueTitle || props.valueField, alignment: 'left' })
  }
  if (props.textField && !map.has(props.textField)) {
    map.set(props.textField, { field: props.textField, title: props.textTitle || props.textField, alignment: 'left' })
  }
  return Array.from(map.values())
})
const totalPages = computed(() => Math.ceil(totalRows.value / pageSize.value) || 0)
const visiblePages = computed(() => {
  const tp = totalPages.value
  const cur = currentPage.value
  const spread = 2
  const pages: number[] = []
  const start = Math.max(1, cur - spread)
  const end = Math.min(tp, cur + spread)
  for (let p = start; p <= end; p++) pages.push(p)
  return pages
})
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return rows.value.slice(start, start + pageSize.value)
})

function onClickInput() {
  if (isReadonly.value) return
  if (props.selectOnly) openPicker()
}
function onFocusInput() {
  isFocused.value = true
  emit('focus'); if (props.onFocusCb) props.onFocusCb()
  if (!props.selectOnly) tempInputValue.value = props.modelValue == null ? '' : String(props.modelValue)
}
async function onBlurInput(e: FocusEvent) {
  isFocused.value = false
  const value = tempInputValue.value
  const prev = tempSavedValue.value
  const changed = prev !== value
  tempSavedValue.value = value

  if (tempSearchValue.value) return

  if (value !== '') {
    const row = await getDisplayRow(value)
    if (props.checkData && !row) {
      const msg = `${lm.value.value} '${value}' ${lm.value.notExist}`
      emit('error', msg); if (props.onError) props.onError(msg)
      try { window?.alert?.(msg) } catch {}
      emit('update:modelValue', null)
      emit('update:text', null)
      textValue.value = ''
    } else {
      emit('update:modelValue', value as any)
      const txt = row ? row[props.textField] : ''
      textValue.value = txt || ''
      if (!props.showValueText && props.selectOnly) {

      }
      if (row) doColumnMatch(row)
      if (changed) emit('select', row || {})
    }
  } else {
    doColumnMatch(null)
    textValue.value = ''
    if (changed) emit('select', {} as any)
  }
}
function onInput(ev: Event) {
  tempChanged.value = true
  const v = (ev.target as HTMLInputElement).value
  tempInputValue.value = v
}
function onPressEnter() {
  const v = tempInputValue.value
  if (v) {
    tempSearchValue.value = v
  }
  tempSavedValue.value = ''
  tempInputValue.value = ''
  openPicker()
}


function thClass(col: Column) { return [col.alignment ? `text-${col.alignment}` : ''] }
function tdClass(col: Column) { return [col.alignment ? `text-${col.alignment}` : ''] }
function sortIcon(field: string) {
  if (sort.field !== field) return 'bi-arrow-down-up'
  return sort.dir === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up'
}
function toggleSort(field: string) {
  if (sort.field !== field) { sort.field = field; sort.dir = 'asc' }
  else { sort.dir = (sort.dir === 'asc' ? 'desc' : 'asc') }
  doSearch()
}
function rowKey(row: Record<string, any>) {
  const key = props.valueField || normalizedColumns.value[0]?.field || 'id'
  return String(row[key] ?? Math.random())
}
function formatCell(row: Record<string, any>, col: Column) {
  const v = row[col.field]
  if (v == null) return ''
  if (!col.format) return String(v)
  switch (col.format) {
    case 'N0': {
      const num = Number(v)
      return Number.isFinite(num) ? num.toLocaleString() : String(v)
    }
    default: return String(v)
  }
}

function openPicker() {
  if (isReadonly.value) return
  showModal.value = true
  if (tempSearchValue.value) {
    keyword.value = tempSearchValue.value
  }
  if (rows.value.length === 0) doSearch()
}
function closePicker() {
  showModal.value = false

  tempSearchValue.value = ''
}

function clearSelection() {
  emit('update:modelValue', null)
  emit('update:text', null)
  textValue.value = ''
}

function selectRow (row: any) {
  const val = row?.[props.valueField]
  const txt = row?.[props.textField] ?? ''

  emit('update:modelValue', val)

  textValue.value = txt
  emit('update:text', txt)

  doColumnMatch(row)
  closePicker()
}

function doColumnMatch(row?: Record<string, any> | null) {
  if (!props.columnMatchs?.length) return

  const mapped: Record<string, any> = {}
  for (const m of props.columnMatchs) {
    if (!m?.targetField || !m?.sourceField) continue
    mapped[m.targetField] = row?.[m.sourceField] ?? ''
  }

  emit('apply', mapped, row || {} as Record<string, any>)
  props.onApply?.(mapped, row || {} as Record<string, any>)
}


function buildWhereItems(extra: WhereItem[] = []): WhereItem[] {
  const items: WhereItem[] = localWhereItems.value ? [...localWhereItems.value] : []
  for (const w of (props.whereItems || [])) {
    if (!w?.field) continue
    items.push({ ...w, isWhereItem: true })
  }
  const kw = (keyword.value || '').trim()
  if (props.queryMode === 'fuzzy' && kw) {
    const keys = normalizedColumns.value.map(c => c.field)
    for (const f of keys) {
      items.push({ field: f, operator: '%%', value: kw, or: true })
    }
  }
  if (tempSearchValue.value) {
    items.push({ field: props.valueField, operator: '%', value: tempSearchValue.value })
  }
  if (extra?.length) items.push(...extra)

  return items
}

async function fetchByLoadData(body: any): Promise<{ rows: any[]; total?: number; keys?: string }> {
  const { loadData } = dataUtils(props.remoteName)
  if (localWhereStr.value) body.whereStr = localWhereStr.value
  const r = await loadData(body)
  if (Array.isArray(r)) return { rows: r, total: r.length }
  if (Array.isArray((r as any)?.rows)) return { rows: (r as any).rows, total: (r as any).total ?? (r as any).rows.length, keys: (r as any).keys }
  return { rows: [], total: 0 }
}

async function doSearch() {
  try{

  loading.value = true
  try {
    const body: any = {
      validateXss: props.validateXss,
      autoQueryColumn: props.autoQueryColumn,
      whereItems: buildWhereItems()
    }
    if (sort.field) body.sort = JSON.stringify(sort)

    const { rows: data, total } = await fetchByLoadData(body)
    rows.value = data
    totalRows.value = typeof total === 'number' ? total : data.length
    currentPage.value = 1
  } catch (err) {
    console.error('refval doSearch error:', err)
    rows.value = []
    totalRows.value = 0
  } finally {
    loading.value = false
  }
  }catch(e){
    console.error('doSearch error:', e);
    try{ window?.alert?.(lm.value.error || '載入資料失敗'); }catch{}
    if (typeof showModal !== 'undefined' && showModal) { try{ showModal = false }catch{} }
  }
}

async function getDisplayRow(value: string | number | null) {
  try{

  if (value == null || value === '') return null
  const body: any = {
    validateXss: props.validateXss,
    autoQueryColumn: props.autoQueryColumn,
    whereItems: buildWhereItems([
      { field: props.valueField, operator: '=', value, isWhereItem: true }
    ])
  }
  const { rows: data } = await fetchByLoadData(body)
  return data?.[0] ?? null
  }catch(e){
    console.error('getDisplayRow error:', e);
    try{ window?.alert?.(lm.value.error || '載入資料失敗'); }catch{}
    if (typeof showModal !== 'undefined' && showModal) { try{ showModal = false }catch{} }
  }
}


function getValue() {
  return props.modelValue ?? null
}
async function setValue(value: any) {
  tempInputValue.value = value == null ? '' : String(value)
  tempSavedValue.value = tempInputValue.value

  if (value !== '' && value != null) {
    const row = await getDisplayRow(value)
    const txt = row ? row[props.textField] : ''
    textValue.value = txt || ''

    emit('update:modelValue', value)
  } else {
    textValue.value = ''
    emit('update:modelValue', null)
  }
}
function setWhere(where: any) {
  if (Array.isArray(where)) {
    localWhereItems.value = where
    localWhereStr.value = null
  } else if (typeof where === 'string') {
    localWhereStr.value = where
    localWhereItems.value = null
  }
}
function setReadonly(value: boolean) {
  forceReadonly.value = !!value
}


defineExpose({
  getValue,
  setValue,
  setWhere,
  readonly: setReadonly,
  options: () => optionsObj.value,
  openPicker
})

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}

function onSearch() { doSearch() }

watch(() => props.modelValue, async (nv) => {
  if (props.text != null) return
  tempInputValue.value = nv == null ? '' : String(nv)
  tempSavedValue.value = tempInputValue.value
  if (nv == null || nv === '') {
    textValue.value = ''
    return
  }
  const row = await getDisplayRow(nv)
  textValue.value = row ? String(row[props.textField] ?? '') : ''
})
</script>

<style scoped>
.refval .modal { background: rgba(0,0,0,.15); }
.refval .modal .table thead th.sticky-top { top: 0; z-index: 5; }
.refval.is-readonly .btn, .refval.is-readonly input { cursor: not-allowed; }

.refval-dialog {
  max-width: 640px; 
}

.refval-btn {
  padding-top: 0;    
  padding-bottom: 0;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  display: flex;         
  align-items: center;    
  justify-content: center; 
  box-sizing: border-box;
}

.refval-group {
  flex-wrap: nowrap;
  width: 100%;
  min-width: 0;
}

.refval-group .form-control {
  min-width: 0;
}

</style>
