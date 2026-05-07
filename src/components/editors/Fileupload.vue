<template>
  <div class="file-upload input-group has-addon">
    <span class="form-control d-flex align-items-center justify-content-start">
      <template v-if="displayName">
        <FileImage v-if="isImage && fileName" :fileName="fileName" :folder="folderRef" :style="{ height: '28px', marginRight: '2px' }" />
        <span class="file-name">
          <FileLink :fileName="fileName" :folder="folderRef">{{ displayName }}</FileLink>
        </span>
        <button
          v-if="editable && !isDisabled"
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
      class="btn btn-outline-secondary fileupload-btn"
      type="button"
      :disabled="isDisabled"
      title="選擇檔案"
      @click="pickFile"
    >
      <i class="bi bi-folder2-open"></i>
    </button>
    <input ref="fileInput" type="file" class="d-none" @change="onFileChange" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import dataUtils from '@/utils/dataApi'
import FileLink from '@/html/FileLink.vue'
import FileImage from '@/html/FileImage.vue'
import { validate as runValidate } from '@/composables/useValidator'

const props = defineProps({
  modelValue: { type: [String, Object, null], default: null },
  folder: { type: String, default: '' },
  showType: { type: String, default: 'url' },
  dataType: { type: String, default: 'url' },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  editable: { type: Boolean, default: true },
  uploadOnSave: { type: Boolean, default: false },
  isAutoNum: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  dropEnable: { type: Boolean, default: false },
  filter: { type: String, default: '' },
  compressRate: { type: Number, default: 1 },
  sizeLimit: { type: Number, default: 5 },
  appCapture: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  validType: { type: String, default: '' },
  customRules: { type: Object, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'uploaded', 'cleared', 'error', 'validate'])

const { uploadFile } = dataUtils()
const folderRef = ref(props.folder || 'vueFile')
watch(() => props.folder, (v) => { folderRef.value = v || 'vueFile' })

const fileInput = ref(null)
const displayName = ref('')
const fileUrlState = ref('')
const errorMessage = ref('')

const isDisabled = computed(() => props.disabled || props.readonly)

const fileName = computed(() => {
  if (displayName.value) return displayName.value
  const mv = props.modelValue
  if (!mv) return ''
  if (typeof mv === 'string') return mv
  if (typeof mv === 'object') return mv.name || mv.fileName || mv.filename || ''
  return ''
})

const isImage = computed(() => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName.value || ''))

function parseInitial (val) {
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

watch(() => props.modelValue, parseInitial, { immediate: true })

function pickFile () {
  if (isDisabled.value) return
  fileInput.value && fileInput.value.click()
}

async function onFileChange (e) {
  const file = e?.target?.files?.[0]
  if (!file) return
  try {
    const res = await uploadFile(file, { folder: folderRef.value })
    const name = (res && (res.name || res.fileName || res.filename)) || file.name
    const url = (res && (res.url || res.href)) || ''

    displayName.value = name
    fileUrlState.value = url

    emit('update:modelValue', url ? { name, url } : name)
    emit('uploaded', res)
    validate()
  } catch (err) {
    console.error('uploadFile error:', err)
    emit('error', err)
  } finally {
    if (e?.target) e.target.value = ''
  }
}

function clearFile () {
  if (isDisabled.value) return
  displayName.value = ''
  fileUrlState.value = ''
  emit('update:modelValue', null)
  emit('cleared')
  validate()
}

function validate () {
  let msg = ''
  if (props.required && !fileName.value) {
    msg = 'required'
  } else if (props.validType && fileName.value) {
    msg = runValidate(props.validType, fileName.value, props.customRules)
  }
  errorMessage.value = msg
  emit('validate', msg)
  return msg
}


function getValue () { return props.modelValue ?? null }
function setValue (v) {
  emit('update:modelValue', v ?? null)
  parseInitial(v)
}
function getUrl () {
  if (fileUrlState.value) return fileUrlState.value
  const name = fileName.value
  if (!name) return ''
  const folder = folderRef.value || ''
  return `../file?q=${encodeURIComponent(name)}${folder ? `&f=${encodeURIComponent(folder)}` : ''}`
}
function options () {
  return {
    folder: folderRef.value,
    showType: props.showType,
    dataType: props.dataType,
    readonly: props.readonly,
    editable: props.editable,
    uploadOnSave: props.uploadOnSave,
    multiple: props.multiple,
    sizeLimit: props.sizeLimit,
    compressRate: props.compressRate
  }
}

function editImage () {
  if (!isImage.value) return
  pickFile()
}

defineExpose({
  validate,
  clearFile,
  pickFile,
  getValue,
  setValue,
  getUrl,
  options,
  editImage
})
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
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 .375rem .375rem 0;
}
</style>
