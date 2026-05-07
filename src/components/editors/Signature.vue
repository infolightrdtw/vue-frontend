<template>
  <div class="signature-wrapper">
    <canvas
      ref="canvasRef"
      :height="height"
      :style="canvasStyle"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
    />
    <div class="mt-2">
      <button class="btn btn-sm btn-outline-secondary me-2" type="button" :disabled="isDisabled" @click="clear">清除</button>
      <button
        v-if="canReplay && history.length"
        class="btn btn-sm btn-outline-secondary"
        type="button"
        @click="replay"
      >
        回放
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { validate as runValidate } from '@/composables/useValidator'

const props = defineProps({
  modelValue: String,
  height: { type: Number, default: 120 },
  color: { type: String, default: '#000000' },
  background: { type: String, default: '#ffffff' },
  canReplay: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  validType: { type: String, default: '' },
  customRules: { type: Object, default: undefined },
  onChange: Function
})

const emit = defineEmits(['update:modelValue', 'validate'])

const isDisabled = computed(() => props.disabled || props.readonly)
const errorMessage = ref('')

const canvasRef = ref(null)
const ctx = ref(null)
const drawing = ref(false)
const history = ref([])
let lastPos = { x: 0, y: 0 }
let resizeObserver = null

onMounted(() => {
  nextTick(() => {
    const canvas = canvasRef.value
    if (!canvas) return 

    ctx.value = canvas.getContext('2d')

    resizeObserver = new ResizeObserver(() => {
      if (canvas.offsetWidth > 0) {
        canvas.width = canvas.offsetWidth
        initCanvasStyle()
        
        if (props.modelValue) {
          const img = new Image()
          img.src = props.modelValue
          img.onload = () => ctx.value.drawImage(img, 0, 0)
        }
      }
    })
    resizeObserver.observe(canvas)
  })
})

onBeforeUnmount(() => {
  if (resizeObserver && canvasRef.value) {
    resizeObserver.unobserve(canvasRef.value)
  }
})

function initCanvasStyle() {
  const canvas = canvasRef.value
  if (!canvas || !ctx.value) return
  ctx.value.fillStyle = props.background
  ctx.value.fillRect(0, 0, canvas.width, canvas.height)
  ctx.value.strokeStyle = props.color
  ctx.value.lineWidth = 2
  ctx.value.lineCap = 'round'
}

function startDrawingTouch(e) {
  if (e.touches.length > 0) startDrawing(e.touches[0])
}
function drawTouch(e) {
  if (e.touches.length > 0) draw(e.touches[0])
}

function startDrawing(e) {
  if (isDisabled.value) return
  drawing.value = true
  const pos = getMousePos(e)
  lastPos = pos
  ctx.value.beginPath()
  ctx.value.moveTo(pos.x, pos.y)
}

function draw(e) {
  if (!drawing.value || isDisabled.value) return
  const pos = getMousePos(e)
  ctx.value.lineTo(pos.x, pos.y)
  ctx.value.stroke()
  lastPos = pos
}

function stopDrawing() {
  if (!drawing.value) return
  drawing.value = false
  ctx.value.closePath()
  if (canvasRef.value) {
    const dataUrl = canvasRef.value.toDataURL()
    history.value.push(dataUrl)
    emit('update:modelValue', dataUrl)
    props.onChange?.(dataUrl)
    validate()
  }
}

function clear() {
  if (isDisabled.value) return
  initCanvasStyle()
  emit('update:modelValue', '')
  validate()
}

function validate () {
  const v = props.modelValue || ''
  let msg = ''
  if (props.required && String(v).trim() === '') {
    msg = 'required'
  } else if (props.validType && v) {
    msg = runValidate(props.validType, String(v), props.customRules)
  }
  errorMessage.value = msg
  emit('validate', msg)
  return msg
}

defineExpose({
  validate,
  clear,
  reset: clear,
  replay,
  getUrl:   () => canvasRef.value?.toDataURL?.() ?? '',
  getValue: () => props.modelValue ?? '',
  setValue: (v) => { emit('update:modelValue', v ?? '') },
  options:  () => ({
    height: props.height,
    color: props.color,
    background: props.background,
    canReplay: props.canReplay
  })
})

function getMousePos(e) {
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function replay() {
  if (!props.canReplay || !history.value.length) return
  const img = new Image()
  img.src = history.value[history.value.length - 1]
  img.onload = () => {
    clear()
    ctx.value.drawImage(img, 0, 0)
  }
}

const canvasStyle = computed(() => ({
  width: '100%',
  border: '1px solid #ccc',
  backgroundColor: props.background,
  cursor: isDisabled.value ? 'not-allowed' : 'crosshair',
  touchAction: 'none',
  pointerEvents: isDisabled.value ? 'none' : 'auto'
}))
</script>

<style scoped>
.signature-wrapper canvas {
  display: block;
  width: 100%;
}
</style>
