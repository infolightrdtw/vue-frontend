<template>
  <input
    class="form-control"
    type="password"
    :value="modelValue"
    :readonly="readonly"
    :placeholder="placeholder"
    @input="onInput"
  />
</template>

<script setup>

const props = defineProps({
  modelValue: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
  placeholder: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);

function onInput(e) {
  emit('update:modelValue', e.target.value);
}
</script>
