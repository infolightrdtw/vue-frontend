<template>
  <div class="multiinput-wrapper w-100" :class="wrapperClass">
    <div
      v-if="fieldsArr.length"
      class="input-group input-group-sm flex-nowrap w-100 multiinput-group"
    >
      <template v-for="(item, idx) in fieldsArr" :key="idx">
        <span v-if="item.text" class="input-group-text">{{ item.text }}</span>
        <input
          v-if="item.showTextbox !== false"
          type="text"
          class="form-control multiinput-control"
          v-model="inputs[idx]"
          :readonly="isReadonly(item)"
          :placeholder="item.placeholder || ''"
          :style="item.inputStyle || null"
        />
      </template>
    </div>

    <div v-else class="input-group input-group-sm flex-nowrap w-100 multiinput-group">
      <span v-if="fallbackLabel" class="input-group-text">{{ fallbackLabel }}</span>
      <input
        type="text"
        class="form-control multiinput-control"
        v-model="fallbackValue"
        :readonly="readonlyComputed"
        :placeholder="placeholder || ''"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Array, Number, null], default: '' },
  fields: { type: Array, default: () => [] },
  options: { type: Object, default: () => ({}) },
  items: { type: Array, default: () => [] },
  separator: { type: String, default: ',' },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
  wrapperClass: { type: [String, Object, Array], default: '' },
  fallbackLabel: { type: String, default: '' },
  placeholder: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const readonlyComputed = computed(() => {
  const o = props.options || {}
  return !!(props.readonly || props.disabled || props.readOnly || o.readonly || o.disabled || o.readOnly)
})
const isReadonly = (item) => !!(readonlyComputed.value || item?.readonly || item?.disabled || item?.readOnly)

const sep = computed(() => (props.options?.separator || props.separator || ','))

const fieldsArr = computed(() => {
  if (Array.isArray(props.fields) && props.fields.length) return props.fields
  if (Array.isArray(props.options?.fields) && props.options.fields.length) return props.options.fields
  if (Array.isArray(props.items) && props.items.length) return props.items
  return []
})

const inputs = ref([])

// 若無 fields，以單欄位 fallback 映射 v-model
const fallbackValue = computed({
  get () {
    if (Array.isArray(props.modelValue)) return props.modelValue.join(sep.value)
    return props.modelValue ?? ''
  },
  set (v) { emit('update:modelValue', v) }
})

const syncFromModel = () => {
  if (!fieldsArr.value.length) return
  const parts = Array.isArray(props.modelValue)
    ? [...props.modelValue]
    : (typeof props.modelValue === 'string' || typeof props.modelValue === 'number')
        ? String(props.modelValue).length ? String(props.modelValue).split(sep.value) : []
        : []
  const len = fieldsArr.value.length
  const next = new Array(len).fill('')
  for (let i = 0; i < len; i++) next[i] = parts[i] ?? ''
  inputs.value = next
}
syncFromModel()

watch(() => props.modelValue, () => syncFromModel(), { deep: false })
watch(fieldsArr, () => syncFromModel(), { deep: true })

watch(inputs, (val) => {
  if (!fieldsArr.value.length) return
  if (Array.isArray(props.modelValue)) emit('update:modelValue', [...val])
  else emit('update:modelValue', (val || []).join(sep.value))
}, { deep: true })

</script>



<style scoped>
.multiinput-wrapper {
  width: 100%;
}

/* 限制在本欄寬度內，並預留一點右邊空間，對齊其他輸入框 */
.multiinput-group {
  width: calc(100% - 0.6rem);
  flex-wrap: wrap;
  box-sizing: border-box;
}

.multiinput-control {
  flex: 1 0 58px;
}
</style>
