<template>
  <div class="input-group scan-component">
    <input
      ref="inputRef"
      type="text"
      class="form-control bootstrap-scan"
      :value="modelValue"
      :disabled="readonly"
      @input="handleInput"
    />
    
    <span class="input-group-btn" v-if="isWebkit">
      <button
        class="btn btn-default form-btn glyphicon glyphicon-qrcode"
        style="top: 0"
        type="button"
        :disabled="readonly"
        @click="triggerScan"
      >
        </button>
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: { 
    type: [String, Number],
    default: ''
  },
  readonly: { 
    type: Boolean,
    default: false
  },
  onScan: { 
    type: [Function, String],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'scan-click']);

const inputRef = ref(null);

const isWebkit = computed(() => {
  return typeof window !== 'undefined' && window.parent && window.parent.webkit !== undefined;
});

const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
};

//bindEvent
const triggerScan = () => {
  if (props.readonly) return;

  if (typeof window !== 'undefined') {
    window.onReceiveMessageParameters = window.onReceiveMessageParameters || {};

    window.onReceiveMessageParameters.input = inputRef.value;
    window.onReceiveMessageParameters.onScan = props.onScan;

    if (typeof window.callAppMethod === 'function') {
      window.callAppMethod('Scan a barcode');
    }
  }

  emit('scan-click', props.onScan);
};
</script>

<style scoped>
.scan-component {
  width: 100%;
}
</style>