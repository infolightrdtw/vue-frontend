<template>
  <div class="input-group bootstrap-dateselect">
    <template v-for="(part, idx) in uiParts" :key="idx">
      <span
        v-if="part.type === 'text' && part.text"
        class="input-group-addon input-group-text"
        style="padding:6px"
        v-text="part.text"
      />
      <select
        v-else-if="part.type === 'year'"
        class="form-control form-select dateselectyear"
        style="padding:0;"
        :disabled="readonly"
        v-model="yearSel"
        @change="onAnyChange"
      >
        <option value=""></option>
        <option v-for="y in yearItems" :key="y" :value="String(y)">{{ y }}</option>
      </select>
      <select
        v-else-if="part.type === 'month'"
        class="form-control form-select dateselectmonth"
        style="padding:0;"
        :disabled="readonly"
        v-model="monthSel"
        @change="onMonthChange"
      >
        <option value=""></option>
        <option v-for="m in monthItems" :key="m" :value="String(m)">{{ m }}</option>
      </select>
      <select
        v-else-if="part.type === 'day'"
        class="form-control form-select dateselectday"
        style="padding:0;"
        :disabled="readonly"
        v-model="daySel"
        @change="onAnyChange"
      >
        <option value=""></option>
        <option v-for="d in dayItems" :key="d" :value="String(d)">{{ d }}</option>
      </select>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'


