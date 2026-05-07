<template>
  <div class="input-group scan-component">
    <input
      ref="inputRef"
      type="text"
      class="form-control bootstrap-scan"
      :value="modelValue"
      :disabled="isDisabled"
      @input="handleInput"
      @blur="handleBlur"
    />
    <button
      v-if="isWebkit"
      class="btn btn-outline-secondary"
      type="button"
      :disabled="isDisabled"
      @click="triggerScan"
      title="Scan"
    >
      <i class="bi bi-qr-code"></i>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { validate as runValidate } from '@/composables/useValidator'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  validType: { type: String, default: '' },
  customRules: { type: Object, default: undefined },
  onScan: { type: [Function, String], default: null }
})

const emit = defineEmits(['update:modelValue', 'scan-click', 'validate', 'blur'])

const inputRef = ref(null)
const errorMessage = ref('')

const isDisabled = computed(() => props.disabled || props.readonly)

const isWebkit = computed(() =>
  typeof window !== 'undefined' && window.parent && window.parent.webkit !== undefined
)

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

function handleBlur (e) {
  emit('blur', e)
  validate()
}

const triggerScan = () => {
  if (isDisabled.value) return
  if (typeof window !== 'undefined') {
    window.onReceiveMessageParameters = window.onReceiveMessageParameters || {}
    window.onReceiveMessageParameters.input = inputRef.value
    window.onReceiveMessageParameters.onScan = props.onScan
    if (typeof window.callAppMethod === 'function') {
      window.callAppMethod('Scan a barcode')
    }
  }
  emit('scan-click', props.onScan)
}

function validate () {
  const v = props.modelValue
  let msg = ''
  if (props.required && (v === null || v === undefined || v === '')) {
    msg = 'required'
  } else if (props.validType && v !== '' && v != null) {
    msg = runValidate(props.validType, String(v), props.customRules)
  }
  errorMessage.value = msg
  emit('validate', msg)
  return msg
}

defineExpose({ validate })
</script>

<style scoped>
.scan-component {
  width: 100%;
}
</style>
