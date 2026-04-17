<template>
  <div class="dropdown bootstrap-submenu w-100" ref="dropdownRef">
    <button
      type="button"
      class="btn btn-secondary dropdown-toggle w-100 text-start position-relative"
      :class="{ 'disabled': disabled || readonly }"
      :disabled="disabled || readonly"
      @click="toggleRoot"
    >
      <span class="text-truncate pe-3">{{ lm.pleaseSelect }}</span>
    </button>

    <div 
      class="dropdown-menu w-100 shadow-sm" 
      :class="{ 'show': isRootOpen }"
      style="margin-top: 2px;"
    >
      <a v-if="isFetching" href="#" class="dropdown-item text-muted text-center disabled">
        {{ lm.loading }}
      </a>
      <a v-else-if="!treeData.length" href="#" class="dropdown-item text-muted text-center disabled">
        {{ lm.dataNotFound ? lm.dataNotFound.replace(':{0}', '').replace('{0}', '') : '' }}
      </a>

      <MenuNode
        v-else
        :items="treeData"
        :text-field="config.textField"
        :value-field="config.valueField"
        @select="handleSelect"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted, defineComponent, h } from 'vue'
import dataUtils from '@/utils/dataApi'
import pageUtils from '@/utils/pageApi' 

const $this = pageUtils({}, {})
const lm = computed(() => $this.localeMessages?.value || {})

const closeAll = (nodes) => {
  if (!nodes) return
  for (const n of nodes) {
    n._isOpen = false
    if (n._submenu) closeAll(n._submenu)
  }
}

const MenuNode = defineComponent({
  name: 'MenuNode',
  props: {
    items: { type: Array, required: true },
    textField: { type: String, required: true },
    valueField: { type: String, required: true }
  },
  emits: ['select'],
  setup(props, { emit }) {
    const toggleSubmenu = (e, item) => {
      e.preventDefault()
      e.stopPropagation()
      
      props.items.forEach(sibling => {
        if (sibling !== item) {
          sibling._isOpen = false
          closeAll(sibling._submenu)
        }
      })
      item._isOpen = !item._isOpen
    }

    const selectItem = (e, item) => {
      e.preventDefault()
      e.stopPropagation()
      emit('select', item)
    }

    return () => {
      return props.items.map(item => {
        if (item._submenu && item._submenu.length > 0) {
          return h('div', { class: 'dropdown dropend w-100' }, [
            h('a', {
              class: 'dropdown-item dropdown-toggle d-flex justify-content-between align-items-center',
              href: '#',
              onClick: (e) => toggleSubmenu(e, item)
            }, [ h('span', item[props.textField]) ]),
            
            h('div', {
              class: ['dropdown-menu', item._isOpen ? 'show' : ''],
              style: { top: '0', left: '100%', marginTop: '-0.25rem', minWidth: '100%' } 
            }, [
              h(MenuNode, {
                items: item._submenu,
                textField: props.textField,
                valueField: props.valueField,
                onSelect: (val) => emit('select', val)
              })
            ])
          ])
        } else {
          return h('a', {
            class: 'dropdown-item',
            href: '#',
            onClick: (e) => selectItem(e, item)
          }, item[props.textField])
        }
      })
    }
  }
})

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Object, default: () => ({}) },
  remoteName: { type: String, default: '' },
  valueField: { type: String, default: 'id' },
  textField: { type: String, default: 'text' },
  parentField: { type: String, default: 'parentId' },
  whereItems: { type: [Array, Object, String, null], default: null },
  whereStr: { type: String, default: '' },
  items: { type: Array, default: null },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  rowData: { type: Object, default: () => ({}) },
  onBeforeLoad: Function,
  onSelect: Function
})

const emit = defineEmits(['update:modelValue', 'change'])

const config = computed(() => {
  return {
    remoteName: props.options?.remoteName || props.remoteName,
    valueField: props.options?.valueField || props.valueField,
    textField: props.options?.textField || props.textField,
    parentField: props.options?.parentField || props.parentField,
    whereItems: props.options?.whereItems || props.whereItems,
    whereStr: props.options?.whereStr || props.whereStr,
    placeholder: props.options?.placeholder || props.placeholder
  }
})

