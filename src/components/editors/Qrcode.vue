<template>
  <input
    ref="inputRef"
    class="form-control bootstrap-QRcode"
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

// QRCode lib expects UTF-8 byte string for non-ASCII payloads
function utf16to8 (str: string) {
  let out = ''
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    if (c >= 0x0001 && c <= 0x007f) out += str.charAt(i)
    else if (c > 0x07ff) {
      out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f))
      out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f))
      out += String.fromCharCode(0x80 | (c & 0x3f))
    } else {
      out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f))
      out += String.fromCharCode(0x80 | (c & 0x3f))
    }
  }
  return out
}

async function renderQrcode () {
  if (!viewRef.value) return
  viewRef.value.innerHTML = ''

  const text = (localValue.value ?? '').trim()
  if (!text) return

  const canvas = document.createElement('canvas')
  canvas.style.width = `${props.height}px`
  canvas.style.height = `${props.height}px`
  viewRef.value.appendChild(canvas)

  try {
    const QRCode = await import('qrcode')
    await QRCode.toCanvas(canvas, utf16to8(text), {
      width: props.height,
      margin: 2,
      errorCorrectionLevel: 'M'
    })
  } catch (err) {
    console.warn('[Qrcode] render failed', err)
    if (viewRef.value) viewRef.value.textContent = text
  }
}

watch([() => props.editing, () => localValue.value, () => props.height], async () => {
  await nextTick(); if (!props.editing) renderQrcode()
})

onMounted(async () => { if (!props.editing) await renderQrcode() })

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
