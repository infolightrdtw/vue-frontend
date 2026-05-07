<template>
  <!-- BUTTON MODE -->
  <template v-if="mode === 'button'">
    <div 
      class="options-div d-inline-flex align-items-center" 
      :class="[orientation === 'vertical' ? 'btn-group-vertical' : 'btn-group']" 
      role="group"
    >
      <template v-for="(opt, idx) in normalized" :key="String(opt.value)">
        <input
          class="btn-check"
          :type="multiple ? 'checkbox' : 'radio'"
          :name="name"
          :id="`${name}-${idx}`"
          :value="opt.value"
          v-model="internal"
          :disabled="localReadonly"
          autocomplete="off"
        />
        <label :for="`${name}-${idx}`" :class="['btn', `btn-${variant}`, `btn-${size}`, 'text-nowrap']">
          {{ opt.text }}
        </label>
      </template>

      <input
        v-if="showTextBoxComputed"
        class="form-control ms-1 options-text"
        :class="[size ? `form-control-${size}` : '']"
        v-model="textInput"
        :disabled="localReadonly"
        @input="onTextboxInput"
        style="width: auto; flex: 0 0 auto;"
      />
    </div>
  </template>

  <!-- DIALOG MODE -->
  <template v-else-if="mode === 'dialog'">
    <div class="input-group">
      <input class="form-control options-text" :disabled="localReadonly" :value="multiple ? (toArray(internal).join(separator)) : internal ?? ''" readonly />
      <button class="btn btn-outline-secondary" type="button" @click="openPicker" :disabled="localReadonly">
        <span class="bi bi-search"></span>
      </button>
    </div>

    <!-- lightweight modal -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,.45)">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">&nbsp;</h5>
            <button type="button" class="btn-close" @click="cancelPicker"></button>
          </div>
          <div class="modal-body">
            <div class="input-group mb-2">
              <input class="form-control options-filter" type="text" :placeholder="'查詢...'" v-model="modalFilter" @keydown.enter.prevent />
              <button class="btn btn-outline-secondary options-query" type="button">
                <span class="bi bi-search"></span>
              </button>
            </div>

            <div class="d-flex flex-wrap gap-2">
              <template v-for="(opt, idx) in filteredOptions" :key="String(opt.value)">
                <input
                  class="btn-check"
                  :type="multiple ? 'checkbox' : 'radio'"
                  :id="`dlg-${name}-${idx}`"
                  :name="`dlg-${name}`"
                  :value="opt.value"
                  :checked="modalSelected.has(opt.value)"
                  @change="toggleModalItem(opt.value)"
                />
                <label :for="`dlg-${name}-${idx}`" :class="btnClass">{{ opt.text }}</label>
              </template>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary options-cancel" @click="cancelPicker">取消</button>
            <button type="button" class="btn btn-primary options-ok" @click="confirmPicker">確定</button>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- LIST MODE -->
  <template v-else-if="mode === 'list'">
    <div class="d-flex align-items-center flex-wrap gap-2 list-div">
      <!-- chips -->
      <span v-for="chip in listChips" :key="String(chip.value)" class="btn btn-sm datagrid-btn options-item" :value="chip.value">
        <span class="btn-text">{{ chip.text }}</span>
        <button type="button" class="btn-close ms-1 options-remove" aria-label="移除" @click="removeChip(chip.value)" :disabled="localReadonly"></button>
      </span>

      <!-- add -->
      <button type="button" class="btn btn-sm datagrid-btn options-add" @click="openPicker" :disabled="localReadonly">
        <span class="bi bi-plus"></span>
      </button>
    </div>

    <!-- modal -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,.45)">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">&nbsp;</h5>
            <button type="button" class="btn-close" @click="cancelPicker"></button>
          </div>
          <div class="modal-body">
            <div class="input-group mb-2">
              <input class="form-control options-filter" type="text" :placeholder="'查詢...'" v-model="modalFilter" @keydown.enter.prevent />
              <button class="btn btn-outline-secondary options-query" type="button">
                <span class="bi bi-search"></span>
              </button>
            </div>

            <div class="d-flex flex-wrap gap-2">
              <template v-for="(opt, idx) in filteredOptions" :key="String(opt.value)">
                <input
                  class="btn-check"
                  type="checkbox"
                  :id="`list-${name}-${idx}`"
                  :value="opt.value"
                  :checked="modalSelected.has(opt.value)"
                  @change="toggleModalItem(opt.value)"
                />
                <label :for="`list-${name}-${idx}`" :class="btnClass">{{ opt.text }}</label>
              </template>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary options-cancel" @click="cancelPicker">取消</button>
            <button type="button" class="btn btn-primary options-ok" @click="confirmPicker">確定</button>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- CHECKRADIO MODE -->
  <template v-else-if="mode === 'checkradio'">
    <div class="options-div d-flex flex-wrap align-items-center gap-3">
      <div 
        v-for="(opt, idx) in normalized" 
        :key="String(opt.value)" 
        class="d-inline-flex align-items-center"
      >
        <input
          :type="multiple ? 'checkbox' : 'radio'"
          :name="name"
          :id="`cr-${name}-${idx}`"
          :value="opt.value"
          v-model="internal"
          :disabled="localReadonly"
          style="width: 16px; height: 16px; appearance: auto !important; margin: 0; cursor: pointer; flex-shrink: 0;"
        />
        <label 
          :for="`cr-${name}-${idx}`"
          style="margin-left: 6px; margin-bottom: 0; cursor: pointer;"
        >
          {{ opt.text }}
        </label>
      </div>
    </div>
  </template>

  <!-- FALLBACK -->
  <template v-else>
    <div class="text-muted small">（未知的 mode：{{ mode }}）</div>
  </template>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, getCurrentInstance } from 'vue'
