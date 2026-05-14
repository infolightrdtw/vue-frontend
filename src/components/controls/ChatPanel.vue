<template>
  <div class="panel-group bootstrap-chatpanel" :id="id">
    <div class="panel panel-primary">
      
      <div class="panel-heading">
        <h5 class="panel-title">
          {{ title || '&nbsp;' }}
          <a class="pull-right"
             tabindex="0"
             data-bs-toggle="collapse"
             :href="`#${id}_panel`">
            <i class="bi bi-chevron-down"></i>
          </a>
        </h5>
      </div>

      <div class="panel-collapse collapse show" :id="`${id}_panel`">
        
        <div class="panel-body chat-panel" ref="chatPanelRef" :style="{ height: `${height}px`, overflowY: 'auto' }">
          
          <div class="clearfix">
            <button class="btn btn-sm btn-primary chat-clear pull-right" @click="clearChat">
              {{ lm.clear}}
            </button>
            <select v-if="typeItems && typeItems.length" 
                    v-model="selectedType" 
                    style="width:120px; margin-right:10px" 
                    class="form-control type-combo pull-right">
              <option v-for="item in typeItems" :key="item.value" :value="item.value">
                {{ item.text }}
              </option>
            </select>
          </div>

          <div v-for="(msg, index) in messages" :key="index" :class="['clearfix', msg.from]">
            <div class="chat-icon" :class="getIconCls(msg.from)"></div>
            
            <img v-if="msg.isImage" 
                 class="imgzoom" 
                 style="height:128px; cursor: pointer;" 
                 :src="msg.imageSrc" 
                 @click="openImageModal(msg.imageSrc)" />
            
            <div v-else class="chat-message" v-html="formatMessage(msg)"></div>
          </div>

          <div v-if="isProcessing" class="clearfix ai processing">
            <div class="chat-icon" :class="getIconCls('ai')"></div>
            <div class="chat-message">{{ processingText }}</div>
          </div>

        </div>

        <div class="modal-footer form-buttons">
          <div class="input-group">
            <input type="text" 
                   class="form-control chat-text" 
                   v-model="inputText" 
                   :placeholder="placeHolder || lm.placeholder" 
                   :disabled="isProcessing"
                   @keydown.enter.prevent="sendChat" 
                   @blur="handleInputBlur" />
            <span class="input-group-btn">
              <input type="file" 
                     ref="fileInputRef" 
                     style="display: none;" 
                     @change="handleFileChange" />

              <button class="btn btn-outline-secondary file-submit form-btn"
                      tabindex="-1" style="top:0"
                      :disabled="isProcessing"
                      @click="submitFile"
                      :title="lm.uploading">
                <i class="bi bi-folder2-open"></i>
              </button>
              <button class="btn btn-primary chat-send"
                      tabindex="-1" style="top:0"
                      :disabled="isProcessing"
                      @click="sendChat">
                {{ lm.send }}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="imgZoomModal" tabindex="-1" role="dialog" :class="{ show: isZoomModalOpen }" :style="{ display: isZoomModalOpen ? 'block' : 'none' }">
      <div class="modal-dialog draggable">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="btn-close" @click="closeImageModal" aria-label="Close"></button>
            <h4 class="modal-title">&nbsp;</h4>
          </div>
          <div class="modal-body text-center">
            <img class="img-responsive" :src="zoomImageSrc" style="max-width: 100%; display: inline-block;" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="isZoomModalOpen" class="modal-backdrop fade in"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import pageUtils from '@/utils/pageApi';

const $this = pageUtils({}, {});
const lm = computed(() => $this.localeMessages?.value || {});

const props = defineProps({
  id: { type: String, default: 'chatPanel' },
  title: { type: String, default: 'Chat' },
  helloWorld: { type: String, default: '' },
  userIconCls: { type: String, default: 'fa-user' },
  gptIconCls: { type: String, default: 'fa-android' },
  placeHolder: { type: String, default: '' },
  proc: { type: String, default: '' },
  keepHistory: { type: Boolean, default: false },
  height: { type: Number, default: 400 },
  compressRate: { type: Number, default: 0 },
  uploadKey: { type: String, default: '' }, 
  typeItems: { type: Array, default: () => [] },
  endingWord: { type: String, default: '' },
  onLoad: { type: Function, default: null },
  onSend: { type: Function, default: null },
  onReceive: { type: Function, default: null }
});

