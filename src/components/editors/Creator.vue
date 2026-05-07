<template>
  <input
    type="text"
    class="form-control bootstrap-creator w-100"
    :value="displayValue"
    disabled
  />
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  field: {
    type: String,
    default: ''
  },
  dateField: {
    type: String,
    default: ''
  },
  rowData: {
    type: Object,
    default: () => ({})
  },
  row: {
    type: Object,
    default: () => ({})
  },
  formatter: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const injectedRowData = inject('currentRowData', {})

const localDate = ref('') 

const getDateValue = () => {
  // 直接操作 inject 進來的表單狀態，確保能連動回存檔機制
  const row = injectedRowData 
  
  // 1. 從 SessionStorage 抓取登入者資訊
  let currentUser = ''
  try {
    const clientInfoStr = sessionStorage.getItem('clientInfo')
    if (clientInfoStr) {
      currentUser = JSON.parse(clientInfoStr).user || ''
    }
  } catch (error) {
    console.error('[Creator] 解析 clientInfo 失敗', error)
  }

  const now = new Date()
  const pad = (n) => (n < 10 ? '0' + n : n)
  const currentDateStr = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  if (props.field) {
    row[props.field] = currentUser
  }
  if (props.dateField) {
    row[props.dateField] = currentDateStr
  }

  localDate.value = currentDateStr
  emit('update:modelValue', currentUser)

  return row
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      getDateValue()
    }
  },
  { immediate: true } 
)

const displayValue = computed(() => {
  const currentRow = { ...injectedRowData, ...props.row, ...props.rowData }
  const creator = props.modelValue || currentRow[props.field] || ''

  if (!creator) return ''

  if (props.formatter) {
    return props.formatter(currentRow)
  }

  let rawDate = localDate.value || currentRow[props.dateField] || ''

  if (rawDate) {
    let dateStr = String(rawDate)
    dateStr = dateStr.replace(/[TZ]/g, ' ').replace(/-/g, '/').split('.')[0].trim()
    return `${creator} (${dateStr})`
  }

  return creator
})

// auto-filled / display-only — validate is a no-op for API parity with other editors
function validate () { return '' }
defineExpose({ getDateValue, validate })
</script>

<style scoped>
.bootstrap-creator {
  display: block;
  width: 100%;
  cursor: not-allowed;
  background-color: #e9ecef;
}
</style>