import dataUtils from '@/utils/dataApi'
import { validate as runValidate } from '@/composables/useValidator'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, Array], default: null },

  // legacy-compatible sources
  items: { type: Array, default: null },
  options: { type: Array, default: null },

  // remote loading
  remoteName: { type: String, default: '' },
  whereStr: { type: String, default: '' },
  whereItems: { type: [Array, Object, String, null], default: null },
  fromSysParameters: { type: Boolean, default: false },
  loader: { type: Function, default: null },

  multiple: { type: Boolean, default: false },
  mode: { type: String, default: 'button' }, // 'button' | 'dialog' | 'list' | 'checkradio'
  orientation: { type: String, default: 'horizontal' },
  valueField: { type: String, default: 'value' },
  textField: { type: String, default: 'text' },
  separator: { type: String, default: ',' },
  showTextbox: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  // declared so DataForm's `disabled: false` fall-through can't override the
  // internal :disabled binding
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  validType: { type: String, default: '' },
  customRules: { type: Object, default: undefined },

  name: { type: String, default: () => `opt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}` },
  variant: { type: String, default: 'outline-secondary' },
  size: { type: String, default: 'sm' },

  onSelect: { type: Function, default: null },
  field: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change', 'loaded', 'before-load', 'validate'])
const errorMessage = ref('')

const internalField = ref(props.field || '')

const rawData = ref([]) 
const sourceList = computed(() => props.items ?? props.options ?? [])
const normalized = computed(() => {
  const list = rawData.value?.length ? rawData.value : (Array.isArray(sourceList.value) ? sourceList.value : [])
  return list.map(o => {
    const vField = props.fromSysParameters ? 'VALUE' : props.valueField
    const tField = props.fromSysParameters ? 'VALUE' : props.textField
    
    if (o != null && typeof o === 'object') return { value: o[vField], text: o[tField] }
    return { value: o, text: String(o ?? '') }
  })
})

const internal = ref(props.multiple ? [] : null) 
const textInput = ref('') 

function toArray(v) {
  if (Array.isArray(v)) return v
  if (v === null || v === undefined || v === '') return []
  if (typeof v === 'string') return v.split(props.separator).map(s => s.trim()).filter(Boolean)
  return [v]
}

function toOut(vArr) {
  const wasArray = Array.isArray(props.modelValue)
  return wasArray ? vArr : vArr.join(props.separator)
}

const showTextBoxComputed = computed(() =>
  props.showTextbox && !props.multiple && props.mode !== 'dialog' && props.mode !== 'list'
)

watch(() => props.modelValue, (v) => {
  if (props.multiple) {
    internal.value = toArray(v)
  } else {
    internal.value = (Array.isArray(v) ? v[0] : v)
  }
  if (!props.multiple && showTextBoxComputed.value) {
    textInput.value = internal.value ?? ''
  }
}, { immediate: true })

