<template>
  <div class="pvt-wrapper" :style="wrapperStyle">
    <table class="pvtUi" cellpadding="0" cellspacing="0">
      <tbody>
      <tr>
        <td class="pvt-control-area pvt-border-right pvt-border-bottom" style="width: 120px;">
          <select class="pvt-input w-100" v-model="ui.renderer">
            <option v-for="r in availableRenderers" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </td>
        <td class="pvt-control-area pvt-border-bottom drop-zone" @dragover.prevent @drop="onDrop('unused')">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="pvt-tag-container">
              <span v-if="unusedFields.length === 0" class="pvt-placeholder">拖曳至此以移除</span>
              <div v-for="field in unusedFields" :key="'unused-'+field" 
                   class="pvt-tag" draggable="true" @dragstart="onDragStart($event, field, 'unused')">
                {{ getFieldTitle(field) }}
              </div>
            </div>
            <button class="pvt-input pvt-btn" style="margin-left: 4px;" @click="exportExcel">匯出</button>
          </div>
        </td>
      </tr>

      <tr>
        <td class="pvt-control-area pvt-border-right pvt-border-bottom">
          <select class="pvt-input w-100" style="margin-bottom: 2px;" v-model="ui.aggregator">
            <option v-for="a in availableAggregators" :key="a.value" :value="a.value">{{ a.label }}</option>
          </select>
          <select class="pvt-input w-100" v-model="ui.valueField" :disabled="[1,2,11,12,13].includes(ui.aggregator)">
            <option v-for="c in showColumns" :key="'val-'+c.field" :value="c.field">{{ c.title }}</option>
          </select>
        </td>
        <td class="pvt-control-area pvt-border-bottom drop-zone" @dragover.prevent @drop="onDrop('cols')">
          <div class="pvt-tag-container">
             <span v-if="ui.colFields.length === 0" class="pvt-placeholder">拖曳至此 (Columns)</span>
             <div v-for="field in ui.colFields" :key="'col-'+field" 
                  class="pvt-tag" draggable="true" @dragstart="onDragStart($event, field, 'cols')">
                {{ getFieldTitle(field) }}
             </div>
          </div>
        </td>
      </tr>

      <tr>
        <td class="pvt-control-area pvt-border-right drop-zone" style="vertical-align: top;" 
            @dragover.prevent @drop="onDrop('rows')">
          <div class="pvt-tag-container-vertical">
             <span v-if="ui.rowFields.length === 0" class="pvt-placeholder">拖曳至此 (Rows)</span>
             <div v-for="field in ui.rowFields" :key="'row-'+field" 
                  class="pvt-tag pvt-tag-block" draggable="true" @dragstart="onDragStart($event, field, 'rows')">
                {{ getFieldTitle(field) }}
             </div>
          </div>
        </td>
        <td style="vertical-align: top; background: #fff;">
          <div class="pvt-table-container">
            
            <table v-if="(pivot.rowKeys.length > 0 || pivot.colKeys.length > 0) && ui.renderer <= 4" 
                   class="pvtTable" id="pvtTableExport">
              <thead>
                <tr>
                  <th v-if="ui.rowFields.length > 0" class="pvtAxisLabel"></th>
                  <th v-for="(c, ci) in pivot.colKeys" :key="ci" class="pvtColLabel">
                    {{ c.length ? c.join(' / ') : 'Totals' }}
                  </th>
                  <th class="pvtTotalLabel">Totals</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, ri) in pivot.rowKeys" :key="ri">
                  <th v-if="ui.rowFields.length > 0" class="pvtRowLabel">
                    {{ r.join(' / ') }}
                  </th>
                  <td v-for="(_, ci) in pivot.colKeys" :key="ci" class="pvtVal text-end position-relative"
                      :style="getCellStyle(pivot.matrix[ri][ci]?.value, ri, ci)">
                    <div v-if="ui.renderer === 1 && pivot.matrix[ri][ci]?.value > 0" 
                         class="pvt-barchart-bg" :style="{ width: getBarchartWidth(pivot.matrix[ri][ci]?.value) }"></div>
                    <span class="pvt-val-text">{{ pivot.matrix[ri][ci] !== null ? pivot.matrix[ri][ci].formatted : '' }}</span>
                  </td>
                  <td class="pvtTotal rowTotal text-end">
                    {{ (pivot.rowTotals[ri]?.formatted) || '' }}
                  </td>
                </tr>
                <tr>
                  <th v-if="ui.rowFields.length > 0" class="pvtTotalLabel">Totals</th>
                  <td v-for="(v, ci) in pivot.colTotals" :key="ci" class="pvtTotal colTotal text-end">
                    {{ v?.formatted || '' }}
                  </td>
                  <td class="pvtGrandTotal text-end">
                    {{ pivot.grandTotal?.formatted || '' }}
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-else-if="(pivot.rowKeys.length > 0 || pivot.colKeys.length > 0) && ui.renderer >= 5" 
                 style="width: 100%; height: 400px; padding: 10px;">
              <div ref="chartRef" style="width: 100%; height: 100%;"></div>
            </div>

            <div v-else class="pvt-placeholder" style="padding: 4px;">
              {{ loading ? '載入中…' : '沒有符合的資料' }}
              <div v-if="error" style="color: red;">{{ error }}</div>
            </div>

          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, shallowRef, onBeforeUnmount } from 'vue'