const messages = ref([]);
const inputText = ref('');
const isProcessing = ref(false);
const processingText = ref('');
const selectedType = ref('');
const isEndWordReached = ref(false);
const attachedImage = ref('');

const chatPanelRef = ref(null);
const fileInputRef = ref(null);
const isZoomModalOpen = ref(false);
const zoomImageSrc = ref('');
let processingInterval = null;

onMounted(() => {
  if (props.onLoad) props.onLoad();
  if (props.typeItems && props.typeItems.length) selectedType.value = props.typeItems[0].value;
  if (props.helloWorld) appendChat('example', props.helloWorld, true);
});

const appendChat = (from, value, isHtml = false) => {
  const isImage = value.indexOf('img:') >= 0;
  let imageSrc = '';
  if (isImage) {
    const base64Data = value.replace('img:', '');
    imageSrc = `data:image/png;base64,${base64Data}`;
  }
  messages.value.push({ from, value, isHtml, isImage, imageSrc });
  scrollToBottom();
};

const formatMessage = (msg) => {
  if (msg.isHtml) return msg.value;
  return msg.value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
};

const getIconCls = (from) => {
  let icon = from === 'user' ? props.userIconCls : props.gptIconCls;
  if (!icon) return '';
  // accept legacy glyphicon-* (mapped to bi-* fallback) / bi-* / fa-* / raw class
  if (icon.match(/^glyphicon-/)) return `bi ${icon.replace(/^glyphicon-/, 'bi-')}`;
  if (icon.match(/^bi-/)) return `bi ${icon}`;
  if (icon.match(/^fa-/)) return `fa ${icon}`;
  return icon;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatPanelRef.value) chatPanelRef.value.scrollTop = chatPanelRef.value.scrollHeight;
  });
};

const clearChat = () => {
  if (props.onLoad) props.onLoad();
  messages.value = [];
  if (props.helloWorld) appendChat('example', props.helloWorld, true);
};

const getLastText = () => {
  let texts = [];
  const filteredMessages = props.keepHistory 
    ? messages.value.filter(m => m.from === 'ai' || m.from === 'user')
    : [messages.value.slice().reverse().find(m => m.from === 'ai')].filter(Boolean);

  filteredMessages.forEach(msg => {
    texts.push(`${msg.from}:${msg.value}`);
  });
  return texts.join('\r\n');
};

const sendChat = async () => {
  let text = inputText.value.trim();
  if (!text) return;

  if (props.onSend) {
    const r = props.onSend(text);
    if (r === false) return;
    if (typeof r === 'string') text = r;
  }

  messages.value = messages.value.filter(m => m.from !== 'example');
  const lastText = getLastText();
  appendChat('user', text);
  inputText.value = '';

  startProcessing();

  try {
    let result = await callApiMainData({
      chat: text,
      image: attachedImage.value,
      last: lastText,
      type: selectedType.value
    });

    if (props.onReceive) {
      const r = props.onReceive(result);
      if (r === false) return;
      if (typeof r === 'string') result = r;
    }

    if (props.endingWord && result.includes(props.endingWord)) {
      result = result.replace(props.endingWord, '');
      isEndWordReached.value = true;
    }

    appendChat('ai', result);
  } catch (err) {
    appendChat('error', err.message || lm.value.error);
  } finally {
    stopProcessing();
  }
};

