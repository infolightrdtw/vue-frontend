<template>
  <input
    type="text"
    class="form-control bootstrap-updater w-100"
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
  const row = injectedRowData 
  
  let currentUser = ''
  try {
    const clientInfoStr = sessionStorage.getItem('clientInfo')
    if (clientInfoStr) {
      currentUser = JSON.parse(clientInfoStr).user || ''
    }
  } catch (error) {
    console.error('[Updater] 解析 clientInfo 失敗', error)
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

  let updater = props.modelValue || currentRow[props.field] || ''

  if (!updater) return ''

  if (props.formatter) {
    return props.formatter(currentRow)
  }

  let rawDate = localDate.value || currentRow[props.dateField] || ''

  if (rawDate) {
    let dateStr = String(rawDate)
    dateStr = dateStr.replace(/[TZ]/g, ' ').replace(/-/g, '/').split('.')[0].trim()
    
    if (!updater) {
        try {
            const clientInfoStr = sessionStorage.getItem('clientInfo')
            if (clientInfoStr) updater = JSON.parse(clientInfoStr).user || ''
        } catch (e) {}
    }

    return `${updater} (${dateStr})`
  }

  return updater
})

defineExpose({
  getDateValue
})
</script>

<style scoped>
.bootstrap-updater {
  display: block;
  width: 100%;
  cursor: not-allowed;
  background-color: #e9ecef;
}
</style>