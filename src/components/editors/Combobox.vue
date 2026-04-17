<template>
  <select
    class="form-control bootstrap-combobox"
    :multiple="multiple"
    :disabled="readonly"
    v-model="proxyValue"
  >
    <option v-if="allowEmpty && !multiple" :value="''"></option>
    <option
      v-for="item in displayItems"
      :key="item[valueField]"
      :value="item[valueField]"
    >
      {{ item[textField] }}
    </option>
  </select>
</template>

<script setup>
import { ref, watch, computed, onMounted, getCurrentInstance } from 'vue'
import dataUtils from '@/utils/dataApi'

const props = defineProps({
  type: {
      type: String,
      default: ''
  },
  modelValue: {
    type: [String, Number, Array, Object, null],
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  allowEmpty: {
    type: Boolean,
    default: false
  },
  itemsSource: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: null
  },
  options: {
    type: Array,
    default: null
  },
  valueField: {
    type: String,
    default: 'value'
  },
  textField: {
    type: String,
    default: 'text'
  },
  remoteName: {
    type: String,
    default: ''
  },
  whereStr: {
    type: String,
    default: ''
  },
  whereItems: {
    type: [Array, Object, String, null],
    default: null
  },
  multipleSeparator: {
    type: String,
    default: ','
  },
  fromSysParameters: {
    type: Boolean,
    default: false
  },
  field: {
    type: String,
    default: ''
  },
  onBeforeLoad: Function,
  onLoaded: Function,
  onSelect: Function
})

const emit = defineEmits(['update:modelValue'])

const internalField = ref(props.field || '')

const proxyValue = ref(
  props.multiple
    ? (Array.isArray(props.modelValue)
        ? props.modelValue
        : (typeof props.modelValue === 'string'
            ? (props.modelValue ? props.modelValue.split(props.multipleSeparator) : [])
            : [])
      )
    : (props.modelValue ?? '')
)

const internalItems = ref([])

const displayItems = computed(() => {
  if (internalItems.value.length) return internalItems.value
  return props.itemsSource?.length 
    ? props.itemsSource 
    : (props.items || props.options || [])
})

const resolvedField = computed(() => internalField.value)

watch(
  () => props.modelValue,
  val => {
    if (props.multiple) {
      if (Array.isArray(val)) {
        proxyValue.value = val
      } else if (typeof val === 'string') {
        proxyValue.value = val ? val.split(props.multipleSeparator) : []
      } else {
        proxyValue.value = []
      }
    } else {
      proxyValue.value = val ?? ''
    }
  }
)

watch(proxyValue, val => {
  emit('update:modelValue', val)
  props.onSelect?.(val)
})

function parseRemote(remoteName) {
  const seg = (remoteName || '').split('.')
  return { module: seg[0] || '', command: seg[1] || '' }
}

function getParsedWhereItems() {
  if (props.fromSysParameters && internalField.value) {
    return [{
      field: 'COLUMNNAME',
      operator: '=',
      value: internalField.value,
      isNvarChar: true
    }]
  }

  let items = props.whereItems
  if (typeof items === 'string' && items.trim()) {
    try { items = JSON.parse(items) } catch { return [] }
  }

  return Array.isArray(items) ? items : []
}

function loadData(data, valueFieldOverride, textFieldOverride) {
  const vField = valueFieldOverride || props.valueField || 'value'
  const tField = textFieldOverride || props.textField || 'text'

  const valueKey = props.valueField || 'value'
  const textKey = props.textField || 'text'

  const result = []
  for (var i = 0; i < data.length; i++) {
    const row = data[i] || {}

    const mapped = {}
    mapped[valueKey] = row[vField]
    mapped[textKey] = row[tField] 

    result.push(mapped)
  }

  internalItems.value = result
  props.onLoaded && props.onLoaded(result)
}

async function fetchRemoteData(remoteName, parsedWhereItems) {
  const rn = remoteName || props.remoteName
  if (!rn) return []

  const { module, command } = parseRemote(rn)
  const { loadData: apiLoadData } = dataUtils(rn)

  const body = {
    mode: 'getDataset',
    module,
    command,
    remoteName: rn,
    whereItems: parsedWhereItems && parsedWhereItems.length ? parsedWhereItems : null,
    whereStr: props.whereStr
  }

  const r = await apiLoadData(body)
  const data = r && (r.rows || r.items || r.data || r)

  return Array.isArray(data) ? data : []
}

async function load() {
  const opts = props
  const parsedItems = getParsedWhereItems()

  if (opts.fromSysParameters) {
    if (resolvedField.value) {
      const remoteName = opts.remoteName || 'SystemTable.sysParas'
      const param = { whereItems: parsedItems }
      opts.onBeforeLoad?.(param)

      try {
        const data = await fetchRemoteData(remoteName, parsedItems)
        loadData(data || [], 'VALUE', 'VALUE')
        syncValueAfterLoad()
      } catch (err) {
        console.error('[Combobox] 系統參數載入失敗:', err)
        loadData([], 'VALUE', 'VALUE')
      }
      return
    }
  }

  if (opts.remoteName) {
    const param = { whereItems: parsedItems }
    opts.onBeforeLoad?.(param)

    try {
      const data = await fetchRemoteData(opts.remoteName, parsedItems)
      loadData(data || [], null, null)
      syncValueAfterLoad()
    } catch (err) {
      console.error('[Combobox] API 載入失敗:', err)
      loadData([], null, null)
    }
    return
  }

  const staticList = opts.itemsSource?.length ? opts.itemsSource : (opts.items || opts.options)
  if (staticList && staticList.length) {
    loadData(staticList, 'value', 'text')
    syncValueAfterLoad()
  }
}

function syncValueAfterLoad () {
  const opts = props
  const current = proxyValue.value

  if (opts.multiple) {
    if (!Array.isArray(current) || !current.length) {
      var src = props.modelValue ?? []
      if (typeof src === 'string') {
        src = src ? src.split(opts.multipleSeparator || ',') : []
      } else if (!Array.isArray(src)) {
        src = []
      }
      proxyValue.value = src
    }
  } else {
    if (current == null || current === '') {
      proxyValue.value = props.modelValue ?? ''
    }
  }
}

onMounted(() => {
  var needReload = false

  if (!internalField.value) {
    const inst = getCurrentInstance()
    const root = inst && inst.proxy && inst.proxy.$el

    if (root) {
      var labelText = ''

      const row = root.closest && root.closest('.row')
      if (row) {
        const labelEl = row.querySelector('label')
        if (labelEl) {
          labelText = (labelEl.textContent || '').trim()
        }
      }

      if (!labelText) {
        var table = null
        var current = root
        while (current && !table) {
          if (current.tagName === 'TABLE') {
            table = current
            break
          }
          current = current.parentElement
        }

        if (table) {
          const td = root.closest && root.closest('td')
          if (td) {
            const tr = td.parentElement
            const cells = Array.from(tr.children)
            const colIndex = cells.indexOf(td)
            const headerRow = table.querySelector('thead tr')
            if (headerRow && colIndex >= 0) {
              const ths = Array.from(headerRow.children)
              const targetTh = ths[colIndex]
              if (targetTh) {
                labelText = (targetTh.textContent || '').trim()
              }
            }
          }
        }
      }

      if (labelText) {
        internalField.value = labelText
        needReload = true 
      }
    }
  }

  load().then(() => {
    if (needReload) {
      load()
    }
  })
})

defineExpose({
  load,
  loadData
})
</script>

<style scoped>
select[multiple] {
  height: auto;
}
.bootstrap-combobox {
  width: 100%;
  display: block;
}
</style>