<template>
  <select
    class="form-control bootstrap-combobox"
    :multiple="multiple"
    :disabled="disabled || readonly"
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

<script setup lang="ts">
import { ref, watch, computed, onMounted, getCurrentInstance } from 'vue'
import dataUtils from '@/utils/dataApi'
import { resolveFieldFromDom } from '@/composables/useFieldFromDom'
import { validate as runValidate, type ValidatorRuleMap } from '@/composables/useValidator'

defineOptions({ name: 'ComboboxEditor' })

type ItemRow = Record<string, unknown>

interface WhereItem {
  field: string
  operator: string
  value: unknown
  isNvarChar?: boolean
}

interface Props {
  type?: string
  modelValue?: string | number | unknown[] | Record<string, unknown> | null
  multiple?: boolean
  readonly?: boolean
  // Declared explicitly so DataForm's `disabled: false` fall-through can't
  // override our `:disabled="disabled || readonly"` binding on the select.
  disabled?: boolean
  allowEmpty?: boolean
  itemsSource?: ItemRow[]
  items?: ItemRow[] | null
  options?: ItemRow[] | null
  valueField?: string
  textField?: string
  remoteName?: string
  whereStr?: string
  whereItems?: WhereItem[] | string | null
  multipleSeparator?: string
  fromSysParameters?: boolean
  field?: string
  required?: boolean
  validType?: string
  customRules?: ValidatorRuleMap
  onBeforeLoad?: ((param: { whereItems: WhereItem[] }) => void) | null
  onLoaded?: ((items: ItemRow[]) => void) | null
  onSelect?: ((value: unknown) => void) | null
}

const props = withDefaults(defineProps<Props>(), {
  type: '',
  modelValue: '',
  multiple: false,
  readonly: false,
  disabled: false,
  allowEmpty: false,
  itemsSource: () => [],
  items: null,
  options: null,
  valueField: 'value',
  textField: 'text',
  remoteName: '',
  whereStr: '',
  whereItems: null,
  multipleSeparator: ',',
  fromSysParameters: false,
  field: '',
  required: false,
  validType: '',
  customRules: undefined,
  onBeforeLoad: null,
  onLoaded: null,
  onSelect: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
  (e: 'validate', error: string): void
}>()

const internalField = ref(props.field || '')
const internalItems = ref<ItemRow[]>([])

function toMultipleArray (val: unknown): unknown[] {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    return val ? val.split(props.multipleSeparator) : []
  }
  return []
}

const proxyValue = ref<unknown>(
  props.multiple ? toMultipleArray(props.modelValue) : (props.modelValue ?? '')
)

const displayItems = computed<ItemRow[]>(() => {
  if (internalItems.value.length) return internalItems.value
  if (props.itemsSource?.length) return props.itemsSource
  return props.items || props.options || []
})

watch(
  () => props.modelValue,
  val => {
    proxyValue.value = props.multiple ? toMultipleArray(val) : (val ?? '')
  }
)

watch(proxyValue, val => {
  emit('update:modelValue', val)
  props.onSelect?.(val)
})

function getParsedWhereItems (): WhereItem[] {
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

function loadData (
  data: ItemRow[],
  valueFieldOverride: string | null,
  textFieldOverride: string | null
) {
  const vField = valueFieldOverride || props.valueField || 'value'
  const tField = textFieldOverride || props.textField || 'text'
  const valueKey = props.valueField || 'value'
  const textKey = props.textField || 'text'

  const result: ItemRow[] = data.map(row => {
    const r = row || {}
    const mapped: ItemRow = {}
    mapped[valueKey] = r[vField]
    mapped[textKey] = r[tField]
    return mapped
  })

  internalItems.value = result
  props.onLoaded?.(result)
}

async function fetchRemoteData (
  remoteName: string,
  parsedWhereItems: WhereItem[]
): Promise<ItemRow[]> {
  const rn = remoteName || props.remoteName
  if (!rn) return []

  const { loadData: apiLoadData } = dataUtils(rn)

  // Payload aligned with jQuery $.fn.combobox.load (bootstrap.infolight.js:10455).
  // dataApi.loadData fills in mode/module/command automatically; we only supply
  // the variable params. whereItems is always an array (possibly empty) — never
  // null — so dataApi's JSON.stringify produces '[]' instead of the string 'null',
  // which the backend rejected with 400.
  const body = {
    total: false,
    whereStr: props.whereStr || '',
    whereItems: parsedWhereItems
  }

  const r = await apiLoadData(body)
  const data = r && (r.rows || r.items || r.data || r)
  return Array.isArray(data) ? data : []
}

function syncValueAfterLoad () {
  const current = proxyValue.value
  if (props.multiple) {
    const isEmpty = !Array.isArray(current) || !(current as unknown[]).length
    if (isEmpty) proxyValue.value = toMultipleArray(props.modelValue)
  } else {
    if (current == null || current === '') {
      proxyValue.value = props.modelValue ?? ''
    }
  }
}

async function load () {
  const parsedItems = getParsedWhereItems()

  if (props.fromSysParameters && internalField.value) {
    const remoteName = props.remoteName || 'SystemTable.sysParas'
    props.onBeforeLoad?.({ whereItems: parsedItems })
    try {
      const data = await fetchRemoteData(remoteName, parsedItems)
      loadData(data, 'VALUE', 'VALUE')
      syncValueAfterLoad()
    } catch (err) {
      console.error('[Combobox] 系統參數載入失敗:', err)
      loadData([], 'VALUE', 'VALUE')
    }
    return
  }

  if (props.remoteName) {
    props.onBeforeLoad?.({ whereItems: parsedItems })
    try {
      const data = await fetchRemoteData(props.remoteName, parsedItems)
      loadData(data, null, null)
      syncValueAfterLoad()
    } catch (err) {
      console.error('[Combobox] API 載入失敗:', err)
      loadData([], null, null)
    }
    return
  }

  const staticList = props.itemsSource?.length
    ? props.itemsSource
    : (props.items || props.options)
  if (staticList && staticList.length) {
    loadData(staticList, 'value', 'text')
    syncValueAfterLoad()
  }
}

function validate (): string {
  const v = proxyValue.value
  const isEmpty = props.multiple
    ? !Array.isArray(v) || !(v as unknown[]).length
    : v == null || v === ''

  let msg = ''
  if (props.required && isEmpty) {
    msg = 'required'
  } else if (props.validType && !isEmpty) {
    const text = props.multiple
      ? (v as unknown[]).join(props.multipleSeparator)
      : String(v ?? '')
    msg = runValidate(props.validType, text, props.customRules)
  }
  emit('validate', msg)
  return msg
}

onMounted(() => {
  let needReload = false

  if (!internalField.value) {
    const inst = getCurrentInstance()
    const root = (inst?.proxy as { $el?: Element } | undefined)?.$el ?? null
    const resolved = resolveFieldFromDom(root)
    if (resolved) {
      internalField.value = resolved
      needReload = true
    }
  }

  load().then(() => {
    if (needReload) load()
  })
})

defineExpose({ load, loadData, validate })
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
