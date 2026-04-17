<template>
  <textarea
    ref="el"
    class="form-control"
    :rows="rows"
    :placeholder="prompt || ''"
    :maxlength="maxLength && maxLength > 0 ? maxLength : undefined"
    :readonly="readonly"
    :value="localValue ?? ''"
    @input="onInput"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  maxLength?: number | null  
  rows?: number               
  prompt?: string              
  readonly?: boolean           
}>(), {
  modelValue: null,
  maxLength: null,
  rows: 3,
  prompt: '',
  readonly: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | null): void
  (e: 'change', v: string | null): void
}>()

const el = ref<HTMLTextAreaElement | null>(null)
const localValue = ref<string | null>(props.modelValue)

watch(() => props.modelValue, v => { localValue.value = v })

function onInput(e: Event) {
  const v = (e.target as HTMLTextAreaElement).value ?? ''
  localValue.value = v
  emit('update:modelValue', v)
}
function onChange() {
  emit('change', localValue.value ?? '')
}
</script>

<style scoped>
</style>
