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
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  },
  min: {
    type: [Number, String],
    default: 0
  },
  max: {
    type: [Number, String],
    default: 100
  },
  step: {
    type: [Number, String],
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const displayValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
    return props.min
  }
  const val = Number(props.modelValue)
  return isNaN(val) ? props.min : val
})

const handleInput = (event) => {
  const value = Number(event.target.value)
  emit('update:modelValue', value)
}

const handleChange = (event) => {
  const value = Number(event.target.value)
  emit('update:modelValue', value)
  emit('change', value)
}
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