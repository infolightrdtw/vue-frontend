<template>
  <div class="bootstrap-htmleditor" :class="{ 'is-readonly': disabled || readonly }">
    <div 
      v-show="!(disabled || readonly)" 
      ref="toolbarContainer" 
      class="editor-toolbar"
    ></div>
    
    <div 
      ref="editorContainer" 
      class="editor-content" 
      :style="{ height: `${height}px`, 'overflow-y': 'hidden' }"
    ></div>
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { ref, shallowRef, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { createEditor, createToolbar, i18nChangeLanguage } from '@wangeditor/editor' // 💡 引入 WangEditor 的 i18n API
import pageUtils from '@/utils/pageApi' // 💡 引入 EEP 多國語言工具

const props = defineProps({
  modelValue: { type: String, default: '' },
  height: { type: [Number, String], default: 200 },
  imageHeight: { type: [Number, String], default: 150 },
  imageFolder: { type: String, default: '' },
  htmlAvailable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  validType: { type: String, default: '' },
  customRules: { type: Object, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'change', 'validate'])

import { validate as runValidate } from '@/composables/useValidator'


const currentLang = (localStorage.getItem('user-language') || 'zh-tw').toLowerCase()
if (currentLang.startsWith('en') || currentLang === 'ja-jp' || currentLang === 'ko-kr') {
  i18nChangeLanguage('en') // 非中文語系退回英文
} else {
  i18nChangeLanguage('zh-CN') // WangEditor 預設原生支援簡中 (繁中亦通用此介面配置)
}

const $this = pageUtils({}, {})
const lm = computed(() => $this.localeMessages?.value || {})

const toolbarContainer = ref(null)
const editorContainer = ref(null)
const editorRef = shallowRef(null)
let isUpdating = false 

const parseIncomingHtml = (val) => {
  let safe = val || ''
  safe = safe.replace(/\s+onclick="\$\.showPreviewDialog\('[^']*'\)"/g, '')
  safe = safe.replace(/\s+_src="[^"]*"/g, '')
  return safe
}
const formatOutgoingHtml = (val) => val || ''

onMounted(() => {
  const uploadUrl = props.imageFolder 
    ? `../../file/umimage?f=${props.imageFolder}` 
    : '../../file/umimage'

  const editor = createEditor({
    selector: editorContainer.value,
    html: parseIncomingHtml(props.modelValue),
    config: {
      placeholder: lm.value.inputContent || '請輸入內容...', 
      readOnly: props.disabled || props.readonly,
      MENU_CONF: {
        uploadImage: {
          server: uploadUrl,
          customInsert(res, insertFn) {
            const imgUrl = res.url || res.data?.url || res.originalName
            if (imgUrl) {
              insertFn(imgUrl, 'image', imgUrl)
            } else {
              console.error('[Htmleditor] 圖片上傳解析失敗:', res)
            }
          }
        }
      },
      onChange: (editor) => {
        isUpdating = true
        const rawHtml = editor.getHtml()
        
        if (rawHtml === '<p><br></p>') {
          emit('update:modelValue', '')
          emit('change', '')
        } else {
          const finalHtml = formatOutgoingHtml(rawHtml)
          emit('update:modelValue', finalHtml)
          emit('change', finalHtml)
        }
        
        setTimeout(() => { isUpdating = false }, 0)
      }
    }
  })
  
  editorRef.value = editor

  createToolbar({
    editor,
    selector: toolbarContainer.value,
    config: {
      toolbarKeys: [
        'bold', 'italic', 'underline', 'through', '|',
        'color', 'bgColor', '|',
        'clearStyle', '|',
        'justifyLeft', 'justifyCenter', 'justifyRight', '|',
        'fontSize', 'fontFamily', '|',
        'insertLink', 'uploadImage', '|',
        'undo', 'redo'
      ]
    }
  })
})

watch(() => props.modelValue, (newVal) => {
  if (isUpdating || !editorRef.value) return
  
  const currentHtml = formatOutgoingHtml(editorRef.value.getHtml())
  if (newVal !== currentHtml) {
    editorRef.value.setHtml(parseIncomingHtml(newVal))
  }
})

watch([() => props.disabled, () => props.readonly], ([isDisabled, isReadonly]) => {
  if (!editorRef.value) return
  if (isDisabled || isReadonly) {
    editorRef.value.disable()
  } else {
    editorRef.value.enable()
  }
})

onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.destroy()
    editorRef.value = null
  }
})

function validate () {
  const v = props.modelValue || ''
  let msg = ''
  if (props.required && String(v).replace(/<[^>]*>/g, '').trim() === '') {
    msg = 'required'
  } else if (props.validType && v) {
    msg = runValidate(props.validType, String(v), props.customRules)
  }
  emit('validate', msg)
  return msg
}

defineExpose({
  getValue: () => formatOutgoingHtml(editorRef.value?.getHtml()),
  setValue: (val) => editorRef.value?.setHtml(parseIncomingHtml(val)),
  validate
})
</script>

<style scoped>
.bootstrap-htmleditor {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  background-color: #fff;
  z-index: 100;
}

.editor-toolbar {
  border-bottom: 1px solid #ced4da;
  background-color: #f8f9fa;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}

.editor-content {
  background-color: #fff;
  border-bottom-left-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}

.bootstrap-htmleditor.is-readonly {
  background-color: #e9ecef;
}

.bootstrap-htmleditor.is-readonly .editor-content {
  background-color: #e9ecef;
  color: #495057;
}

:deep(.w-e-toolbar .w-e-bar-item-full-screen) {
  display: none;
}
</style>