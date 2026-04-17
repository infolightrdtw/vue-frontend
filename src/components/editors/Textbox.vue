<template>
  <div v-if="hasIcon" class="input-group">
    <input
      type="text"
      class="form-control"
      :placeholder="prompt || ''"
      :maxlength="maxLength || null"
      :style="inputStyle"
      :readonly="isReadonly"
      :value="innerValue"
      @input="onInput"
      @blur="handleBlur"
    />
    <button
      type="button"
      class="btn btn-outline-secondary form-btn"
    >
      <i :class="iconCls"></i>
    </button>
  </div>

  <input
    v-else
    type="text"
    class="form-control"
    :placeholder="prompt || ''"
    :maxlength="maxLength || null"
    :style="inputStyle"
    :readonly="isReadonly"
    :value="innerValue"
    @input="onInput"
    @blur="handleBlur"
  />
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'TextboxEditor'
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // 對應 C# 的 MaxLength
  maxLength: {
    type: Number,
    default: null
  },
  textAlign: {
    type: String,
    default: 'left' // 會轉小寫
  },
  prompt: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  },
  iconCls: {
    type: String,
    default: ''
  },
  onBlurCb: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'blur'])

const hasIcon = computed(() => !!props.iconCls)

const innerValue = computed(() =>
  props.modelValue == null ? '' : String(props.modelValue)
)

const inputStyle = computed(() => {
  const align = (props.textAlign || 'left').toString().toLowerCase()
  return { textAlign: align }
})

const isReadonly = computed(() => props.readonly)

function onInput (e) {
  emit('update:modelValue', e.target.value)
}

function handleBlur (e) {
  emit('blur', e)
  if (typeof props.onBlurCb === 'function') {
    props.onBlurCb(e)
  }
}
</script>