import dataUtils from '@/utils/dataApi'; 

import * as echarts from 'echarts/core'
import { BarChart, LineChart, ScatterChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent, TransformComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart, LineChart, ScatterChart, PieChart,
  TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent, TransformComponent,
  CanvasRenderer
])

const props = defineProps({
  root: Object,
  remoteName: String,
  columns: Array,
  rows: Array,
  showColumns: Array,
  defaultColumn: String,
  aggregators: String,
  renderers: String,
  panelHeight: Number, 
  digitsAfterDecimal: { type: Number, default: 2 },
})

const fullAggregators = "總和;計數;計數唯一值;單值;數字總和;平均;最小;最大;過和總和;80%上限;80%下限;個數對於總數的分數;個數對於行數的分數;個數對於列數的分數;總和對於總數的分數;總和對於行數的分數;總和對於列數的分數".split(';')
const fullRenderers = "表格;柱狀表格;熱力圖;橫軸熱力圖;豎軸熱力圖;折線圖;柱狀圖;堆疊圖;區域圖;離散圖;圓餅圖;環狀圖".split(';')

const availableAggregators = computed(() => {
  const keys = props.aggregators ? props.aggregators.split(';') : ['0']
  return keys.map(k => ({ value: Number(k), label: fullAggregators[Number(k)] || k }))
})

const availableRenderers = computed(() => {
  const keys = props.renderers ? props.renderers.split(';') : ['0']
  return keys.map(k => ({ value: Number(k), label: fullRenderers[Number(k)] || k }))
})

const rawData = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const ui = ref({
  renderer: props.renderers ? Number(props.renderers.split(';')[0]) : 0,
  aggregator: props.aggregators ? Number(props.aggregators.split(';')[0]) : 0,
  valueField: props.defaultColumn || (props.showColumns?.[0] as any)?.field || '',
  rowFields: (props.rows || []).map((r: any) => r.field),
  colFields: (props.columns || []).map((c: any) => c.field),
})

const unusedFields = computed(() => {
  const used = new Set([...ui.value.rowFields, ...ui.value.colFields])
  return (props.showColumns || [])
    .filter((c: any) => !used.has(c.field))
    .map((c: any) => c.field)
})

function getFieldTitle(fieldId: string) {
  const col = (props.showColumns || []).find((c: any) => c.field === fieldId)
  return col ? (col as any).title : fieldId
}

const dragState = ref({ field: '', source: '' })

function onDragStart(event: DragEvent, field: string, source: string) {
  dragState.value = { field, source }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', field) 
  }
}