watch(internal, (v) => {
  const out = props.multiple ? toOut(v) : v
  emit('update:modelValue', out)
  emit('change', out)
  if (!props.multiple && showTextBoxComputed.value) {
    textInput.value = (v ?? '')
  }
  if (props.onSelect) {
    try { props.onSelect.call(null, props.multiple ? (Array.isArray(out) ? out.join(props.separator) : out) : out) } catch {}
  }
})

function onTextboxInput() {
  if (localReadonly.value) return
  const val = textInput.value
  internal.value = val
}

function parseRemote(remoteName) {
  const seg = (remoteName || '').split('.')
  return { module: seg[0] || '', command: seg[1] || '' }
}

async function fetchRemoteData(remoteName, whereItems) {
  const rn = remoteName || props.remoteName
  if (!rn) return []

  const { loadData: apiLoadData } = dataUtils(rn)
  // payload aligned with jQuery (whereItems must be an array, never null —
  // dataApi would otherwise stringify null to 'null' → backend 400)
  const body = {
    total: false,
    whereStr: props.whereStr || '',
    whereItems: Array.isArray(whereItems) ? whereItems : []
  }
  const r = await apiLoadData(body)
  const data = r && (r.rows || r.items || r.data || r)
  return Array.isArray(data) ? data : []
}

