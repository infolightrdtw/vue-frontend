<template>
  <div class="dtb-wrap" ref="wrap">
    <Datebox
      ref="inner"
      :model-value="modelValue"
      :format="fullFormat"
      :enable-time="false"
      :min-view="resolvedMinView"
      :prompt="prompt"
      :readonly="readonly"
      :select-only="selectOnly"
      :disabled="disabled"
      :picker-position="pickerPosition"
      :data-type="dataType || 'datetime'"
      @update:model-value="onDatebox"
      @change="onDatebox"
    />

    <!-- Step-through time panel (mirrors bootstrap-datetimepicker's hour→minute
         flow): after the date is picked we pop an hour grid; clicking an hour
         switches to a minute grid; clicking a minute auto-closes and fires
         update:modelValue with the final datetime. -->
    <div v-if="showPanel" class="datetimepicker-picker" :style="panelStyle">
      <div class="dtp-header">
        <span>{{ headerText }}</span>
      </div>

      <table v-if="stage === 'hour'" class="dtp-hours">
        <tbody>
          <tr v-for="r in 4" :key="'hr' + r">
            <td v-for="c in 6" :key="'hc' + r + '-' + c" class="hour" @click="pickHour((r - 1) * 6 + (c - 1))">
              {{ two((r - 1) * 6 + (c - 1)) }}:00
            </td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="stage === 'minute'" class="dtp-minutes">
        <tbody>
          <tr v-for="r in 3" :key="'mr' + r">
            <td v-for="c in 4" :key="'mc' + r + '-' + c" class="minute" @click="pickMinute(((r - 1) * 4 + (c - 1)) * 5)">
              {{ two(hour) }}:{{ two(((r - 1) * 4 + (c - 1)) * 5) }}
            </td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="stage === 'second'" class="dtp-minutes">
        <tbody>
          <tr v-for="r in 3" :key="'sr' + r">
            <td v-for="c in 4" :key="'sc' + r + '-' + c" class="minute" @click="pickSecond(((r - 1) * 4 + (c - 1)) * 5)">
              {{ two(minute) }}:{{ two(((r - 1) * 4 + (c - 1)) * 5) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import Datebox from './Datebox.vue'
import { validate as runValidate } from '@/composables/useValidator'

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
  disabled?: boolean
  required?: boolean
  validType?: string
  customRules?: Record<string, unknown>
  useTime?: boolean
  onSelect?: ((d: Date | null) => void) | null
}>(), {
  modelValue: '',
  format: 'yyyy-mm-dd',
  timeFormat: 'HH:ii',
  minView: 'day',
  selectOnly: false,
  readonly: false,
  disabled: false,
  required: false,
  validType: '',
  customRules: undefined,
  useTime: true,
  onSelect: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'change', v: string): void
  (e: 'validate', error: string): void
}>()

const inner = ref<InstanceType<typeof Datebox> | null>(null)
const wrap  = ref<HTMLElement | null>(null)
const showPanel = ref(false)
const stage = ref<'hour' | 'minute' | 'second'>('hour')
const panelStyle = ref<Record<string, string>>({})
const datePart = ref('')
const hour   = ref(0)
const minute = ref(0)
const second = ref(0)

const formatHasTime = computed(() => {
  const f = String(props.format || '')
  const tf = String(props.timeFormat || '')
  return /[HhIiSs]/.test(f) || /[HhIiSs]/.test(tf)
})
const timeEnabled = computed(() => props.useTime && formatHasTime.value)
const showSecond = computed(() => {
  const f = String(props.format || '')
  const tf = String(props.timeFormat || '')
  return /[Ss]/.test(f) || /[Ss]/.test(tf)
})

const fullFormat = computed(() => {
  const f = props.format || 'yyyy-mm-dd'
  if (!timeEnabled.value) return f
  if (/[HhIiSs]/.test(f)) return f
  const tf = props.timeFormat || 'HH:ii'
  return `${f} ${tf}`
})

const resolvedMinView = computed(() => props.minView || 'day')

const headerText = computed(() => {
  if (!datePart.value) return ''
  if (stage.value === 'hour') return datePart.value
  if (stage.value === 'minute') return `${datePart.value} ${two(hour.value)}:--`
  return `${datePart.value} ${two(hour.value)}:${two(minute.value)}:--`
})

