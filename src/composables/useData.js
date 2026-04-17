import { ref, computed, nextTick } from 'vue'
import axios from 'axios'

export function useData(pageTitle, pageSize = 10, fromGrid = {}) {
  // ====== datagrid ======
  const allRows = ref([])
  const columns = ref([])
  const queryColumns = ref([])
  const datagridOptions = ref({})

  // ====== dataform ======
  const formColumns = ref([])
  const formQueryColumns = ref([])
  const dataformOptions = ref({})

  // ====== dataform 內 tabs / datapanel ======
  const dataformTabs = ref([])
  const datapanelById = ref({})
  const allDataPanelsInForm = computed(() => dataformTabs.value.flatMap(t => t.panels))
  const allDataGridsInForm  = computed(() => dataformTabs.value.flatMap(t => t.grids))

  // ====== 分頁 / 排序 ======
  const currentPage = ref(1)
  const sortField = ref('')
  const sortAsc = ref(true)

  const filteredRows = computed(() => allRows.value)

  const totalPages = computed(() => {
    const len = filteredRows.value.length
    return Math.max(1, Math.ceil(len / pageSize))
  })

  const pagedRows = computed(() => {
    let data = [...filteredRows.value]
    if (sortField.value) {
      data.sort((a, b) => {
        if (a[sortField.value] < b[sortField.value]) return sortAsc.value ? -1 : 1
        if (a[sortField.value] > b[sortField.value]) return sortAsc.value ? 1 : -1
        return 0
      })
    }
    const start = (currentPage.value - 1) * pageSize
    return data.slice(start, start + pageSize)
  })

  function sort(field) {
    if (sortField.value === field) {
      sortAsc.value = !sortAsc.value
    } else {
      sortField.value = field
      sortAsc.value = true
    }
  }
  function setPage(page) {
    currentPage.value = page
  }

  // === 掃所有 bootstrap 設定檔 ===
  const pages = import.meta.glob('../bootstrap/**/*.vue', { eager: true })

  function normalizeName(name) {
    return String(name || '').trim().replace(/\.(vue|js|ts|mjs|cjs)$/i, '')
  }

  
  function tryPickConfig(mod) {
    const g = fromGrid || {}
    const hasGridInput = (Array.isArray(g.columns) && g.columns.length) ||
                         (Array.isArray(g.queryColumns) && g.queryColumns.length) ||
                         (g.options && Object.keys(g.options).length) ||
                         (Array.isArray(g.rows) && g.rows.length)
    if (hasGridInput) {
      const datagridBlock = Object.assign(
        { type: 'datagrid' },
        (g.options || {}),
        {
          columns: g.columns || [],
          queryColumns: g.queryColumns || [],
          rows: Array.isArray(g.rows) ? g.rows : undefined,
          remoteName: (g.options && g.options.remoteName) || g.remoteName || pageTitle
        }
      )
      const arr = [datagridBlock]
      if (Array.isArray(g.formColumns) || Array.isArray(g.formQueryColumns) || (g.dataformOptions && Object.keys(g.dataformOptions).length)) {
        arr.push({
          type: 'dataform',
          columns: g.formColumns || [],
          queryColumns: g.formQueryColumns || [],
          ...g.dataformOptions
        })
      }
      return arr
    }

    // 後備：維持舊行為，從對應 .vue 檔案的輸出中尋找 pageConfig/config/meta（Array）
    const cands = [
      mod?.pageConfig,
      mod?.config,
      mod?.meta,
      mod?.default?.pageConfig,
      mod?.default?.config,
      mod?.default?.meta
    ].filter(Boolean)
    const cfg = cands.find(x => Array.isArray(x))
    if (!cfg) throw new Error('目標 .vue 未輸出有效的 pageConfig/config/meta（Array），且 Datagrid 未提供 columns/options')
    return cfg
  }


  function resolveModuleByTitle(title) {
    const want = normalizeName(title)
    const exactKey = Object.keys(pages).find(k => normalizeName(k.split('/').pop()) === want)
    if (exactKey) return pages[exactKey]
    const relaxed = Object.keys(pages).find(k => {
      const base = normalizeName(k.split('/').pop())
      return base.includes(want) || want.includes(base)
    })
    if (relaxed) return pages[relaxed]
    const names = Object.keys(pages).map(k => k.split('/').pop()).join(', ')
    throw new Error(`在 ../bootstrap 找不到對應檔案：「${title}.vue」。現有：${names}`)
  }

  function parseRemoteName(remote, fallback) {
    const r = String(remote || '').trim()
    const sep = r.includes('.') ? '.' : (r.includes('．') ? '．' : null)
    if (!r || !sep) {
      return { module: fallback, command: fallback }
    }
    const parts = r.split(sep).map(s => s.trim()).filter(Boolean)
    const [first, ...rest] = parts
    return {
      module: first || fallback,
      command: (rest.length ? rest.join('.') : first) || fallback
    }
  }

  async function fetchData() {
    try {
      const mod = resolveModuleByTitle(pageTitle)
      const config = tryPickConfig(mod)

      const datagridBlock = config.find((b) => String(b?.type).toLowerCase() === 'datagrid')
      if (!datagridBlock) throw new Error('找不到 datagrid 配置')

      datagridOptions.value = { ...datagridBlock }

      columns.value = (datagridBlock.columns || []).map((col) => ({
        ...col,
        field: col.field,
        title: col.title,
        alignment: col.alignment,
        format: col.format,
        hidden: col.hidden,
        width: col.width,
        editor: col.editor || null,
        nowrap: col.nowrap,
        sortable: col.sortable,
        showxs: col.showxs,
        showsm: col.showsm,
        formatter: col.formatter,
        total: col.total,
        relation: col.relation
      }))

      queryColumns.value = (datagridBlock.queryColumns || []).map((col) => ({
        ...col,
        field: col.field,
        operator: col.operator,
        value: col.value,
      }))

      const dataformBlock = config.find((b) => String(b?.type).toLowerCase() === 'dataform') || null
      dataformTabs.value = []
      datapanelById.value = {}
      dataformOptions.value = dataformBlock ? { ...dataformBlock } : {}

      if (dataformBlock) {
        formColumns.value = (dataformBlock.columns || []).map((col) => ({
          ...col,
          field: col.field,
          title: col.title,
          span: col.span,
          hidden: col.hidden,
          newRow: col.newRow,
          editor: col.editor || null,
        }))

        formQueryColumns.value = (dataformBlock.queryColumns || []).map((col) => ({
          ...col,
          field: col.field,
          operator: col.operator,
          value: col.value,
        }))

        const tabsNode = Array.isArray(dataformBlock.childrens)
          ? dataformBlock.childrens.find((c) => String(c.type || '').toLowerCase() === 'tabs')
          : null

        if (tabsNode && Array.isArray(tabsNode.tabs)) {
          const rid = tabsNode.id || `tabs_${Math.random().toString(36).slice(2)}`
          dataformTabs.value = tabsNode.tabs.map((t, i) => {
            const id = t.id || `${rid}_${i}`
            const title = t.title ?? `Tab ${i + 1}`
            const childrens = Array.isArray(t.childrens) ? t.childrens : []
            const panels = childrens.filter((x) => String(x.type || '').toLowerCase() === 'datapanel')
            const grids  = childrens.filter((x) => String(x.type || '').toLowerCase() === 'datagrid')

            panels.forEach((p, pi) => {
              const pid = p.id || `${id}_panel_${pi}`
              p.id = pid
              datapanelById.value[pid] = p
            })

            return { id, title, index: i, panels, grids }
          })
        }
      }

      const remoteNameRaw = String(datagridOptions.value?.remoteName ?? '').trim()
      const { module, command } = parseRemoteName(remoteNameRaw, pageTitle)

      try {
        const body = new URLSearchParams()
        body.append('mode', 'getDataset')
        body.append('module', module)
        body.append('command', command)

        const opts = datagridOptions.value || {}

        body.append('rows',      String(opts.pagination ? (opts.pageSize ?? 10) : -1))
        body.append('page',      String(opts.page ?? 1))
        body.append('pageCount', String(opts.pageCount ?? 1))
        body.append('whereStr',  String(opts.whereStr ?? ''))

        body.append('whereItems',   opts.whereItems   ? JSON.stringify(opts.whereItems)   : '')
        body.append('parentTable',  opts.parentTable  ? opts.parentTable                  : '')
        body.append('parentRow',    opts.parentRow    ? JSON.stringify(opts.parentRow)    : '')
        body.append('totalColumns', opts.totalColumns ? JSON.stringify(opts.totalColumns) : '')

        body.append('sort',  String(opts.sort  ?? ''))
        body.append('order', String(opts.order ?? ''))

        const { data: result } = await axios.post('/api/ApiMain/Data', body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        })

        if (!Array.isArray(result?.rows)) throw new Error('回傳格式錯誤')
        allRows.value = result.rows
      } catch (apiErr) {
        console.warn('[useData] 載入資料失敗，改用本地 rows。', apiErr)
        if (Array.isArray(datagridOptions.value?.rows)) {
          allRows.value = [...datagridOptions.value.rows]
        } else {
          allRows.value = []
        }
      }
    } catch (err) {
      console.error(err)
    }
  }


  const formRef = ref(null)
  const isReadOnly = ref(false)
  const editingRow = ref({})


  function attachFormRef(el) {
    formRef.value = el
  }

  function openForm(row = {}, readonly = false) {
    isReadOnly.value = !!readonly
    editingRow.value = row || {}
    nextTick(() => {

      if (typeof formRef.value?.open === 'function') {
        try {
          formRef.value.open({ row: editingRow.value, readonly: isReadOnly.value })
          return
        } catch (_) {
          try { formRef.value.open() } catch (__) {}
        }
      }
      if (typeof formRef.value?.show === 'function') {
        try { formRef.value.show() } catch (_) {}
      } else if (typeof formRef.value?.openModal === 'function') {
        try { formRef.value.openModal() } catch (_) {}
      }
    })
  }

  function onEditRow(payload) {
    const row = payload?.row ?? payload
    openForm(row, false)
  }

  function onViewRow(payload) {
    const row = payload?.row ?? payload
    openForm(row, true)
  }

  // 相容舊事件：@open-edit-form="{ row, index, readonly }"
  function onOpenEditForm(payload = {}) {
    const { row = {}, readonly = false } = payload
    openForm(row, !!readonly)
  }

  fetchData()

  return {
    // datagrid
    columns,
    allRows,
    rows: allRows,
    queryColumns,
    pagedRows,
    filteredRows,
    totalPages,
    sort,
    setPage,
    currentPage,
    sortField,
    sortAsc,
    fetchData,
    datagridOptions,

    // dataform
    formColumns,
    formQueryColumns,

    // tabs / datapanel
    dataformTabs,
    datapanelById,
    allDataPanelsInForm,
    allDataGridsInForm,
    dataformOptions,

    attachFormRef,
    isReadOnly,
    editingRow,
    openForm,
    onEditRow,
    onViewRow,
    onOpenEditForm,
  }
}

export const useDataGrid = useData
