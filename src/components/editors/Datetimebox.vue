<template>
  <div class="dtb-wrap" ref="wrap">
    <Datebox
      ref="inner"
      :model-value="displayValue"
      :format="dateOnlyFormat"
      :min-view="resolvedMinView"
      :prompt="prompt"
      :readonly="readonly || selectOnly"
      :picker-position="pickerPosition"
      :data-type="dataType || 'date'"
      @update:model-value="onDatePicked"
      @change="onDatePicked"
    />

    <div v-if="useTime && showTimePanel" class="time-panel" :style="panelStyle">
      <div class="time-panel-header">
        <button class="nav" @click="shiftDay(-1)">‹</button>
        <span>{{ headerText }}</span>
        <button class="nav" @click="shiftDay(1)">›</button>
      </div>

      <div class="hours-grid">
        <button
          v-for="h in 24"
          :key="h"
          class="cell"
          :class="{ active: h-1 === hour }"
          @click="pickHour(h-1)"
        >
          {{ (h-1) }}:00
        </button>
      </div>

      <div class="minutes" v-if="showMinutePicker">
        <span class="label">分鐘</span>
        <select class="form-control" v-model="minute">
          <option v-for="m in minuteOptions" :key="m" :value="m">{{ two(m) }}</option>
        </select>
      </div>

      <div class="actions">
        <button class="btn btn-primary" @click="confirmTime">確定</button>
        <button class="btn" @click="cancelTime">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import Datebox from './Datebox.vue'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  format?: string   
  timeFormat?: string     
  minView?: 'day' | 'month' | 'year' | string
  dataType?: 'date' | 'time' | 'datetime' | string
  selectOnly?: boolean
  pickerPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | string
  prompt?: string
  readonly?: boolean
  useTime?: boolean
  minuteStep?: number
  showMinutePicker?: boolean
}>(), {
  modelValue: '',
  format: 'yyyy-mm-dd',
  timeFormat: 'HH:ii',
  minView: 'day',
  selectOnly: false,
  readonly: false,
  useTime: true,
  minuteStep: 5,
  showMinutePicker: false
})

const emit = defineEmits<{
  (e:'update:modelValue', v:string): void
  (e:'change', v:string): void
}>()

const inner = ref<InstanceType<typeof Datebox> | null>(null)
const wrap  = ref<HTMLElement | null>(null)

const pickedDate = ref<string>('') // yyyy-mm-dd
const hour  = ref<number>(0)
const minute= ref<number>(0)

function split(val?: string | null) {
  const v = (val || '').trim()
  if (!v) { pickedDate.value=''; hour.value=0; minute.value=0; return }
  const [d,t] = v.split(/[\sT]/)
  pickedDate.value = d || ''
  if (t) {
    const [hh,mm] = t.split(':')
    hour.value   = Number(hh || 0)
    minute.value = Number(mm || 0)
  }
}
split(props.modelValue)
watch(() => props.modelValue, split)

const dateOnlyFormat   = computed(() => (props.format || 'yyyy-mm-dd').split(/[\sT]/)[0])
const resolvedMinView  = computed(() => props.minView || 'day')
const displayValue = computed(() => {
  if (!pickedDate.value) return ''
  if (!props.useTime)    return pickedDate.value
  return `${pickedDate.value} ${two(hour.value)}:${two(minute.value)}`
})

const headerText = computed(() => {
  if (!pickedDate.value) return ''
  const d = new Date(pickedDate.value.replace(/-/g, '/'))
  return `${d.getMonth() + 1} 月 ${d.getFullYear()}`
})

const minuteOptions = computed(() => {
  const step = Math.max(1, props.minuteStep || 1)
  const arr:number[] = []
  for (let m = 0; m < 60; m += step) arr.push(m)
  return arr
})
function two(n:number){ return (n<10 ? '0'+n : ''+n) }

// 打開時間面板
const showTimePanel = ref(false)
const panelStyle = ref<Record<string,string>>({})
function showTime() {
  showTimePanel.value = true
  nextTick(() => {
    const w = wrap.value
    if (!w) return
    const rect = w.getBoundingClientRect()
    panelStyle.value = { left: '0px', top: `${w.clientHeight || 36}px`, minWidth: rect.width + 'px' }
    bindOutside()
  })
}
function hideTime() { showTimePanel.value = false; unbindOutside() }

function onDatePicked(v:string){
  pickedDate.value = (v || '').split(/[\sT]/)[0]
  if (props.useTime) showTime()
  else emitOut()
}
function pickHour(h:number){
  hour.value = h
  if (!props.showMinutePicker) confirmTime()
}
function confirmTime(){ emitOut(); hideTime() }
function cancelTime(){ hideTime() }

function emitOut(){
  if (!pickedDate.value) { emit('update:modelValue',''); emit('change',''); return }
  const out = props.useTime
    ? `${pickedDate.value} ${two(hour.value)}:${two(minute.value)}`
    : pickedDate.value
  emit('update:modelValue', out)
  emit('change', out)
}
function shiftDay(delta:number){
  if (!pickedDate.value) return
  const d = new Date(pickedDate.value.replace(/-/g,'/'))
  d.setDate(d.getDate() + delta)
  pickedDate.value = `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}`
}

// 點外側關閉
let onDocClick: ((e:MouseEvent)=>void) | null = null
function bindOutside(){
  onDocClick = (e:MouseEvent) => {
    if (!wrap.value) return
    if (!wrap.value.contains(e.target as Node)) hideTime()
  }
  document.addEventListener('mousedown', onDocClick)
}
function unbindOutside(){
  if (onDocClick) {
    document.removeEventListener('mousedown', onDocClick)
    onDocClick = null
  }
}
onBeforeUnmount(unbindOutside)

// 對外方法
function getValue(){
  return pickedDate.value ? `${pickedDate.value} ${two(hour.value)}:${two(minute.value)}` : ''
}
function setValue(v:string){
  split(v)
  inner.value?.setValue?.(pickedDate.value)
}
function readonly(v:boolean){
  // @ts-ignore
  inner.value?.readonly?.(v)
}
defineExpose({ getValue, setValue, readonly })
</script>

<style scoped>
.dtb-wrap { position: relative; display: block; }
.time-panel {
  position: absolute; z-index: 1000; background: #fff; border: 1px solid #ddd; border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,.15); padding: 8px; user-select: none;
}
.time-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 4px 2px; font-weight: 600; }
.time-panel-header .nav { background: transparent; border: 0; font-size: 18px; padding: 0 8px; cursor: pointer; }
.hours-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; padding: 6px 0; }
.cell { border: 1px solid #e0e0e0; background: #fafafa; border-radius: 4px; padding: 6px 0; cursor: pointer; }
.cell.active { background: #1677ff; color: #fff; border-color: #1677ff; }
.minutes { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
.minutes .label { color: #666; }
.actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 6px; }
.btn { border: 1px solid #ddd; background: #fff; border-radius: 4px; padding: 4px 10px; cursor: pointer; }
.btn-primary { background: #1677ff; color: #fff; border-color: #1677ff; }
</style>
