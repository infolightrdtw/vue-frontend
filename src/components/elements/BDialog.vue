<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);" v-if="visible">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">

        <!-- Header -->
        <div :class="['modal-header', headerClass]">
          <h5 class="modal-title">{{ titleText }}</h5>
          <button type="button" class="btn-close" @click="onClose"></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <div :class="['alert mb-0', alertClass]" v-html="displayMessage"></div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn" :class="buttonClass" @click="onClose">確定</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  visible: Boolean,
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'error'   // error | warning | info
  },
  root: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const onClose = () => emit('close')

const displayMessage = computed(() => {
  const msg = props.message || ''
  const lm = props.root?.localeMessages?.value

  if (!lm || typeof msg !== 'string') {
    return msg
  }

  if (msg.indexOf('duplicate:') === 0) {
    const duplicateValue = msg.replace('duplicate:', '') 
    const tpl = lm.validateDuplicate 

    if (typeof tpl === 'string') {
      if (tpl.indexOf('{0}') >= 0) {
        return tpl.replace('{0}', duplicateValue)
      }
      return tpl + duplicateValue
    }

    return msg
  }

  const translated = lm[msg]
  return translated || msg
})


const headerClass = computed(() => ({
  'bg-danger text-white': props.type === 'error',
  'bg-warning text-dark': props.type === 'warning',
  'bg-info text-white': props.type === 'info'
}))

const alertClass = computed(() => ({
  'alert-danger': props.type === 'error',
  'alert-warning': props.type === 'warning',
  'alert-info': props.type === 'info'
}))

const buttonClass = computed(() => ({
  'btn-danger': props.type === 'error',
  'btn-warning': props.type === 'warning',
  'btn-info': props.type === 'info'
}))

const titleText = computed(() => {
  if (props.type === 'error') return ''
  if (props.type === 'warning') return ''
  return ''
})


</script>
