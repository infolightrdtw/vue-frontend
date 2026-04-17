<template>
  <div 
    v-if="visible" 
    class="modal fade show d-block bootstrap-promptdialog" 
    tabindex="-1" 
    role="dialog" 
    style="background: rgba(0,0,0,0.5); overflow-y: auto;"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button 
            type="button" 
            class="close btn-close" 
            @click="cancel" 
            aria-label="Close"
          >
            <span aria-hidden="true" v-if="!isBootstrap5">&times;</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="row">
            <template v-for="(col, index) in columns" :key="index">
              <div v-if="col.newRow" class="w-100"></div>
              
              <div :class="getColumnWrapperClass(col.span)">
                <div class="form-group row mb-3 align-items-center">
                  
                  <label class="col-sm-4 col-form-label text-sm-right text-muted">
                    {{ col.title }}
                  </label>
                  
                  <div class="col-sm-8">
                    <input 
                      v-if="col.editor?.type !== 'checkbox'" 
                      v-model="formData[col.field]" 
                      :type="col.editor?.type || 'text'"
                      class="form-control form-field" 
                      :readonly="col.editor?.readonly"
                    />
                    
                    <div v-else class="form-check pt-1">
                      <input 
                        v-model="formData[col.field]" 
                        type="checkbox"
                        class="form-check-input form-field" 
                        :disabled="col.editor?.readonly"
                        :id="'check_' + col.field"
                      />
                    </div>
                  </div>
                  
                </div> 
              </div>
            </template>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary form-ok" @click="ok">
            {{ okText }}
          </button>
          <button type="button" class="btn btn-secondary form-cancel" @click="cancel">
            {{ cancelText }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const props = defineProps({
  title: { type: String, default: 'Prompt' },
  columns: { type: Array, default: () => [] },
  horizontalColumnsCount: { type: Number, default: 1 }, 
  mode: { type: String, default: 'dialog' },
  okText: { type: String, default: '確認' },
  cancelText: { type: String, default: '取消' },
  isBootstrap5: { type: Boolean, default: true }
});

const visible = ref(false);
const formData = reactive({});
const callbacks = ref({ onOK: null, onCancel: null });

const getColumnWrapperClass = computed(() => (span = 1) => {
  const baseColWidth = 12 / props.horizontalColumnsCount;
  const actualColWidth = Math.min(12, baseColWidth * span);
  return `col-md-${actualColWidth}`;
});

const show = (callbackConfig) => {
  clear(); 
  if (typeof callbackConfig === 'function') {
    callbacks.value.onOK = callbackConfig;
  } else if (typeof callbackConfig === 'object') {
    callbacks.value.onOK = callbackConfig.onOK;
    callbacks.value.onCancel = callbackConfig.onCancel;
  }
  visible.value = true;
};

const getRow = () => {
  return { ...formData };
};

const ok = () => {
  if (callbacks.value.onOK) {
    callbacks.value.onOK(getRow());
  }
  visible.value = false;
};

const cancel = () => {
  if (callbacks.value.onCancel) {
    callbacks.value.onCancel();
  }
  visible.value = false;
};

const clear = () => {
  props.columns.forEach(col => {
    if (col.editor?.type === 'checkbox') {
      formData[col.field] = false;
    } else {
      formData[col.field] = '';
    }
  });
};

defineExpose({ show, getRow, ok, cancel, clear });
</script>

<style scoped>
.bootstrap-promptdialog {
  z-index: 1050;
}

@media (min-width: 576px) {
  .text-sm-right {
    text-align: right;
  }
}
</style>