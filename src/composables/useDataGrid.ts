import { ref, computed } from 'vue'
import axios from 'axios'

export function useDataGrid(pageName: string, pageSize: number = 10) {
  const allRows = ref<any[]>([])
  const columns = ref<{ field: string; title: string }[]>([])
  const queryColumns = ref<{ field: string; operator: string; value: string }[]>([])
  const datagridOptions = ref<any>({}) 

  const formColumns = ref<{ field: string; title: string }[]>([])
  const formQueryColumns = ref<{ field: string; operator: string; value: string }[]>([])
  const dataformOptions = ref<any>({})

  const dataformTabs = ref<Array<{
    id: string
    title: string
    index: number
    panels: any[]
    grids: any[]
  }>>([])


  const datapanelById = ref<Record<string, any>>({})

  const allDataPanelsInForm = computed(() => dataformTabs.value.flatMap(t => t.panels))
  const allDataGridsInForm  = computed(() => dataformTabs.value.flatMap(t => t.grids))

  const currentPage = ref(1)
  const totalPages = computed(() => Math.ceil(allRows.value.length / pageSize))

  const sortField = ref('')
  const sortAsc = ref(true)

  const rows = computed(() => {
    let data = [...allRows.value]
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

  const fetchData = async () => {
    try {
      const { data: rawJson } = await axios.get('/api/ApiMain/PageJson', {
        params: { page: pageName }
      })
      const config = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson

      const datagridBlock = config.find((b: any) => b.type === 'datagrid')
      if (!datagridBlock) throw new Error('找不到 datagrid 配置')

      datagridOptions.value = { ...datagridBlock }

      columns.value = (datagridBlock.columns || []).map((col: any) => ({
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

      queryColumns.value = (datagridBlock.queryColumns || []).map((col: any) => ({
        ...col,
        field: col.field,
        operator: col.operator,
        value: col.value,
      }))

      const dataformBlock = config.find((b: any) => b?.type === 'dataform') || null

      if (dataformBlock) {
        dataformOptions.value = { ...dataformBlock }

        formColumns.value = (dataformBlock.columns || []).map((col: any) => ({
          ...col,
          field: col.field,
          title: col.title,
          span: col.span,
          hidden: col.hidden,
          newRow: col.newRow,
          editor: col.editor || null,
        }))

        formQueryColumns.value = (dataformBlock.queryColumns || []).map((col: any) => ({
          ...col,
          field: col.field,
          operator: col.operator,
          value: col.value,
        }))


        const tabsNode = Array.isArray(dataformBlock.childrens)
          ? dataformBlock.childrens.find((c: any) => String(c.type || '').toLowerCase() === 'tabs')
          : null

        dataformTabs.value = []
        datapanelById.value = {}

        if (tabsNode && Array.isArray(tabsNode.tabs)) {
          const rid = tabsNode.id || `tabs_${Math.random().toString(36).slice(2)}`
          dataformTabs.value = tabsNode.tabs.map((t: any, i: number) => {
            const id = t.id || `${rid}_${i}`
            const title = t.title ?? `Tab ${i + 1}`
            const childrens = Array.isArray(t.childrens) ? t.childrens : []

            const panels = childrens.filter((x: any) => String(x.type || '').toLowerCase() === 'datapanel')
            const grids  = childrens.filter((x: any) => String(x.type || '').toLowerCase() === 'datagrid')


            panels.forEach((p: any, pi: number) => {
              const pid = p.id || `${id}_panel_${pi}`
              p.id = pid
              datapanelById.value[pid] = p
            })

            return { id, title, index: i, panels, grids }
          })
        }
      }

      const remoteNameRaw = String(datagridOptions?.remoteName ?? '').trim()

      function parseRemoteName(remote: string, fallback: string) {
        const sep = remote.includes('.') ? '.' : (remote.includes('．') ? '．' : null)
        if (!remote || !sep) {
          return { module: fallback, command: fallback }
        }
        const parts = remote.split(sep).map(s => s.trim()).filter(Boolean)
        const [first, ...rest] = parts
        return {
          module: first || fallback,
          command: (rest.length ? rest.join('.') : first) || fallback
        }
      }

      const { module, command } = parseRemoteName(remoteNameRaw, pageName)

      const body = new URLSearchParams();
      body.append('mode', 'getDataset');
      body.append('module', module);
      body.append('command', command);

      const { data: result } = await axios.post('/api/ApiMain/Data', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
      });
      
      if (!Array.isArray(result.rows)) throw new Error('回傳格式錯誤')

      allRows.value = result.rows
    } catch (err) {
      console.error('資料載入錯誤:', err)
    }
  }

  const sort = (field: string) => {
    if (sortField.value === field) {
      sortAsc.value = !sortAsc.value
    } else {
      sortField.value = field
      sortAsc.value = true
    }
  }

  const setPage = (page: number) => {
    currentPage.value = page
  }

  fetchData()

  return {
    // ====== datagrid ======
    columns,
    rows,
    sort,
    setPage,
    currentPage,
    totalPages,
    sortField,
    sortAsc,
    fetchData,
    queryColumns,
    datagridOptions,

    // ====== dataform ======
    formColumns,
    formQueryColumns,

    // ====== tabs / datapanel======
    dataformTabs,           
    datapanelById,         
    allDataPanelsInForm,   
    allDataGridsInForm,     
    dataformOptions  
  }
}