const dropdownRef = ref(null)
const isRootOpen = ref(false) 
const isFetching = ref(false)
const flatData = ref([])
const treeData = ref([])

const injectedRowData = inject('currentRowData', {})

const currentText = computed(() => {
  if (!props.modelValue) return ''
  const found = flatData.value.find(
    item => String(item[config.value.valueField]) === String(props.modelValue)
  )
  return found ? found[config.value.textField] : props.modelValue
})

function getParsedWhereItems() {
  let items = config.value.whereItems
  if (typeof items === 'string' && items.trim()) {
    try { items = JSON.parse(items) } catch { return [] }
  }
  return Array.isArray(items) ? items : []
}

function resolveDynamicWhereItems(parsedItems) {
  if (!parsedItems || parsedItems.length === 0) return []
  const currentRow = { ...injectedRowData, ...props.rowData }

  const finalItems = []
  for (const item of parsedItems) {
    let resolvedValue = item.value || ''
    if (typeof item.value === 'string' && item.value.startsWith('@')) {
      const fieldName = item.value.substring(1)
      resolvedValue = currentRow[fieldName] ?? ''
    }

    if (resolvedValue !== '') {
      finalItems.push({
        field: item.field,
        operator: item.operator,
        value: String(resolvedValue)
      })
    }
  }
  return finalItems
}

const buildTree = (nodeRows, parentID) => {
  return nodeRows.filter(r => {
    let pid = r[config.value.parentField]
    if (pid === null || pid === undefined || pid === '') {
      pid = null
    }
    if (parentID === null) {
      return pid === null
    } else {
      return pid !== null && String(pid) === String(parentID)
    }
  }).map(r => {
    const children = buildTree(nodeRows, r[config.value.valueField])
    return {
      ...r,
      _isOpen: false,
      _submenu: (children && children.length > 0) ? children : null
    }
  })
}

const loadData = (data) => {
  flatData.value = data || []
  treeData.value = buildTree(flatData.value, null) 
}

const fetchRemoteData = async () => {
  if (!config.value.remoteName) {
    if (props.items && props.items.length > 0) loadData(props.items)
    return
  }

  isFetching.value = true
  try {
    let baseItems = getParsedWhereItems()
    let finalWhereItems = resolveDynamicWhereItems(baseItems)
    
    let param = { total: true }

    if (config.value.whereStr) param.whereStr = config.value.whereStr
    if (finalWhereItems && finalWhereItems.length > 0) param.whereItems = finalWhereItems

    if (props.onBeforeLoad) {
      const newParams = props.onBeforeLoad(param)
      if (newParams) param = newParams
    }

    const { loadData: apiLoadData } = dataUtils(config.value.remoteName)
    const r = await apiLoadData(param)
    
    const data = r && (r.rows || r.items || r.data || r)
    loadData(Array.isArray(data) ? data : [])
  } catch (err) {
    console.error('[Submenu] 載入資料失敗:', err)
    loadData([])
  } finally {
    isFetching.value = false
  }
}

const toggleRoot = (e) => {
  e.preventDefault()
  e.stopPropagation()
  isRootOpen.value = !isRootOpen.value
  
  if (!isRootOpen.value) {
    closeAll(treeData.value) 
  }
}

const handleSelect = (item) => {
  const value = item[config.value.valueField]
  emit('update:modelValue', value)
  emit('change', value)
  
  if (props.onSelect) props.onSelect(value)

  isRootOpen.value = false
  closeAll(treeData.value)
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isRootOpen.value = false
    closeAll(treeData.value)
  }
}

watch(() => config.value.whereStr, fetchRemoteData)

onMounted(() => {
  fetchRemoteData()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({ load: fetchRemoteData, loadData })
</script>

<style scoped>
.btn-secondary {
  background-color: #6c757d;
  color: #fff;
  border-color: #6c757d;
}

.bootstrap-submenu .dropdown-menu {
  margin: 0;
  border-radius: 0.25rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  overflow: visible !important; 
}

.dropdown-item {
  cursor: pointer;
}

.dropdown-item:hover, .dropdown-item:focus {
  background-color: #f8f9fa;
}

.dropdown-toggle::after {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.pe-3 {
  padding-right: 1.5rem !important;
}
</style>