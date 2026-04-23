<template>
  <textarea
    ref="el"
    class="form-control"
    :rows="rows"
    :placeholder="prompt || ''"
    :maxlength="effectiveMaxLength"
    :disabled="disabled || readonly"
    :value="innerValue"
    @input="onInput"
    @change="onChange"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { validate as runValidate, type ValidatorRuleMap } from '@/composables/useValidator'

defineOptions({ name: 'TextareaEditor' })

interface Props {
  modelValue?: string | null
  maxLength?: number | null
  rows?: number
  prompt?: string
  readonly?: boolean
  disabled?: boolean
  required?: boolean
  validType?: string
  customRules?: ValidatorRuleMap
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  maxLength: null,
  rows: 3,
  prompt: '',
  readonly: false,
  disabled: false,
  required: false,
  validType: '',
  customRules: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'change', v: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'validate', error: string): void
}>()

const el = ref<HTMLTextAreaElement | null>(null)
const errorMessage = ref('')

const innerValue = computed(() =>
  props.modelValue == null ? '' : String(props.modelValue)
)

const effectiveMaxLength = computed(() =>
  props.maxLength && props.maxLength > 0 ? props.maxLength : null
)

function onInput (e: Event) {
  const v = (e.target as HTMLTextAreaElement).value ?? ''
  emit('update:modelValue', v)
}

function onChange () {
  emit('change', innerValue.value)
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