function resolveDynamicValue(val) {
  // $.getDefaultValue 
  return val || '' 
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

async function load() {
  const opts = props
  var whereItems = []

  if (opts.fromSysParameters) {
    const field = internalField.value
    if (field) {
      const remoteName = opts.remoteName || 'SystemTable.sysParas'
      whereItems = [{
        field: 'COLUMNNAME',
        operator: '=',
        value: field,
        isNvarChar: true
      }]

      emit('before-load', { whereItems })
      try {
        const data = await fetchRemoteData(remoteName, whereItems.length ? whereItems : null)
        internalLoadData(data || [])
      } catch (err) {
        console.error('[Options.vue] 系統參數 API 失敗:', err)
        internalLoadData([])
      }
      return
    }
  }

  if (opts.remoteName) {
    if (Array.isArray(opts.whereItems)) {
      whereItems = opts.whereItems
    }

    emit('before-load', { whereItems })
    try {
      const data = await fetchRemoteData(opts.remoteName, whereItems.length ? whereItems : null)
      internalLoadData(data || [])
    } catch (err) {
      console.error('[Options.vue] API error:', err)
      internalLoadData([])
    }
    return
  }

  if (sourceList.value?.length) {
    internalLoadData(sourceList.value)
  } else {
    internalLoadData([])
  }
}

function internalLoadData(data) {
  rawData.value = Array.isArray(data) ? data.slice() : []

  if (props.multiple) {
    setValues(toArray(props.modelValue))
  } else {
    setValue(Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue)
  }

  if (!props.multiple && showTextBoxComputed.value) {
    textInput.value = (Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue) ?? ''
  }

  emit('loaded', rawData.value)
}

function getValues() {
  return props.multiple ? [...toArray(internal.value)] : [internal.value]
}
function getValue() {
  if (showTextBoxComputed.value) {
    return textInput.value ?? ''
  }
  return props.multiple
    ? (Array.isArray(props.modelValue) ? props.modelValue : (props.modelValue ?? '').toString())
    : internal.value
}
function setValues(values) {
  const vArr = toArray(values)
  if (props.multiple) internal.value = vArr
  else internal.value = vArr[0] ?? null
}
function setValue(value) {
  if (props.multiple) internal.value = toArray(value)
  else internal.value = value
}
function changeValue(valueStr) {
  if (props.multiple) setValues(valueStr)
  else setValue(valueStr)
}

function setWhere(where) {
  if (Array.isArray(where)) {
    emit('before-load', { setWhere: where })
  } else if (typeof where === 'string') {
    emit('before-load', { setWhereStr: where })
  }
}

const localReadonly = computed(() => props.disabled || props.readonly || _localReadonlyOverride.value)
const _localReadonlyOverride = ref(false)
function readonly(v) { _localReadonlyOverride.value = !!v }

const listChips = computed(() => {
  const sel = new Set(toArray(internal.value))
  return normalized.value.filter(n => sel.has(n.value))
})
function removeChip(val) {
  if (localReadonly.value) return
  if (!props.multiple) return
  const arr = new Set(toArray(internal.value))
  arr.delete(val)
  internal.value = [...arr]
}

const showModal = ref(false)
const modalFilter = ref('')
const modalSelected = ref(new Set())

function openPicker() {
  if (localReadonly.value) return
  modalFilter.value = ''
  const current = new Set(toArray(internal.value))
  modalSelected.value = new Set(current)
  showModal.value = true
}
function confirmPicker() {
  if (props.multiple) {
    internal.value = [...modalSelected.value]
  } else {
    const first = modalSelected.value.values().next().value ?? null
    internal.value = first
  }
  showModal.value = false
}
function cancelPicker() { showModal.value = false }

const filteredOptions = computed(() => {
  const f = (modalFilter.value || '').toLowerCase()
  if (!f) return normalized.value
  return normalized.value.filter(n => String(n.text ?? '').toLowerCase().includes(f))
})
function toggleModalItem(val) {
  if (props.multiple) {
    const s = new Set(modalSelected.value)
    if (s.has(val)) s.delete(val); else s.add(val)
    modalSelected.value = s
  } else {
    modalSelected.value = new Set([val])
  }
}

const groupClass = computed(() => {
  if (props.mode === 'button') {
    return props.orientation === 'vertical' ? 'btn-group-vertical' : 'btn-group'
  }
  return ''
})
const sizeClass = computed(() => props.size ? `btn-${props.size}` : '')
const btnClass  = computed(() => `btn btn-${props.variant} ${sizeClass.value}`)

function apiOptions() {
  return {
    remoteName: props.remoteName,
    whereStr: props.whereStr,
    whereItems: props.whereItems,
    fromSysParameters: props.fromSysParameters,
    multiple: props.multiple,
    mode: props.mode,
    orientation: props.orientation,
    valueField: props.fromSysParameters ? 'VALUE' : props.valueField,
    textField: props.fromSysParameters ? 'VALUE' : props.textField,
    separator: props.separator,
    showTextbox: props.showTextbox,
    readonly: localReadonly.value,
    name: props.name,
    variant: props.variant,
    size: props.size,
  }
}

function getWhereItemsOut() { return getParsedWhereItems() }
function addItems(values) {
  if (!props.multiple) return
  const arr = new Set(toArray(internal.value))
  toArray(values).forEach(v => arr.add(v))
  internal.value = [...arr]
}

function validate () {
  const v = internal.value
  const empty = props.multiple
    ? !Array.isArray(v) || v.length === 0
    : v === null || v === undefined || v === ''
  let msg = ''
  if (props.required && empty) {
    msg = 'required'
  } else if (props.validType && !empty) {
    const text = props.multiple ? toArray(v).join(props.separator) : String(v)
    msg = runValidate(props.validType, text, props.customRules)
  }
  errorMessage.value = msg
  emit('validate', msg)
  return msg
}

defineExpose({
  load, loadData: internalLoadData,
  getValues, setValues,
  getValue, setValue,
  changeValue, setWhere,
  readonly, getWhereItems: getWhereItemsOut,
  addItems, options: apiOptions,
  validate,
})


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
</script>

<style scoped>
/* Base appearance so it works even without BS JS */
.btn { display:inline-block; padding:.375rem .75rem; border:1px solid #ced4da; border-radius:.375rem; background:#fff; cursor:pointer; user-select:none }
.btn + .btn { margin-left:.25rem }
.btn-sm { padding:.25rem .5rem; font-size:.875rem; border-radius:.25rem }
.btn-lg { padding:.5rem 1rem; font-size:1.25rem; border-radius:.5rem }

.btn-check:checked + .btn {
  color:#fff;
  border-color: var(--bs-primary, #0d6efd);
  background-color: var(--bs-primary, #0d6efd);
}

.datagrid-btn { border-color:#ced4da; background:#f8f9fa }
.options-item { display:inline-flex; align-items:center; gap:.25rem }

.modal.fade.show { transition: opacity .15s linear }
.modal-dialog { margin-top: 10vh }
</style>