function onDrop(targetZone: string) {
  const { field, source } = dragState.value
  if (!field || source === targetZone) return
  if (source === 'rows') ui.value.rowFields = ui.value.rowFields.filter(f => f !== field)
  else if (source === 'cols') ui.value.colFields = ui.value.colFields.filter(f => f !== field)
  if (targetZone === 'rows') ui.value.rowFields.push(field)
  else if (targetZone === 'cols') ui.value.colFields.push(field)
  dragState.value = { field: '', source: '' }
}

const pivot = computed(() => {
  if (rawData.value.length === 0) return { rowKeys: [], colKeys: [], matrix: [], rowTotals: [], colTotals: [], grandTotal: null, globalMax: 0, rowMax: [], colMax: [] }

  const cellRecords = new Map<string, any[]>()
  const rowRecords = new Map<string, any[]>()
  const colRecords = new Map<string, any[]>()
  const rowMap = new Map<string, string[]>()
  const colMap = new Map<string, string[]>()

  for (const r of rawData.value) {
    const rk = ui.value.rowFields.map(f => String(r[f] ?? ''))
    const ck = ui.value.colFields.map(f => String(r[f] ?? ''))
    const rKey = JSON.stringify(rk); const cKey = JSON.stringify(ck)
    const key = `R:${rKey}|C:${cKey}`

    if (!cellRecords.has(key)) cellRecords.set(key, [])
    if (!rowRecords.has(rKey)) rowRecords.set(rKey, [])
    if (!colRecords.has(cKey)) colRecords.set(cKey, [])

    cellRecords.get(key)!.push(r); rowRecords.get(rKey)!.push(r); colRecords.get(cKey)!.push(r)
    rowMap.set(rKey, rk); colMap.set(cKey, ck)
  }

  const rowKeys = [...rowMap.values()]; const colKeys = [...colMap.values()]
  const valField = ui.value.valueField; const aggMode = ui.value.aggregator

  const doAgg = (records: any[], refRecs: any[] = records) => {
    if (!records || records.length === 0) return { value: null, formatted: '' }
    let vals = records.map(r => parseFloat(r[valField])).filter(n => !isNaN(n))
    let rawStr = records.map(r => String(r[valField] || ''))
    let sum = vals.reduce((a, b) => a + b, 0); let count = records.length
    
    let val: number | string | null = 0; let isPct = false; let isStr = false
    switch(aggMode) {
      case 0: case 8: val = sum; break;
      case 1: val = count; break;
      case 2: val = new Set(rawStr).size; break;
      case 3: val = Array.from(new Set(rawStr)).join(', '); isStr = true; break;
      case 4: val = Math.round(sum); break;
      case 5: val = count ? sum / count : null; break;
      case 6: val = vals.length ? Math.min(...vals) : null; break;
      case 7: val = vals.length ? Math.max(...vals) : null; break;
      case 9: case 10: val = sum * 0.8; break;
      case 11: val = count / rawData.value.length; isPct = true; break;
      case 12: case 13: val = count / refRecs.length; isPct = true; break;
      case 14: val = sum / rawData.value.reduce((a, b) => a + (parseFloat(b[valField])||0), 0); isPct = true; break;
      case 15: case 16: val = sum / refRecs.reduce((a, b) => a + (parseFloat(b[valField])||0), 0); isPct = true; break;
    }

    let formatted = ''
    if (val === null || (typeof val === 'number' && isNaN(val))) formatted = ''
    else if (isStr) formatted = val as string
    else if (isPct) formatted = ((val as number) * 100).toFixed(1) + '%'
    else if ([1, 2, 4].includes(aggMode)) formatted = Math.round(val as number).toString()
    else formatted = (val as number).toFixed(props.digitsAfterDecimal)

    return { value: isStr ? null : val, formatted }
  }

  let globalMax = 0; const rowMax = new Array(rowKeys.length).fill(0); const colMax = new Array(colKeys.length).fill(0)
  const matrix = rowKeys.map((r, ri) => colKeys.map((c, ci) => {
    const key = `R:${JSON.stringify(r)}|C:${JSON.stringify(c)}`
    let ref = cellRecords.get(key) || []
    if (aggMode === 12 || aggMode === 15) ref = rowRecords.get(JSON.stringify(r))!
    if (aggMode === 13 || aggMode === 16) ref = colRecords.get(JSON.stringify(c))!
    const res = doAgg(cellRecords.get(key) || [], ref)
    if (res.value && res.value > 0) {
      if (res.value > globalMax) globalMax = res.value
      if (res.value > rowMax[ri]) rowMax[ri] = res.value
      if (res.value > colMax[ci]) colMax[ci] = res.value
    }
    return res
  }))

  return {
    rowKeys, colKeys, matrix, globalMax, rowMax, colMax,
    rowTotals: rowKeys.map(r => doAgg(rowRecords.get(JSON.stringify(r)) || [], rawData.value)),
    colTotals: colKeys.map(c => doAgg(colRecords.get(JSON.stringify(c)) || [], rawData.value)),
    grandTotal: doAgg(rawData.value, rawData.value)
  }
})

