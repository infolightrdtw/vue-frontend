<template>
  <input
    ref="el"
    class="form-control bootstrap-place"
    :disabled="isDisabled"
    :placeholder="placeholder"
    :value="localValue"
    @input="onInput"
    @change="onChange"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { validate as runValidate, type ValidatorRuleMap } from '@/composables/useValidator'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  valueType?: string
  readonly?: boolean
  disabled?: boolean
  required?: boolean
  validType?: string
  customRules?: ValidatorRuleMap
  placeholder?: string
}>(), {
  modelValue: null,
  valueType: 'text',
  readonly: false,
  disabled: false,
  required: false,
  validType: '',
  customRules: undefined,
  placeholder: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | null): void
  (e: 'change', v: string | null): void
  (e: 'blur', event: FocusEvent): void
  (e: 'validate', error: string): void
}>()

const el = ref<HTMLInputElement | null>(null)
const localValue = ref<string | null>(props.modelValue)
const errorMessage = ref('')

const isDisabled = computed(() => props.disabled || props.readonly)

watch(() => props.modelValue, v => { localValue.value = v })

function onInput (e: Event) {
  const v = (e.target as HTMLInputElement).value ?? ''
  localValue.value = v
  emit('update:modelValue', v)
}

function onChange () {
  emit('change', localValue.value ?? '')
}

function handleBlur (e: FocusEvent) {
  emit('blur', e)
  validate()
}

function validate (): string {
  const v = localValue.value || ''
  let msg = ''
  if (props.required && String(v).trim() === '') {
    msg = 'required'
  } else if (props.validType && v) {
    msg = runValidate(props.validType, String(v), props.customRules)
  }
  errorMessage.value = msg
  emit('validate', msg)
  return msg
}

defineExpose({ validate })
</script>
