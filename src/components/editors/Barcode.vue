<template>
  <input
    ref="inputRef"
    class="form-control bootstrap-BARcode"
    :value="localValue ?? ''"
    :disabled="isDisabled"
    :placeholder="placeholder"
    :style="editing ? undefined : { display: 'none' }"
    @input="onInput"
    @blur="handleBlur"
    @change="emit('change', localValue ?? '')"
  />
  <div ref="viewRef" :style="editing ? { display: 'none' } : undefined" />
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { validate as runValidate, type ValidatorRuleMap } from '@/composables/useValidator'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  editing?: boolean
  height?: number
  format?: string
  readonly?: boolean
  disabled?: boolean
  required?: boolean
  validType?: string
  customRules?: ValidatorRuleMap
  placeholder?: string
}>(), {
  modelValue: null,
  editing: false,
  height: 120,
  format: 'CODE128',
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

const inputRef = ref<HTMLInputElement | null>(null)
const viewRef = ref<HTMLDivElement | null>(null)
const localValue = ref<string | null>(props.modelValue)
const errorMessage = ref('')

const isDisabled = computed(() => props.disabled || props.readonly)

watch(() => props.modelValue, v => { localValue.value = v })

function onInput (e: Event) {
  const v = (e.target as HTMLInputElement).value ?? ''
  localValue.value = v
  emit('update:modelValue', v)
}

function handleBlur (e: FocusEvent) {
  emit('blur', e)
  validate()
}

async function renderBarcode () {
  if (!viewRef.value) return
  viewRef.value.innerHTML = ''

  const value = (localValue.value ?? '').trim()
  if (!value) return

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.style.height = `${props.height}px`
  viewRef.value.appendChild(svg)

  try {
    const JsBarcode = (await import('jsbarcode')).default
    JsBarcode(svg, value, {
      format: props.format || 'CODE128',
      displayValue: true,
      height: props.height,
      margin: 4
    })
  } catch (err) {
    console.warn('[Barcode] render failed', err)
    if (viewRef.value) viewRef.value.textContent = value
  }
}

watch(
  [() => props.editing, () => localValue.value, () => props.height, () => props.format],
  async () => { await nextTick(); if (!props.editing) renderBarcode() }
)

onMounted(async () => { if (!props.editing) await renderBarcode() })

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
