<template>
  <div class="mauiscan-container">
    <div class="input-group">
      <input
        ref="inputRef"
        type="text"
        class="form-control bootstrap-mauiscan"
        :id="id"
        :value="modelValue"
        :disabled="readonly"
        @input="handleInput"
      />

      <span v-if="isAndroidApp" class="input-group-btn">
        <button
          class="btn btn-default form-btn glyphicon glyphicon-qrcode"
          style="top: 0"
          type="button"
          :disabled="readonly"
          @click="startAndroidScan"
        ></button>
      </span>

      <span v-else class="input-group-btn" :id="'scanText_' + id">
        <button
          v-show="scanning"
          class="btn btn-default form-btn glyphicon glyphicon-stop"
          style="top: 0"
          type="button"
          title="停止掃描"
          :disabled="readonly"
          @click="stopWebScan"
        ></button>
        <button
          v-show="!scanning"
          class="btn btn-default form-btn glyphicon glyphicon-qrcode"
          style="top: 0"
          type="button"
          title="開始掃描"
          :disabled="readonly"
          @click="startWebScan"
        ></button>
      </span>
    </div>

    <div
      v-if="!isAndroidApp && scanning"
      :id="'reader_' + id"
      class="reader-container"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  id: { type: String, required: true },
  readonly: { type: Boolean, default: false },
  onScan: { type: [Function, String], default: null },
  iosTimeoutMs: { type: Number, default: 15000 },
  qrboxSize: { type: Number, default: 180 }
});

const emit = defineEmits(['update:modelValue', 'change']);

const inputRef = ref(null);
const isAndroidApp = ref(false);
const scanning = ref(false);

let html5QrCode = null;
let scanTimer = null;

onMounted(() => {
  isAndroidApp.value =
    typeof window !== 'undefined' &&
    window.top.invokeCSharpAction !== undefined &&
    /Android/i.test(navigator.userAgent);

  registerGlobalMauiCallback();
});

onBeforeUnmount(() => {
  if (!isAndroidApp.value && scanning.value) {
    stopWebScan();
  }
  
  if (window.__mauiscan_registry) {
    delete window.__mauiscan_registry[props.id];
  }
});

const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
};

const processScanResult = (rawValue) => {
  let finalValue = rawValue;

  if (props.onScan) {
    if (typeof props.onScan === 'function') {
      finalValue = props.onScan(finalValue);
    } else if (typeof window[props.onScan] === 'function') {
      finalValue = window[props.onScan](finalValue);
    }
  }

  emit('update:modelValue', finalValue);
  emit('change', finalValue);
};


const startAndroidScan = () => {
  if (props.readonly) return;
  try {
    const paramStr = JSON.stringify({ 
      frameId: window.location.href, 
      resultID: props.id 
    });
    window.top.invokeCSharpAction(`scan(${paramStr})`);
  } catch (e) {
    alert('Scan function is for APP only.\n' + e);
  }
};

const startWebScan = async () => {
  if (props.readonly || scanning.value) return;
  scanning.value = true;

  await nextTick();

  // index.html引入Html5Qrcode
  if (typeof Html5Qrcode === 'undefined') {
    alert('請先載入 Html5Qrcode 套件');
    scanning.value = false;
    return;
  }

  setTimeout(() => {
    try {
      html5QrCode = new Html5Qrcode('reader_' + props.id, {
        verbose: false,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true }
      });

      Html5Qrcode.getCameras().then((devices) => {
        let cameraConfig = { facingMode: { exact: 'environment' } };
        if (devices && devices.length) {
          let backId = null;
          for (let i = 0; i < devices.length; i++) {
            const label = (devices[i].label || '').toLowerCase();
            if (/back|rear|environment|後/.test(label)) {
              backId = devices[i].id;
              break;
            }
          }
          cameraConfig = backId ? { deviceId: { exact: backId } } : { deviceId: { exact: devices[0].id } };
        }
        executeWebScan(cameraConfig);
      }).catch(() => {
        executeWebScan({ facingMode: 'environment' });
      });
    } catch (err) {
      alert('無法初始化 Html5Qrcode：' + err);
      stopWebScan();
    }
  }, 50);
};

const executeWebScan = (cameraConfig) => {
  const config = {
    fps: 10,
    qrbox: { width: props.qrboxSize, height: props.qrboxSize },
    rememberLastUsedCamera: true
  };

  html5QrCode.start(
    cameraConfig,
    config,
    (decodedText) => {
      processScanResult(decodedText);
      stopWebScan();
    },
    () => {  }
  ).then(() => {
    patchVideoAttributes();
    // iOS Timeout
    scanTimer = setTimeout(() => { stopWebScan(); }, props.iosTimeoutMs);
  }).catch((err) => {
    alert('無法啟動相機：' + err);
    stopWebScan();
  });
};

const stopWebScan = () => {
  if (!scanning.value && !html5QrCode) return;
  
  if (scanTimer) {
    clearTimeout(scanTimer);
    scanTimer = null;
  }

  const finalize = () => {
    try { if (html5QrCode) html5QrCode.clear(); } catch (_) {}
    html5QrCode = null;
    scanning.value = false;
  };

  if (html5QrCode) {
    html5QrCode.stop().then(finalize).catch(() => finalize());
  } else {
    finalize();
  }
};

// 修正 iOS Safari 上 Video 需要的屬性
const patchVideoAttributes = () => {
  const videoElements = document.querySelectorAll(`#reader_${props.id} video`);
  videoElements.forEach((v) => {
    v.setAttribute('playsinline', 'true');
    v.setAttribute('webkit-playsinline', 'true');
    v.setAttribute('muted', 'true');
    v.setAttribute('autoplay', 'true');
    v.muted = true;
    v.style.transform = 'none';
    if (v.paused) {
      try { v.play().catch(() => {}); } catch (_) {}
    }
  });
};

const registerGlobalMauiCallback = () => {
  window.__mauiscan_registry = window.__mauiscan_registry || {};
  window.__mauiscan_registry[props.id] = processScanResult;

  if (typeof window.top.SetcontrolValue === 'undefined') {
    window.top.SetcontrolValue = function (params) {
      const param = params.param;
      const data = params.data;
      
      // iframe遞迴
      const length = window.parent.frames.length;
      if (length > 0) {
        for (let i = 0; i < length; i++) {
          if (window.parent.frames[i].location.href === param.frameId) {
             if (typeof window.parent.frames[i].setcontrolValue === 'function') {
                window.parent.frames[i].setcontrolValue(param.resultID, data);
             }
          }
        }
      } else {
         if (typeof window.setcontrolValue === 'function') {
           window.setcontrolValue(param.resultID, data);
         }
      }
    };
  }

  if (typeof window.setcontrolValue === 'undefined') {
    window.setcontrolValue = function (rid, value) {
      const handler = window.__mauiscan_registry[rid];
      if (handler) {
        handler(value);
      } else {
        console.warn(`[Mauiscan] 找不到 ID 為 ${rid} 的掃描元件`);
      }
    };
  }
};
</script>

<style scoped>
.mauiscan-container {
  width: 100%;
}
.reader-container {
  width: 100%;
  max-width: 480px;
  height: 260px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  margin-top: 6px;
}
.reader-container :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>