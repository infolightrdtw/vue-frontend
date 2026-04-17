<template>
  <input
    ref="inputRef"
    class="form-control bootstrap-BARcode"
    :value="localValue ?? ''"
    :readonly="readonly"
    :placeholder="placeholder"
    :style="editing ? undefined : { display: 'none' }"
    @input="onInput"
    @change="emit('change', localValue ?? '')"
  />

  <div ref="viewRef" :style="editing ? { display:'none' } : undefined" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';

// Props 對應 C#：Height、Format、RenderTag(... "input", "form-control bootstrap-BARcode")
const props = withDefaults(defineProps<{
  modelValue?: string | null
  editing?: boolean 
  height?: number   
  format?: string  
  readonly?: boolean
  placeholder?: string
}>(), {
  modelValue: null,
  editing: false,
  height: 120,
  format: 'CODE128',
  readonly: false,
  placeholder: ''
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | null): void
  (e: 'change', v: string | null): void
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const viewRef = ref<HTMLDivElement | null>(null);
const localValue = ref<string | null>(props.modelValue);

watch(() => props.modelValue, v => (localValue.value = v));

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value ?? '';
  localValue.value = v;
  emit('update:modelValue', v);
}

async function renderBarcode() {
  if (!viewRef.value) return;
  viewRef.value.innerHTML = '';

  const value = (localValue.value ?? '').trim();
  if (!value) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.height = `${props.height}px`;
  viewRef.value.appendChild(svg);

  const JsBarcode = (await import('jsbarcode')).default;
  JsBarcode(svg, value, {
    format: props.format || 'CODE128',
    displayValue: true,
    height: props.height,
    margin: 4
  });
}

// 當值/高度/格式/模式切換時重繪
watch(
  [() => props.editing, () => localValue.value, () => props.height, () => props.format],
  async () => { await nextTick(); if (!props.editing) renderBarcode(); }
);

onMounted(async () => { if (!props.editing) await renderBarcode(); });
</script>