// === 熱力圖/柱狀圖 ===
function getCellStyle(val: number | null, ri: number, ci: number) {
  const mode = ui.value.renderer
  if (val === null || val <= 0 || mode < 2 || mode > 4) return {}
  let max = mode === 2 ? pivot.value.globalMax : (mode === 3 ? pivot.value.rowMax[ri] : pivot.value.colMax[ci])
  if (max === 0) return {}
  return { backgroundColor: `rgba(220, 53, 69, ${(val / max) * 0.6})` }
}
function getBarchartWidth(val: number) {
  return (val > 0 && pivot.value.globalMax) ? `${(val / pivot.value.globalMax) * 100}%` : '0%'
}

const chartRef = ref<HTMLElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)

watch([() => ui.value.renderer, () => pivot.value], () => {
  if (ui.value.renderer >= 5) {
    nextTick(() => renderEChart())
  } else if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
}, { deep: true })

onBeforeUnmount(() => {
  if (chartInstance.value) chartInstance.value.dispose()
})

function renderEChart() {
  if (!chartRef.value) return
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
  
  const p = pivot.value
  const mode = ui.value.renderer
  const isPie = mode === 10 || mode === 11

  let type = 'bar'
  if (mode === 5 || mode === 8) type = 'line'
  else if (mode === 9) type = 'scatter'
  else if (mode === 10 || mode === 11) type = 'pie'

  const labels = isPie ? p.rowKeys.map(r => r.join('-') || 'Total') : (p.colKeys.length ? p.colKeys.map(c => c.join('-')) : ['Total'])
  let series: any[] = []

  if (isPie) {
    series = [{
      type: 'pie',
      radius: mode === 11 ? ['40%', '70%'] : '70%', // 11環狀圖
      data: p.rowTotals.map((rt, i) => ({ value: rt.value || 0, name: labels[i] }))
    }]
  } else {
    series = p.rowKeys.map((r, ri) => ({
      name: r.length ? r.join('-') : 'Total',
      type: type,
      stack: (mode === 7 || mode === 8) ? 'Total' : undefined, // 7:堆疊柱, 8:區域
      areaStyle: mode === 8 ? {} : undefined, // 8:區域圖
      data: p.colKeys.length ? p.matrix[ri].map(c => c?.value || 0) : [p.rowTotals[ri]?.value || 0]
    }))
  }

  const option = {
    tooltip: { trigger: isPie ? 'item' : 'axis' },
    legend: { type: 'scroll', bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: isPie ? undefined : { type: 'category', data: labels },
    yAxis: isPie ? undefined : { type: 'value' },
    series: series
  }

  chartInstance.value.setOption(option, true)
}

const wrapperStyle = computed(() => {
  if (pivot.value.rowKeys.length > 10) {
    return { maxHeight: '500px', overflowY: 'auto' as const, overflowX: 'auto' as const }
  }
  return { overflowX: 'auto' as const }
})

async function loadData () {
  if (!props.remoteName) return
  const module = props.remoteName.includes('.') ? props.remoteName.split('.')[0] : ''
  const command = props.remoteName.includes('.') ? props.remoteName.split('.')[1] : ''
  if (!module || !command) return

  loading.value = true; error.value = ''
   try {
    const rn = `${module}.${command}`; 
    const { loadData: apiLoadData } = dataUtils(rn);

    let param = { 
      total: false 
    };

    const currentWhereStr = props.root?.whereStr ?? '';
    if (currentWhereStr) {
      param.whereStr = currentWhereStr;
    }

    const currentWhereItems = props.root?.whereItems ?? null;
    if (currentWhereItems && (!Array.isArray(currentWhereItems) || currentWhereItems.length > 0)) {
      param.whereItems = currentWhereItems;
    }
    const data = await apiLoadData(param);

    rawData.value = Array.isArray(data) ? data 
                  : (Array.isArray(data?.datas) ? data.datas 
                  : (Array.isArray(data?.data) ? data.data 
                  : (Array.isArray(data?.rows) ? data.rows : [])));

  } catch (e: any) { error.value = e?.message || String(e); rawData.value = []
  } finally { loading.value = false }
}

function exportExcel() {
  const table = document.getElementById('pvtTableExport')
  if (!table) return alert('請切換為表格模式後再匯出')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style> table, th, td { border: 1px solid black; border-collapse: collapse; font-size: 12px; } </style></head><body>${table.outerHTML}</body></html>`
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url
  a.download = (props.remoteName ? props.remoteName.split('.')[1] : 'export') + '.xls'
  a.click(); URL.revokeObjectURL(url)
}

onMounted(loadData); watch(() => props.remoteName, loadData)
</script>

<style scoped>
.pvt-wrapper {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.pvtUi {
  width: 100%;
  table-layout: auto;
  border-collapse: collapse;
}

.pvt-control-area {
  background-color: #f5f5f5;
  padding: 4px; 
}
.pvt-border-right { border-right: 1px solid #ccc; }
.pvt-border-bottom { border-bottom: 1px solid #ccc; }

.pvt-input {
  box-sizing: border-box;
  height: 22px;
  font-size: 12px;
  padding: 0 4px;
  border: 1px solid #b3b3b3;
  border-radius: 2px;
  background: #fff;
}
.pvt-btn {
  cursor: pointer;
  background: #e9e9e9;
}
.pvt-btn:hover { background: #dcdcdc; }

.w-100 { width: 100%; }
.text-end { text-align: right; }

.drop-zone {
  transition: background-color 0.1s;
}
.drop-zone:hover {
  background-color: #e5e5e5;
}

.pvt-tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  min-height: 22px;
}
.pvt-tag-container-vertical {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 22px;
}
.pvt-placeholder {
  color: #999;
  font-size: 11px;
  line-height: 22px;
  pointer-events: none;
}

.pvt-tag {
  padding: 0 5px;
  height: 22px;
  line-height: 20px;
  font-size: 12px;
  cursor: grab;
  user-select: none;
  border-radius: 2px;
  border: 1px solid #b3b3b3;
  background-color: #fff;
  display: inline-flex;
  align-items: center;
}
.pvt-tag-block {
  align-self: flex-start;
}
.pvt-tag:active { cursor: grabbing; }
.pvt-tag::after {
  content: '▼';
  font-size: 8px;
  margin-left: 4px;
  color: #888;
}

.pvt-table-container {
  width: 100%;
}

.pvtTable {
  border-collapse: collapse;
  white-space: nowrap;
}
.pvtTable th, .pvtTable td {
  border: 1px solid #ccc;
  padding: 4px 6px;
  font-size: 12px;
}
.pvtTable th.pvtColLabel, .pvtTable th.pvtRowLabel, .pvtTable th.pvtTotalLabel, .pvtTable th.pvtAxisLabel {
  background-color: #f5f5f5;
  font-weight: bold;
}
.pvtVal:hover {
  background-color: #eef;
  cursor: pointer;
}
.pvtTotal, .pvtGrandTotal {
  font-weight: bold;
  background-color: #f5f5f5;
}

.position-relative { position: relative; z-index: 1; }
.pvt-barchart-bg { position: absolute; left: 0; top: 0; bottom: 0; background-color: #b3cde3; z-index: -1; transition: width 0.3s ease; }
.pvt-val-text { position: relative; z-index: 2; }
</style>