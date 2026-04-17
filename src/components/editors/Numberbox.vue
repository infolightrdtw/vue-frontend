<template>
  <input
    type="number"
    class="form-control bootstrap-numberbox"
    :placeholder="prompt"
    :min="min"
    :max="max"
    :readonly="readonly"
    :style="{ textAlign: textAlign }"
    v-model.number="proxyValue"
    @blur="handleBlur"
  />
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  },
  min: Number,
  max: Number,
  prompt: String,
  textAlign: {
    type: String,
    default: 'right' 
  },
  format: String, 
  readonly: Boolean,
  onBlur: Function
})

const emit = defineEmits(['update:modelValue'])

const proxyValue = ref(props.modelValue)

watch(() => props.modelValue, val => {
  proxyValue.value = val
})

watch(proxyValue, val => {
  emit('update:modelValue', val)
})

function handleBlur(event) {
  props.onBlur?.(event, proxyValue.value)
}
</script>

<style scoped>

.bootstrap-numberbox::-webkit-outer-spin-button,
.bootstrap-numberbox::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.bootstrap-numberbox {
  -moz-appearance: textfield;
}

</style>
