<template>
  <input
    class="form-control"
    type="password"
    :value="innerValue"
    :placeholder="placeholder"
    :disabled="disabled || readonly"
    @input="onInput"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { validate as runValidate, type ValidatorRuleMap } from '@/composables/useValidator'

defineOptions({ name: 'PasswordEditor' })

interface Props {
  modelValue?: string | null
  readonly?: boolean
  disabled?: boolean
  placeholder?: string
  required?: boolean
  validType?: string
  customRules?: ValidatorRuleMap
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  readonly: false,
  disabled: false,
  placeholder: '',
  required: false,
  validType: '',
  customRules: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'validate', error: string): void
}>()

const errorMessage = ref('')

const innerValue = computed(() =>
  props.modelValue == null ? '' : String(props.modelValue)
)

function onInput (e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

function handleBlur (e: FocusEvent) {
  emit('blur', e)
  validate()
}

function validate (): string {
  const value = innerValue.value
  let msg = ''
  if (props.required && value.trim() === '') {
    msg = 'required'
  } else if (props.validType) {
    msg = runValidate(props.validType, value, props.customRules)
  }
  errorMessage.value = msg
  emit('validate', msg)
  return msg
}

defineExpose({ validate })
</script>