const props = defineProps({
  modelValue: { type: String, default: '' },
  format: { type: String, default: 'YYYY年MM月DD日' },
  yearRangeFrom: { type: Number, default: -50 },
  yearRangeTo:   { type: Number, default: 10 },
  year:  { type: [Number, String], default: '' }, // 初始年（直接顯示用，無轉換）
  month: { type: [Number, String], default: '' },
  day:   { type: [Number, String], default: '' },
  readonly: { type: Boolean, default: false },
  autoToday: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue','change'])


const state = reactive({ parts: [] })
const yearSel  = ref('') 
const monthSel = ref('')
const daySel   = ref('')

const yearItems  = ref([])
const monthItems = ref([])
const dayItems   = ref([])

const today = new Date()
const toInt = (v, d=0) => { const n = parseInt(String(v ?? ''), 10); return Number.isFinite(n) ? n : d }

const needYear  = computed(() => /(YYY|YYYY)/.test(props.format || ''))
const needMonth = computed(() => /M{2}/i.test(props.format || ''))
const needDay   = computed(() => /D{2}/i.test(props.format || ''))
const isComplete = computed(() => {
  const yOk = !needYear.value  || yearSel.value  !== ''
  const mOk = !needMonth.value || monthSel.value !== ''
  const dOk = !needDay.value   || daySel.value   !== ''
  return yOk && mOk && dOk
})

function normalizeFormat(fmt) {
  const raw = (fmt || '').trim()
  const normalized = raw
    .replace(/YYYY/g,'yyyy')
    .replace(/YYY/g,'yyyy')
    .replace(/MM/g,'mm')
    .replace(/DD/g,'dd')
  return normalized
}
function buildParts(normalizedFmt) {
  const fmt = normalizedFmt
  const markerFmt = fmt.replace(/yyyy|mm|dd/g, '#Y#')
  const parts = []
  const firstText = markerFmt.slice(0, markerFmt.indexOf('#Y#'))
  if (firstText) parts.push({ type:'text', text:firstText })

  const positions = []
  const idxYear = fmt.indexOf('yyyy')
  const idxMonth = fmt.indexOf('mm')
  const idxDay = fmt.indexOf('dd')
  if (idxYear  >= 0) positions.push({ token:'year',  idx:idxYear })
  if (idxMonth >= 0) positions.push({ token:'month', idx:idxMonth })
  if (idxDay   >= 0) positions.push({ token:'day',   idx:idxDay })
  positions.sort((a,b)=>a.idx-b.idx)
  const seq = positions.map(p=>p.token)

  const segs = markerFmt.slice(markerFmt.indexOf('#Y#')).split('#Y#')
  for (let i=0;i<seq.length;i++){
    parts.push({ type:seq[i] })
    const txt = segs[i+1] ?? ''
    if (txt) parts.push({ type:'text', text:txt })
  }
  if (!positions.length) return [{ type:'text', text: props.format }]
  return parts
}


function buildYearItems(){
  // 不做西元/民國換算：直接以 props.year 或今天為參考
  const baseY = props.year ? toInt(props.year, today.getFullYear()) : today.getFullYear()
  const start = Math.max(0, baseY + props.yearRangeFrom)
  const end   = baseY + props.yearRangeTo
  const list = []
  for (let y=start; y<=end; y++) list.push(String(y))
  return list
}
function buildMonthItems(){ const list=[]; for(let m=1;m<=12;m++) list.push(String(m)); return list }
function daysInMonth(yyyy, mm){
  const y = toInt(yyyy, today.getFullYear())
  const m = toInt(mm, 1)
  return new Date(y, m, 0).getDate()
}
function buildDayItems(count){ const list=[]; for(let d=1; d<= (count||31); d++) list.push(String(d)); return list }


const uiParts = computed(()=> state.parts)

const composedValue = computed(()=>{
  const fmt = props.format || 'YYYY年MM月DD日'
  let yy = yearSel.value || ''
  let mm = monthSel.value || ''
  let dd = daySel.value || ''

  if (mm) mm = mm.length===1 ? ('0'+mm) : mm
  if (dd) dd = dd.length===1 ? ('0'+dd) : dd

  return fmt
    .replace(/YYYY|YYY|yyyy|yyy/g, yy)
    .replace(/MM|mm/g, mm)
    .replace(/DD|dd/g, dd)
})

function refreshDayItems(){
  const fmt = props.format
  const hasY = /Y{3,4}/i.test(fmt), hasM = /M{2}/i.test(fmt), hasD = /D{2}/i.test(fmt)
  if (!hasD) return

  if (hasM && hasY){
    const y = yearSel.value 
    const m = monthSel.value
    dayItems.value = buildDayItems(daysInMonth(y, m))
  } else if (hasM && !hasY){
    const m = monthSel.value
    let count = 31
    if (m==='2') count = 29
    else if (['4','6','9','11'].includes(m)) count = 30
    dayItems.value = buildDayItems(count)
  } else {
    dayItems.value = buildDayItems(31)
  }
  if (daySel.value && toInt(daySel.value) > dayItems.value.length) daySel.value = ''
}
function onMonthChange(){ refreshDayItems(); onAnyChange() }
function onAnyChange(){
  const v = composedValue.value
  emit('update:modelValue', v)
  emit('change', v)
}

/* --- 初始化 --- */
function loadDefaults(){
  yearItems.value  = buildYearItems()
  monthItems.value = buildMonthItems()

  const fmt = props.format
  const hasY = /Y{3,4}/i.test(fmt), hasM=/M{2}/i.test(fmt), hasD=/D{2}/i.test(fmt)

  if (hasY){
    const baseY = props.year ? String(props.year) : String(today.getFullYear())
    yearSel.value = baseY
  }
  if (hasM) monthSel.value = String(props.month || (today.getMonth()+1))
  refreshDayItems()
  if (hasD) daySel.value = String(props.day || today.getDate())
}

function setFromModel(val) {
  const raw = String(val || '').trim()
  const fmt = (props.format || '').trim()

  const pattern = fmt
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/YYYY|YYY|yyyy|yyy/gi,  '(?<Y>\\d{2,4})')
    .replace(/MM|mm/gi,   '(?<M>\\d{1,2})')
    .replace(/DD|dd/gi,   '(?<D>\\d{1,2})')

  const m = new RegExp('^' + pattern + '$').exec(raw)
  if (!m || !m.groups) return

  let yy = m.groups.Y || ''
  let mm = m.groups.M || ''
  let dd = m.groups.D || ''

  mm = mm ? String(parseInt(mm,10)) : ''
  dd = dd ? String(parseInt(dd,10)) : ''

  if (yy !== '') yearSel.value  = yy
  if (mm !== '') monthSel.value = mm
  refreshDayItems()
  if (dd !== '') daySel.value   = dd

  onAnyChange()
}

onMounted(()=>{
  const normalized = normalizeFormat(props.format)
  state.parts = buildParts(normalized)

  if ((props.modelValue||'').trim()){
    loadDefaults()
    setFromModel(props.modelValue)
  } else {
    loadDefaults()
    if (props.autoToday) onAnyChange()
  }
})

watch(()=>props.modelValue, (nv)=>{
  if (typeof nv === 'string') {
    const now = String(nv || '').trim()
    if (now !== String(composedValue.value || '').trim()) {
      setFromModel(now)
    }
  }
})
</script>

<style scoped>
.input-group-text { padding: 6px; }
</style>
