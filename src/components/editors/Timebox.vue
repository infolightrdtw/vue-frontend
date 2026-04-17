<template>
  <div class="input-group">
    <input
      ref="inputEl"
      class="form-control bootstrap-timebox"
      type="time"
      :step="stepAttr"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="readonly"
      @input="onInput"
      @change="onChange"
    />

  </div>
</template>

<script setup>
import { ref, computed, watch, toRefs } from 'vue';


const props = defineProps({
  modelValue: { type: [String, null], default: '' },
  minuteStep: { type: Number, default: 15 },
  dataType: { type: String, default: 'datetime' }, // 'datetime' | 'varchar6'
  readonly: { type: Boolean, default: false },
  minHour: { type: [Number, String, null], default: null },
  maxHour: { type: [Number, String, null], default: null },
  placeholder: { type: String, default: 'HH:mm' },
});

const emit = defineEmits(['update:modelValue', 'change']);

const { modelValue, minuteStep, dataType, minHour, maxHour } = toRefs(props);
const inputEl = ref(null);

const stepAttr = computed(() => {
  const stepMinutes = Number(minuteStep.value || 0);
  return stepMinutes > 0 ? stepMinutes * 60 : 60; // 預設 60 秒一格
});

function pad2(n) {
  const num = Number(n || 0);
  return num < 10 ? '0' + num : '' + num;
}

function toHHmmFromModel(val) {
  if (!val) return '';
  const t = String(val).trim();

  if (dataType.value === 'varchar6') {
    const pure = t.replace(/[^\d]/g, '');
    if (pure.length === 4) {
      const hh = pure.slice(0, 2);
      const mm = pure.slice(2, 4);
      return `${hh}:${mm}`;
    } else if (pure.length === 6) {
      const hh = pure.slice(0, 2);
      const mm = pure.slice(2, 4);
      // const ss = pure.slice(4, 6); 
      return `${hh}:${mm}`;
    }
    return '';
  }


  const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const hh = pad2(m[1]);
    const mm = pad2(m[2]);
    return `${hh}:${mm}`;
  }
  const digits = t.replace(/[^\d]/g, '');
  if (digits.length === 4) {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  } else if (digits.length === 6) {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  }
  return '';
}

/** 由 input 顯示值 "HH:mm" 轉回 modelValue 指定型別 */
function fromHHmmToModel(hhmm) {
  if (!hhmm) return '';
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return '';

  let h = Number(m[1]);
  const minH = minHour.value !== null && minHour.value !== undefined ? Number(minHour.value) : null;
  const maxH = maxHour.value !== null && maxHour.value !== undefined ? Number(maxHour.value) : null;

  if (minH !== null && !Number.isNaN(minH) && h < minH) h = minH;
  if (maxH !== null && !Number.isNaN(maxH) && h > maxH) h = maxH;

  const hh = pad2(h);
  const mm = pad2(m[2]);

  if (dataType.value === 'varchar6') {
    return `${hh}${mm}00`;
  }
  // 'datetime'：維持 "HH:mm"
  return `${hh}:${mm}`;
}

const displayValue = computed(() => toHHmmFromModel(modelValue.value));

function onInput(e) {
  const v = e.target.value; // "HH:mm" 或空字串
  // 為了體感流暢：即時轉型回寫
  const modelV = fromHHmmToModel(v);
  emit('update:modelValue', modelV);
}

function onChange(e) {
  const v = e.target.value;
  const modelV = fromHHmmToModel(v);
  emit('update:modelValue', modelV);
  emit('change', modelV);
}

function openPicker() {
  if (!inputEl.value) return;
  // 原生 API（Chrome/Edge/Android 上支援）
  if (typeof inputEl.value.showPicker === 'function') {
    try {
      inputEl.value.showPicker();
      return;
    } catch {}
  }
  inputEl.value.focus();
}

watch(modelValue, (nv) => {
  if (!inputEl.value) return;
  const want = toHHmmFromModel(nv);
  if (inputEl.value.value !== want) {
    inputEl.value.value = want;
  }
});
</script>

<style scoped>
.form-btn {
  line-height: 1;
}
</style>
