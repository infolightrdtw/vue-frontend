<template>
  <div class="autocomplete-wrapper" ref="wrapperRef">
    <input
      type="text"
      class="form-control"
      :value="modelValue"
      :disabled="disabled || readonly"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      autocomplete="off"
    />
    
    <ul v-show="isOpen && filteredOptions.length > 0" class="dropdown-menu show autocomplete-dropdown">
      <li v-for="(item, index) in filteredOptions" :key="index">
        <a class="dropdown-item" href="#" @mousedown.prevent="selectItem(item)">
          {{ item }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import dataUtils from '@/utils/dataApi'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  remoteName: { type: String, default: '' },
  textField: { type: String, default: 'text' },
  whereItems: { type: [Array, Object, String, null], default: null },
  whereStr: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  rowData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'change', 'before-load'])

// --- 2. State ---
const wrapperRef = ref(null)
const isOpen = ref(false)
const rawData = ref([]) 

const injectedRowData = inject('currentRowData', {})

const filteredOptions = computed(() => {
  if (!rawData.value || rawData.value.length === 0) return []
  const query = String(props.modelValue || '').toLowerCase()
  if (!query) return rawData.value
  
  return rawData.value.filter(item => 
    String(item).toLowerCase().includes(query)
  )
})

function parseRemote(remoteName) {
  const seg = (remoteName || '').split('.')
  return { module: seg[0] || '', command: seg[1] || '' }
}

function getParsedWhereItems() {
  let items = props.whereItems
  if (typeof items === 'string' && items.trim()) {
    try { items = JSON.parse(items) } catch { return [] }
  }
  return Array.isArray(items) ? items : []
}

function resolveDynamicWhereItems(parsedItems) {
  if (!parsedItems || parsedItems.length === 0) return []
  const currentRow = { ...injectedRowData, ...props.rowData }

  return parsedItems.map(item => {
    let resolvedValue = item.value
    if (typeof item.value === 'string' && item.value.startsWith('@')) {
      const fieldName = item.value.substring(1)
      resolvedValue = currentRow[fieldName] ?? resolvedValue
    }
    return { field: item.field, operator: item.operator, value: resolvedValue }
  })
}

async function fetchRemoteData(remoteName, finalWhereItems) {
  const rn = remoteName || props.remoteName
  if (!rn) return []

  const { module, command } = parseRemote(rn)
  const { loadData: apiLoadData } = dataUtils(rn)

  const body = {
    mode: 'getDataset',
    module,
    command,
    remoteName: rn,
    whereItems: finalWhereItems || props.whereItems || null,
    whereStr: props.whereStr 
  }

  const r = await apiLoadData(body)
  const data = r && (r.rows || r.items || r.data || r)
  return Array.isArray(data) ? data : []
}

async function load() {
  if (rawData.value.length > 0) return
  if (!props.remoteName) return

  let baseItems = getParsedWhereItems()
  let finalWhereItems = resolveDynamicWhereItems(baseItems)
  
  emit('before-load', { whereItems: finalWhereItems })

  try {
    const data = await fetchRemoteData(props.remoteName, finalWhereItems.length ? finalWhereItems : null)
    rawData.value = data.map(item => item[props.textField] || '')
  } catch (err) {
    console.error('[Autocomplete.vue] API 錯誤:', err)
    rawData.value = []
  }
}

const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = true
}

const handleFocus = async () => {
  await load() 
  isOpen.value = true
}

const handleBlur = () => {
  isOpen.value = false
}

const selectItem = (item) => {
  emit('update:modelValue', item)
  emit('change', item)
  isOpen.value = false
}
</script>

<style scoped>
.autocomplete-wrapper {
  position: relative;
  display: block;
  width: 100%; 
}

.autocomplete-wrapper input.form-control {
  width: 100% !important;
  display: block;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: block;
  width: 100%; 
  max-height: 250px;
  overflow-y: auto;
  margin-top: 2px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.dropdown-item {
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.dropdown-item:hover,
.dropdown-item:focus {
  background-color: #f8f9fa;
  color: #0d6efd;
}
</style>