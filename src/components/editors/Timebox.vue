<template>
  <div class="input-group">
    <input
      ref="inputEl"
      class="form-control bootstrap-timebox"
      type="time"
      :step="stepAttr"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      @input="onInput"
      @change="onChange"
      @blur="handleBlur"
    />
  </div>
</template>

<script setup>
import { ref, computed, toRefs, watch } from 'vue'
import { validate as runValidate } from '@/composables/useValidator'

const props = defineProps({
  modelValue: { type: [String, null], default: '' },
  minuteStep: { type: Number, default: 15 },
  dataType: { type: String, default: 'datetime' },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  minHour: { type: [Number, String, null], default: null },
  maxHour: { type: [Number, String, null], default: null },
  placeholder: { type: String, default: 'HH:mm' },
  required: { type: Boolean, default: false },
  validType: { type: String, default: '' },
  customRules: { type: Object, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'validate'])

const { modelValue, minuteStep, dataType, minHour, maxHour } = toRefs(props)
const inputEl = ref(null)
const errorMessage = ref('')

const isDisabled = computed(() => props.disabled || props.readonly)

const stepAttr = computed(() => {
  const stepMinutes = Number(minuteStep.value || 0)
  return stepMinutes > 0 ? stepMinutes * 60 : 60
})

function pad2 (n) {
  const num = Number(n || 0)
  return num < 10 ? '0' + num : '' + num
}

function toHHmmFromModel (val) {
  if (!val) return ''
  const t = String(val).trim()
  if (dataType.value === 'varchar6') {
    const pure = t.replace(/[^\d]/g, '')
    if (pure.length === 4) return `${pure.slice(0, 2)}:${pure.slice(2, 4)}`
    if (pure.length === 6) return `${pure.slice(0, 2)}:${pure.slice(2, 4)}`
    return ''
  }
  const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (m) return `${pad2(m[1])}:${pad2(m[2])}`
  const digits = t.replace(/[^\d]/g, '')
  if (digits.length === 4 || digits.length === 6) {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`
  }
  return ''
}

function fromHHmmToModel (hhmm) {
  if (!hhmm) return ''
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return ''
  let h = Number(m[1])
  const minH = minHour.value != null ? Number(minHour.value) : null
  const maxH = maxHour.value != null ? Number(maxHour.value) : null
  if (minH !== null && !Number.isNaN(minH) && h < minH) h = minH
  if (maxH !== null && !Number.isNaN(maxH) && h > maxH) h = maxH
  const hh = pad2(h)
  const mm = pad2(m[2])
  return dataType.value === 'varchar6' ? `${hh}${mm}00` : `${hh}:${mm}`
}

const displayValue = computed(() => toHHmmFromModel(modelValue.value))

function onInput (e) {
  emit('update:modelValue', fromHHmmToModel(e.target.value))
}

function onChange (e) {
  const v = fromHHmmToModel(e.target.value)
  emit('update:modelValue', v)
  emit('change', v)
}

function handleBlur (e) {
  emit('blur', e)
  validate()
}

watch(modelValue, (nv) => {
  if (!inputEl.value) return
  const want = toHHmmFromModel(nv)
  if (inputEl.value.value !== want) inputEl.value.value = want
})

function validate () {
  const value = modelValue.value || ''
  let msg = ''
  if (props.required && String(value).trim() === '') {
    msg = 'required'
  } else if (props.validType && value) {
    msg = runValidate(props.validType, String(value), props.customRules)
  }
  errorMessage.value = msg
  emit('validate', msg)
  return msg
}

defineExpose({ validate })
</script>

<style scoped>
.form-btn {
  line-height: 1;
}
</style>
