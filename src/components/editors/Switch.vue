<template>
  <div>
    <!-- style/type === 'checkbox' → plain checkbox (jQuery bootstrap.infolight.js:12336) -->
    <label v-if="mode === 'checkbox'" class="switch-checkbox-wrap">
      <input
        class="switch-checkbox"
        type="checkbox"
        :checked="isOn"
        @change="toggle"
        :disabled="isDisabled"
      />
      <span class="switch-checkbox-text">{{ isOn ? onText : offText }}</span>
    </label>

    <!-- default ('button') → LCS-style sliding pill switch (public/js/lc-switch) -->
    <template v-else>
      <span class="lcs-wrap">
        <span
          class="lcs-switch"
          :class="[isOn ? 'lcs-on' : 'lcs-off', isDisabled ? 'lcs-disabled' : '']"
          role="switch"
          :aria-checked="isOn"
          @click="onSlideClick"
        >
          <span class="lcs-label lcs-label-on">{{ onText }}</span>
          <span class="lcs-label lcs-label-off">{{ offText }}</span>
          <span class="lcs-cursor"></span>
        </span>
      </span>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, useAttrs } from 'vue'
import { validate as runValidate } from '@/composables/useValidator'

const props = defineProps({
  modelValue: String,
  onText: { type: String, default: 'ON' },
  onValue: { type: String, default: 'true' },
  offText: { type: String, default: 'OFF' },
  offValue: { type: String, default: 'false' },
  readonly: Boolean,
  disabled: Boolean,
  style: { default: 'button' },
  type: { type: String, default: '' },
  required: { type: Boolean, default: false },
  validType: { type: String, default: '' },
  customRules: { type: Object, default: undefined },
  onSelect: Function
})

const emit = defineEmits(['update:modelValue', 'validate'])
const attrs = useAttrs()

const errorMessage = ref('')
const mode = computed(() => {
  const pickString = (v) => (typeof v === 'string' && v) ? v.toLowerCase() : ''
  return pickString(props.type)
      || pickString(attrs.type)
      || pickString(props.style)
      || pickString(attrs.style)
      || 'button'
})

const isOn = computed(() => props.modelValue === props.onValue)
const isDisabled = computed(() => props.disabled || props.readonly)

function setValue(val) {
  if (isDisabled.value) return
  emit('update:modelValue', val)
  props.onSelect?.(val)
  validate()
}

function toggle() {
  setValue(isOn.value ? props.offValue : props.onValue)
}

function onSlideClick() {
  if (isDisabled.value) return
  toggle()
}

function validate() {
  const value = props.modelValue ?? ''
  let msg = ''
  if (props.required && value === '') {
    msg = 'required'
  } else if (props.validType) {
    msg = runValidate(props.validType, value, props.customRules)
  }
  errorMessage.value = msg
  emit('validate', msg)
  return msg
}

defineExpose({ validate })
</script>

<style scoped>
.switch-checkbox-wrap {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
}

.switch-checkbox {
    width: 25px;
    height: 25px;
    vertical-align: middle;
    cursor: pointer;
    margin: 0;
}

.switch-checkbox:disabled {
    cursor: not-allowed;
}

.switch-checkbox-text {
    line-height: 25px;
}

.lcs-wrap {
    display: inline-block;
    direction: ltr;
    height: 28px;
    vertical-align: middle;
}

.lcs-switch {
    display: inline-block;
    position: relative;
    width: 73px;
    height: 28px;
    border-radius: 30px;
    background: #ddd;
    overflow: hidden;
    cursor: pointer;
    vertical-align: middle;
    -webkit-transition: all .2s ease-in-out;
    transition: all .2s ease-in-out;
}

.lcs-cursor {
    display: inline-block;
    position: absolute;
    top: 3px;
    width: 22px;
    height: 22px;
    border-radius: 100%;
    background: #fff;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 3px 4px 0 rgba(0, 0, 0, 0.1);
    z-index: 10;
    -webkit-transition: all .2s linear;
    transition: all .2s linear;
}

.lcs-label {
    font-size: 12px;
    letter-spacing: 1px;
    line-height: 18px;
    color: #fff;
    font-weight: bold;
    position: absolute;
    width: 33px;
    top: 5px;
    overflow: hidden;
    text-align: center;
    opacity: 0;
    -webkit-transition: all .2s ease-in-out .1s;
    transition: all .2s ease-in-out .1s;
}

.lcs-label-on {
    left: -70px;
    z-index: 6;
}

.lcs-label-off {
    right: -70px;
    z-index: 5;
}

/* ON state */
.lcs-switch.lcs-on {
    background: #4b8df8;
    box-shadow: 0 0 2px #579022 inset;
}

.lcs-switch.lcs-on .lcs-cursor {
    right: 3px;
}

.lcs-switch.lcs-on .lcs-label-on {
    left: 10px;
    opacity: 1;
}

/* OFF state */
.lcs-switch.lcs-off {
    background: #b2b2b2;
    box-shadow: 0px 0px 2px #a4a4a4 inset;
}

.lcs-switch.lcs-off .lcs-cursor {
    left: 3px;
}

.lcs-switch.lcs-off .lcs-label-off {
    right: 10px;
    opacity: 1;
}

/* Disabled */
.lcs-switch.lcs-disabled {
    opacity: 0.65;
    filter: alpha(opacity=65);
    cursor: default;
}
</style>
