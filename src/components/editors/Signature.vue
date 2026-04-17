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
      <button class="btn btn-sm btn-outline-secondary me-2" type="button" @click="clear">清除</button>
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
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  modelValue: String,
  height: { type: Number, default: 120 },
  color: { type: String, default: '#000000' },
  background: { type: String, default: '#ffffff' },
  canReplay: { type: Boolean, default: false },
  onChange: Function
})

const emit = defineEmits(['update:modelValue'])

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
  drawing.value = true
  const pos = getMousePos(e)
  lastPos = pos
  ctx.value.beginPath()
  ctx.value.moveTo(pos.x, pos.y)
}

function draw(e) {
  if (!drawing.value) return
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
  }
}

function clear() {
  initCanvasStyle()
  emit('update:modelValue', '')
}

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

const canvasStyle = {
  width: '100%',
  border: '1px solid #ccc',
  backgroundColor: props.background,
  cursor: 'crosshair',
  touchAction: 'none' 
}
</script>

<style scoped>
.signature-wrapper canvas {
  display: block;
  width: 100%;
}
</style>