function two (n: number) { return (n < 10 ? '0' : '') + n }

function syncFromValue (v?: string | null) {
  const s = String(v || '').trim()
  if (!s) { datePart.value = ''; hour.value = 0; minute.value = 0; second.value = 0; return }
  const [d, t] = s.split(/[\sT]/)
  datePart.value = d || ''
  if (t) {
    const m = t.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/)
    if (m) {
      hour.value   = Number(m[1] || 0)
      minute.value = Number(m[2] || 0)
      second.value = Number(m[3] || 0)
    }
  }
}

function onDatebox (v: string) {
  const clean = v || ''
  syncFromValue(clean)
  emit('update:modelValue', clean)
  emit('change', clean)
  if (typeof props.onSelect === 'function') {
    try {
      const d = clean ? new Date(clean.replace(/-/g, '/')) : null
      props.onSelect(d && !isNaN(d.getTime()) ? d : null)
    } catch { /* ignore user-code errors */ }
  }
  validate()
  if (timeEnabled.value && datePart.value) openPanel()
}

function openPanel () {
  stage.value = 'hour'
  nextTick(() => {
    const w = wrap.value
    if (!w) return
    panelStyle.value = {
      left: '0px',
      top: `${w.clientHeight || 36}px`,
      minWidth: (w.clientWidth || 220) + 'px'
    }
    showPanel.value = true
    bindOutside()
    inner.value?.closePicker?.()
  })
}
function closePanel () { showPanel.value = false; unbindOutside() }

function pickHour (h: number) {
  hour.value = h
  commit()
  stage.value = 'minute'
}

function pickMinute (m: number) {
  minute.value = m
  commit()
  if (showSecond.value) {
    stage.value = 'second'
  } else {
    closePanel()
  }
}

function pickSecond (s: number) {
  second.value = s
  commit()
  closePanel()
}

function commit () {
  if (!datePart.value) return
  const timeStr = showSecond.value
    ? `${two(hour.value)}:${two(minute.value)}:${two(second.value)}`
    : `${two(hour.value)}:${two(minute.value)}`
  const out = `${datePart.value} ${timeStr}`
  emit('update:modelValue', out)
  emit('change', out)
  validate()
}

function validate (): string {
  const value = props.modelValue || ''
  let msg = ''
  if (props.required && String(value).trim() === '') {
    msg = 'required'
  } else if (props.validType && value) {
    msg = runValidate(props.validType, String(value), props.customRules as never)
  }
  emit('validate', msg)
  return msg
}

let onDocClick: ((e: MouseEvent) => void) | null = null
function bindOutside () {
  onDocClick = (e: MouseEvent) => {
    if (!wrap.value) return
    if (!wrap.value.contains(e.target as Node)) closePanel()
  }
  document.addEventListener('mousedown', onDocClick)
}
function unbindOutside () {
  if (onDocClick) {
    document.removeEventListener('mousedown', onDocClick)
    onDocClick = null
  }
}
onBeforeUnmount(unbindOutside)

syncFromValue(props.modelValue)

function getValue () { return props.modelValue ?? '' }
function setValue (v: string) {
  syncFromValue(v)
  inner.value?.setValue?.(v)
  emit('update:modelValue', v || '')
}
function setReadonly (v: boolean) {
  inner.value?.readonly?.(v)
}
defineExpose({ getValue, setValue, readonly: setReadonly, validate })
</script>

<style scoped>

.dtb-wrap {
  position: relative;
  display: block;
}

.datetimepicker-picker {
  position: absolute;
  z-index: 1000;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  padding: 4px;
  margin-top: 2px;
  min-width: 220px;
  user-select: none;
}

.dtp-header {
  text-align: center;
  font-weight: 600;
  padding: 6px 4px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.datetimepicker-picker table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 0;
}

.datetimepicker-picker table td {
  text-align: center;
  cursor: pointer;
  padding: 8px 0;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
}

.datetimepicker-picker table td:hover {
  background: #eeeeee;
}

.datetimepicker-picker table td.hour,
.datetimepicker-picker table td.minute {
  width: 16.6%;
  height: 30px;
  line-height: 30px;
}

.dtp-minutes td.minute {
  width: 25%;
}
</style>