const callApiMainData = async (payload) => {
  const url = '/api/apiMain/Data';
  const params = new URLSearchParams();
  params.append('mode', 'callProcessorMethod');
  params.append('id', props.proc);
  params.append('parameters', JSON.stringify(payload));

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API error: ${response.status}`);
  }

  return await response.text();
};

const startProcessing = () => {
  isProcessing.value = true;
  const baseText = lm.value.processing;
  processingText.value = baseText;
  let dots = 1;
  processingInterval = setInterval(() => {
    processingText.value = baseText + '.'.repeat(dots);
    dots = dots >= 3 ? 1 : dots + 1;
  }, 600);
  scrollToBottom();
};

const stopProcessing = () => {
  isProcessing.value = false;
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
  }
};

const handleInputBlur = () => {
  if (isEndWordReached.value) {
    isEndWordReached.value = false;
    clearChat();
  }
};

const setExternalValue = (value) => {
  const values = value.split(/;|,/).filter(n => n !== '');
  if (!values.length) return;
  const textVal = values[0];
  if (textVal && textVal.includes('img:')) {
    attachedImage.value = textVal;
    messages.value = messages.value.filter(m => m.from !== 'example');
    appendChat('user', textVal);
  }
};

const submitFile = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const sizeLimit = 30;
  if (file.size / 1048576 > sizeLimit) {
    alert(lm.value.fileSizeLimit);
    event.target.value = ''; 
    return;
  }

  isProcessing.value = true;
  processingText.value = lm.value.uploading;

  try {
    if (props.compressRate && props.compressRate !== 1.00 && file.type.startsWith('image')) {
      await handleCompressedUpload(file);
    } else {
      await readAndSetImage(file);
    }
  } catch (err) {
    console.error('file error:', err);
    alert(err.message || lm.value.error || 'error');
  } finally {
    isProcessing.value = false;
    event.target.value = ''; 
  }
};

const readAndSetImage = (fileToRead) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = reader.result.split(',')[1];
      setExternalValue('img:' + base64Str);
      resolve();
    };
    reader.onerror = () => reject(new Error('file loading error'));
    reader.readAsDataURL(fileToRead);
  });
};

const handleCompressedUpload = (file) => {
  return new Promise((resolve, reject) => {
    if (typeof window.compressImage === 'function') {
      window.compressImage(file, props.compressRate, async (compressedBlob) => {
        if (!compressedBlob) {
          return reject(new Error('Compress Failed'));
        }

        const newFile = new File([compressedBlob], file.name, { type: file.type });
        const formData = new FormData();
        formData.append('file', newFile);
        
        if (props.uploadKey) {
          formData.set('uploadKey', props.uploadKey);
          // formData.set('filter', allFilter);
        }

        try {
          const response = await fetch('../file', {
            method: 'POST',
            body: formData
          });
          const res = await response.json();
          
          if (res.length > 0) {
            await readAndSetImage(newFile);
            resolve(res[0].name);
          } else {
            if (res.error) alert(res.error);
            resolve('');
          }
        } catch (e) {
          reject(e);
        }
      });
    } else {
      readAndSetImage(file).then(resolve).catch(reject);
    }
  });
};

const openImageModal = (src) => {
  zoomImageSrc.value = src;
  isZoomModalOpen.value = true;
};

const closeImageModal = () => {
  isZoomModalOpen.value = false;
  zoomImageSrc.value = '';
};

defineExpose({
  clearChat,
  sendChat,
  setExternalValue
});
</script>

<style scoped>
.chat-panel {
  position: relative;
  background-color: #f9f9f9;
}
.chat-message {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 6px;
  margin: 5px;
  max-width: 80%;
  word-wrap: break-word;
}
.user .chat-message { background-color: var(--theme-table-bg); float: right; }
.ai .chat-message, .example .chat-message { background-color: #fff; border: 1px solid #ddd; float: left; }
.error .chat-message { background-color: #f2dede; color: #a94442; float: left; }
.chat-icon { margin: 10px 5px; font-size: 1.2em; }
.user .chat-icon { float: right; }
.ai .chat-icon, .example .chat-icon, .processing .chat-icon { float: left; }
.processing .chat-message { background-color: transparent; border: none; color: #888; font-style: italic; }
.modal-backdrop { opacity: 0.5; }
</style>