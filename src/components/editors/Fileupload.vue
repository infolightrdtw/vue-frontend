<template>
  <div class="file-upload input-group has-addon">
    <span class="form-control d-flex align-items-center justify-content-start">
      <template v-if="displayName">      
        <FileImage v-if="isImage && fileName" :fileName="fileName" :folder="folder" :style="{ height: '28px', marginRight: '2px' }" />
        <span v-if="displayName" class="file-name"><FileLink :fileName="fileName" :folder="folder">{{ displayName }}</FileLink></span>
        <button
          v-if="editable"
          class="btn-close ms-2"
          type="button"
          aria-label="清除"
          @click="clearFile"
        ></button>
      </template>
      <template v-else>
        <span class="text-muted"></span>
      </template>
        </span>
    <button
      class="btn btn-outline-secondary fileupload-btn form-btn file-submit glyphicon glyphicon-folder-open"
      type="button"
      @click="pickFile"
      title="選擇檔案"
    >
      <!-- 這裡不要放任何文字或 icon，全部交給 CSS / icon font 決定 -->
    </button>
    <input ref="fileInput" type="file" class="d-none" @change="onFileChange" />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import dataUtils from '@/utils/dataApi'
import FileLink from '@/html/FileLink.vue'
import FileImage from '@/html/FileImage.vue'

const props = defineProps({
    folder: { type: String, default: '' },
    showType: { type: String, default: 'url' },
    dataType: { type: String, default: 'url' },
    readonly: { type: Boolean, default: false },
    editable: { type: Boolean, default: true },
    uploadOnSave: { type: Boolean, default: false },
    isAutoNum: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    dropEnable: { type: Boolean, default: false },
    filter: { type: String, default: '' },
    compressRate: { type: Number, default: 1 },
    sizeLimit: { type: Number, default: 5 },
    appCapture: { type: Boolean, default: false },
})

const modelValue = ref(null) 
const downloadBase = ref('')
const fileUrl = ref('') 

const emit = defineEmits(['update:modelValue','uploaded','cleared','error'])

const { uploadFile } = dataUtils()
const folder = ref(props.folder || '')
watch(
  () => props.folder,
  (v) => {
    folder.value = v || 'vueFile'
  }
)

const fileInput = ref(null)
const displayName = ref('')
const fileUrlState = ref('vueFile')

const fileName = computed(() => {
  if (displayName.value) return displayName.value
  const mv = modelValue
  if (!mv) return ''
  if (typeof mv === 'string') return mv
  if (mv && typeof mv === 'object') return mv.name || mv.fileName || mv.filename || ''
  return ''
})

const isImage = computed(() => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName.value || ''))

function parseInitial(val) {
  if (!val) {
    displayName.value = ''
    fileUrlState.value = ''
    return
  }
  if (typeof val === 'string') {
    displayName.value = val
    fileUrlState.value = ''
  } else if (typeof val === 'object') {
    displayName.value = val.name || val.fileName || val.filename || val.title || ''
    fileUrlState.value = val.url || ''
  }
}

watch(() => modelValue, (val) => {
  parseInitial(val)
}, { immediate: true })

const fileHref = computed(() => {
  if (fileUrl) return fileUrl
  if (fileUrlState.value) return fileUrlState.value
  if (downloadBase && displayName.value) {
    const base = downloadBase.endsWith('/') ? downloadBase.slice(0, -1) : downloadBase
    const name = encodeURIComponent(displayName.value)
    return `${base}/${name}`
  }
  return '#'
})

function pickFile() {
  fileInput.value && fileInput.value.click()
}

async function onFileChange(e) {
  const file = e?.target?.files?.[0]
  if (!file) return
  try {
    const res = await uploadFile(file, { folder: folder.value })

    const name = (res && (res.name || res.fileName || res.filename)) || file.name
    const url  = (res && (res.url || res.href)) || ''

    displayName.value = name
    fileUrlState.value = url

    emit('update:modelValue', url ? { name, url } : name)
    emit('uploaded', res)
  } catch (err) {
    console.error('uploadFile error:', err)
    emit('error', err)
  } finally {
    if (e?.target) e.target.value = ''
  }
}

function clearFile() {
  displayName.value = ''
  fileUrlState.value = ''
  emit('update:modelValue', null)
  emit('cleared')
}
</script>

<style scoped>
.file-upload {
  font-size: 14px;
}

.file-upload .form-control {
  padding: 6px 10px;
  min-height: 32px;
}

.file-upload .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}


.file-name {
  opacity: .9;
}

.btn-close {
  float: none;
}

.fileupload-btn {
  padding-top: 0;    
  padding-bottom: 0;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  display: flex;         
  align-items: center;    
  justify-content: center; 
  box-sizing: border-box;
  border-radius: 0 .375rem .375rem 0;
}
</style>

