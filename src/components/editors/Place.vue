<template>
  <input
    ref="el"
    class="form-control bootstrap-place"
    :readonly="readonly"
    :placeholder="placeholder"
    :value="localValue"
    @input="onInput"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: string | null,    
  valueType?: string,          
  readonly?: boolean,        
  placeholder?: string
}>(), {
  modelValue: null,
  valueType: 'text',
  readonly: false,
  placeholder: ''
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | null): void
  (e: 'change', v: string | null): void
}>();

const el = ref<HTMLInputElement | null>(null);
const localValue = ref<string | null>(props.modelValue);

watch(() => props.modelValue, v => { localValue.value = v; });

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value ?? '';
  localValue.value = v;
  emit('update:modelValue', v);
}
function onChange() {
  emit('change', localValue.value ?? '');
}
</script>

<style scoped>
</style>
