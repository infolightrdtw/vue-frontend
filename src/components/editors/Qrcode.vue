<template>
  <input
    ref="inputRef"
    class="form-control bootstrap-QRcode"
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

// Props 對應 C#：Height、RenderTag(... "input", "form-control bootstrap-QRcode")
const props = withDefaults(defineProps<{
  modelValue?: string | null
  editing?: boolean     
  height?: number        
  readonly?: boolean
  placeholder?: string
}>(), {
  modelValue: null,
  editing: false,
  height: 120,
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

function utf16to8(str: string) {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c >= 0x0001 && c <= 0x007f) out += str.charAt(i);
    else if (c > 0x07ff) {
      out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f));
      out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f));
      out += String.fromCharCode(0x80 | (c & 0x3f));
    } else {
      out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f));
      out += String.fromCharCode(0x80 | (c & 0x3f));
    }
  }
  return out;
}

async function renderQrcode() {
  if (!viewRef.value) return;

  viewRef.value.innerHTML = '';

  const text = (localValue.value ?? '').trim();
  if (!text) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = `${props.height}px`;
  canvas.style.height = `${props.height}px`;
  viewRef.value.appendChild(canvas);

  const QRCode = await import('qrcode'); // npm i qrcode
  await QRCode.toCanvas(canvas, utf16to8(text), {
    width: props.height,
    margin: 2,
    errorCorrectionLevel: 'M'
  });
}


watch([() => props.editing, () => localValue.value, () => props.height], async () => {
  await nextTick(); if (!props.editing) renderQrcode();
});

onMounted(async () => { if (!props.editing) await renderQrcode(); });
</script>
