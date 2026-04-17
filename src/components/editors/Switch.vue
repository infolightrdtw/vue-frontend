<template>
  <div>
    <template v-if="style === 'button'">
      <div class="btn-group" role="group">
        <button
          type="button"
          class="btn"
          :class="isActive(onValue) ? 'btn-primary' : 'btn-outline-secondary'"
          @click="setValue(onValue)"
          :disabled="readonly"
        >
          {{ onText }}
        </button>
        <button
          type="button"
          class="btn"
          :class="isActive(offValue) ? 'btn-primary' : 'btn-outline-secondary'"
          @click="setValue(offValue)"
          :disabled="readonly"
        >
          {{ offText }}
        </button>
      </div>
    </template>

    <template v-else>
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          :checked="modelValue === onValue"
          @change="toggle"
          :disabled="readonly"
        />
        <label class="form-check-label ms-2">
          {{ modelValue === onValue ? onText : offText }}
        </label>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  onText: { type: String, default: 'Yes' },
  onValue: { type: String, default: 'true' },
  offText: { type: String, default: 'No' },
  offValue: { type: String, default: 'false' },
  readonly: Boolean,
  style: { type: String, default: 'button' }, // 'button' or 'checkbox'
  onSelect: Function
})

const emit = defineEmits(['update:modelValue'])

function isActive(val) {
  return props.modelValue === val
}

function setValue(val) {
  if (props.readonly) return
  emit('update:modelValue', val)
  props.onSelect?.(val)
}

function toggle() {
  const newVal = props.modelValue === props.onValue ? props.offValue : props.onValue
  setValue(newVal)
}
</script>
