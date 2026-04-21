<template>
  <div v-if="hasIcon" class="input-group">
    <input
      type="text"
      class="form-control"
      :placeholder="prompt || ''"
      :maxlength="effectiveMaxLength"
      :style="inputStyle"
      :disabled="disabled || readonly"
      :value="innerValue"
      @input="onInput"
      @blur="handleBlur"
    />
    <button type="button" class="btn btn-outline-secondary form-btn">
      <i :class="iconCls"></i>
    </button>
  </div>

  <input
    v-else
    type="text"
    class="form-control"
    :placeholder="prompt || ''"
    :maxlength="effectiveMaxLength"
    :style="inputStyle"
    :disabled="readonly"
    :value="innerValue"
    @input="onInput"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { validate as runValidate, type ValidatorRuleMap } from '@/composables/useValidator'

defineOptions({ name: 'TextboxEditor' })

type TextAlign = 'left' | 'center' | 'right' | string

interface Props {
  modelValue?: string | number | null
  maxLength?: number | null
  textAlign?: TextAlign
  prompt?: string
  // Maps to C# `Readonly`. jQuery (bootstrap.infolight.js:2358-2359) applies it
  // as the HTML `disabled` attribute, so we mirror that here for behavioral parity.
  readonly?: boolean
  // Declared explicitly so DataForm's `disabled: false` fall-through can't
  // override our `:disabled="disabled || readonly"` binding on the input.
  disabled?: boolean
  iconCls?: string
  required?: boolean
  /** jQuery-compatible rule string, e.g. `"email"`, `"maxLength[20]"`, `"range[1,5]"`. */
  validType?: string
  customRules?: ValidatorRuleMap
  onBlurCb?: ((e: FocusEvent) => void) | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  maxLength: null,
  textAlign: 'left',
  prompt: '',
  readonly: false,
  disabled: false,
  iconCls: '',
  required: false,
  validType: '',
  customRules: undefined,
  onBlurCb: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'validate', error: string): void
}>()

const errorMessage = ref('')

const hasIcon = computed(() => !!props.iconCls)

const innerValue = computed(() =>
  props.modelValue == null ? '' : String(props.modelValue)
)

const inputStyle = computed(() => ({
  textAlign: (props.textAlign || 'left').toString().toLowerCase()
}))

const effectiveMaxLength = computed(() =>
  props.maxLength && props.maxLength > 0 ? props.maxLength : null
)

function onInput (e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
}

function handleBlur (e: FocusEvent) {
  emit('blur', e)
  if (typeof props.onBlurCb === 'function') {
    props.onBlurCb(e)
  }
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
