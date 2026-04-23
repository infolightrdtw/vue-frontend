<template>
  <input
    type="number"
    :class="inputClass"
    :placeholder="prompt || ''"
    :min="min ?? undefined"
    :max="max ?? undefined"
    :disabled="disabled || readonly"
    :style="inputStyle"
    :value="innerValue"
    @input="onInput"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { validate as runValidate, type ValidatorRuleMap } from '@/composables/useValidator'

defineOptions({ name: 'NumberboxEditor' })

interface Props {
  modelValue?: number | string | null
  min?: number | null
  max?: number | null
  prompt?: string
  textAlign?: string
  format?: string
  readonly?: boolean
  disabled?: boolean
  required?: boolean
  validType?: string
  customRules?: ValidatorRuleMap
  onBlurCb?: ((e: FocusEvent, value: unknown) => void) | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  min: null,
  max: null,
  prompt: '',
  textAlign: 'right',
  format: '',
  readonly: false,
  disabled: false,
  required: false,
  validType: '',
  customRules: undefined,
  onBlurCb: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'validate', error: string): void
}>()

const errorMessage = ref('')

const innerValue = computed(() =>
  props.modelValue == null ? '' : String(props.modelValue)
)

const inputStyle = computed(() => ({
  textAlign: (props.textAlign || 'right').toString().toLowerCase()
}))


const inputClass = computed(() => {
  const cls = ['form-control', 'bootstrap-numberbox']
  const hasMin = props.min != null && props.min !== ('' as unknown as number)
  const hasMax = props.max != null && props.max !== ('' as unknown as number)
  if (!hasMin && !hasMax) cls.push('no-spiner')
  return cls.join(' ')
})

function onInput (e: Event) {
  const raw = (e.target as HTMLInputElement).value
  if (raw === '') emit('update:modelValue', '')
  else {
    const n = Number(raw)
    emit('update:modelValue', Number.isNaN(n) ? raw : n)
  }
}

function handleBlur (e: FocusEvent) {
  emit('blur', e)
  if (typeof props.onBlurCb === 'function') {
    props.onBlurCb(e, props.modelValue)
  }
  validate()
}

function validate (): string {
  const value = innerValue.value
  let msg = ''
  if (props.required && value.trim() === '') {
    msg = 'required'
  } else if (value !== '' && (props.min != null || props.max != null)) {
    const n = Number(value)
    if (!Number.isFinite(n)) msg = 'invalid'
    else if (props.min != null && n < Number(props.min)) msg = 'min'
    else if (props.max != null && n > Number(props.max)) msg = 'max'
  }
  if (!msg && props.validType) {
    msg = runValidate(props.validType, value, props.customRules)
  }
  errorMessage.value = msg
  emit('validate', msg)
  return msg
}

defineExpose({ validate })
</script>

<style scoped>
.bootstrap-numberbox.no-spiner::-webkit-outer-spin-button,
.bootstrap-numberbox.no-spiner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.bootstrap-numberbox.no-spiner {
  -moz-appearance: textfield;
}
</style>
