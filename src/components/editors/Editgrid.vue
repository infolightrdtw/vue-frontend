<template>
  <div class="bootstrap-editgrid">
    <table v-if="columnCount > 0"
           class="bootstrap-datagrid table editgrid-table table-hover table-striped table-bordered table-condensed">
      <thead>
        <tr>
          <th v-for="(col, ci) in internalColumns" :key="ci" :style="thStyle">
            {{ col.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(rowV, ri) in rowValues" :key="ri">
          <td v-for="(col, ci) in internalColumns" :key="ci">
            <div v-if="isCellPreset(col, ri)" class="editgrid-label">
              {{ presetValue(col, ri) }}
            </div>
            <BEditor v-else
                     :type="editorType(col)"
                     :options="cellEditorOptions(col)"
                     :row="rowV"
                     :column="col" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  rows?: number
  columns?: any[]
  readonly?: boolean
  disabled?: boolean
  required?: boolean
}>(), {
  modelValue: '',
  rows: 3,
  columns: () => [],
  readonly: false,
  disabled: false,
  required: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'validate', error: string): void
}>()

const internalColumns = computed(() =>
  (props.columns || []).map((c, i) => ({ ...c, field: String(i) }))
)
const columnCount = computed(() => internalColumns.value.length)
const thStyle = computed(() => ({
  width: columnCount.value ? `${100 / columnCount.value}%` : 'auto'
}))

const rowValues = reactive<Record<string, string>[]>([])
const isInternalEdit = ref(false)

function buildRows (modelStr: string) {
  const cols = internalColumns.value
  const out: Record<string, string>[] = []
  for (let i = 0; i < props.rows; i++) {
    const obj: Record<string, string> = {}
    cols.forEach(c => { obj[c.field] = '' })
    out.push(obj)
  }
  if (!modelStr) return out
  try {
    const parsed = JSON.parse(modelStr)
    if (!Array.isArray(parsed)) return out
    for (let i = 0; i < props.rows && i < parsed.length; i++) {
      const sRow = parsed[i]
      if (!Array.isArray(sRow)) continue
      for (let j = 0; j < cols.length && j < sRow.length; j++) {
        out[i][cols[j].field] = sRow[j] ?? ''
      }
    }
  } catch { /* ignore — treat as empty */ }
  return out
}

function syncFromModel () {
  const next = buildRows(props.modelValue)
  rowValues.splice(0, rowValues.length, ...next)
}
syncFromModel()

watch(() => [props.modelValue, props.rows, internalColumns.value.length], () => {
  if (isInternalEdit.value) { isInternalEdit.value = false; return }
  syncFromModel()
})

watch(rowValues, rs => {
  const array = rs.map(r => internalColumns.value.map(c => r[c.field] ?? ''))
  isInternalEdit.value = true
  emit('update:modelValue', JSON.stringify(array))
}, { deep: true })

function isCellPreset (col: any, rowIndex: number) {
  return Array.isArray(col?.values) && rowIndex < col.values.length && col.values[rowIndex] != null
}
function presetValue (col: any, rowIndex: number) {
  return col.values[rowIndex]
}
function editorType (col: any) {
  return col?.editor?.type || 'textbox'
}
function cellEditorOptions (col: any) {
  const base = { ...(col?.editor?.options || {}) }
  if (props.readonly || props.disabled) {
    base.readonly = true
    base.disabled = true
  }
  return base
}

function validate () {
  let msg = ''
  if (props.required) {
    const allEmpty = rowValues.every(r =>
      internalColumns.value.every(c => {
        if (isCellPreset(c, rowValues.indexOf(r))) return true
        const v = r[c.field]
        return v == null || v === ''
      })
    )
    if (allEmpty) msg = 'required'
  }
  emit('validate', msg)
  return msg
}

defineExpose({ validate })
</script>

<style>
.editgrid-label {
  padding: 6px 12px;
}
</style>
