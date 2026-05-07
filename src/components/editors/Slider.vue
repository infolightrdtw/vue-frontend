<template>
  <div class="slider-wrapper d-flex align-items-center w-100">
    <input
      type="range"
      class="form-range flex-grow-1"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled || readonly"
      :value="displayValue"
      @input="handleInput"
      @change="handleChange"
    />
    <span class="ms-3 slider-value-text text-muted">{{ displayValue }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { validate as runValidate } from '@/composables/useValidator'

const props = defineProps({
  modelValue: { type: [Number, String], default: '' },
  min: { type: [Number, String], default: 0 },
  max: { type: [Number, String], default: 100 },
  step: { type: [Number, String], default: 1 },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  validType: { type: String, default: '' },
  customRules: { type: Object, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'change', 'validate'])
const errorMessage = ref('')

const displayValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
    return props.min
  }
  const val = Number(props.modelValue)
  return isNaN(val) ? props.min : val
})

function handleInput (event) {
  emit('update:modelValue', Number(event.target.value))
}

function handleChange (event) {
  const value = Number(event.target.value)
  emit('update:modelValue', value)
  emit('change', value)
  validate()
}

function validate () {
  const value = props.modelValue
  let msg = ''
  if (props.required && (value === null || value === undefined || value === '')) {
    msg = 'required'
  } else if (props.validType && value !== '' && value != null) {
    msg = runValidate(props.validType, String(value), props.customRules)
  }
  errorMessage.value = msg
  emit('validate', msg)
  return msg
}

defineExpose({ validate })
</script>

<style scoped>
.slider-wrapper {
  min-height: 38px;
}
.slider-value-text {
  min-width: 3ch;
  text-align: right;
  font-weight: 500;
}
</style>
