<template>
  <Teleport to="body" v-if="activeMode === 'table' || activeMode === 'dialog'">
    <div 
      class="modal fade" 
      :id="modalId" 
      tabindex="-1" 
      aria-hidden="true" 
      ref="modalRef"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width: 95vw;">
          <div class="modal-content" style="height: 95vh;">
          
          <div class="modal-header">
            <h5 class="modal-title">{{ pageTitle || '詳細資料' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="closeModal"></button>
          </div>
          
          <div class="modal-body p-0 d-flex flex-column">
            <DataGrid
              v-if="isModalOpen && activeMode === 'table'"
              :id="`grid_${id}`"
              :ref="`grid_${id}`"
              :root="root"
              :remoteName="targetRemoteName"
              :columns="targetColumns"
              :whereItems="drillWhereItems"
              :pagination="true"
              :pageSize="10"
              :viewCommandVisible="false"
              :editCommandVisible="false"
              :deleteCommandVisible="false"
              :bordered="true"
              :hover="true"
              :striped="true"
              style="flex: 1; overflow: auto;"
            />

            <iframe 
              v-if="isModalOpen && activeMode === 'dialog'" 
              :src="iframeUrl" 
              style="width: 100%; height: 100%; border: none; flex: 1;"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'bootstrap';
import DataGrid from './DataGrid.vue'; 

const props = defineProps({
  id: { type: String, default: () => `drilldown_${uuidv4().substring(0,8)}` },
  root: { type: Object, required: true },
  bindingObject: { type: String, default: '' },
  columns: { type: Array, default: () => [] }, 
  mode: { type: String, default: 'table' }, 
  targetRemoteName: { type: String, default: '' },
  targetColumns: { type: Array, default: () => [] },
  page: { type: String, default: '' },
  pageTitle: { type: String, default: 'Drilldown' },
  pageOpenForm: { type: Boolean, default: true },
  onFormat: String,
  onClick: String
});

const $ = props.root;
const modalRef = ref(null);
const modalId = computed(() => `modal_${props.id}`);

const isModalOpen = ref(false);
const activeMode = ref('');
const drillWhereItems = ref([]);
const iframeUrl = ref('');

const closeModal = () => {
  isModalOpen.value = false;
  iframeUrl.value = ''; 
};

const open = async (row) => {
  if (!row) return;

  const whereItems = [];
  props.columns.forEach(col => {
    whereItems.push({
      field: col.targetField,
      operator: col.operator || '=',
      value: row[col.field]
    });
  });

  if (props.onClick && typeof $.invoke === 'function') {
    if ($.invoke(props.onClick, row, whereItems) === false) return;
  }

  activeMode.value = String(props.mode || '').toLowerCase();
  
  // 1. table
  if (activeMode.value === 'table') {
    drillWhereItems.value = whereItems;
    isModalOpen.value = true;
    
    await nextTick();
    const el = modalRef.value; 
    if (el) {
      try {
        const GlobalBsModal = window?.bootstrap?.Modal || Modal;
        let m = GlobalBsModal.getInstance(el);
        if (!m) m = new GlobalBsModal(el, { backdrop: 'static', keyboard: false });
        m.show();
      } catch (e) { console.error(e); }
      el.addEventListener('hidden.bs.modal', closeModal, { once: true });
    }
  } 
  // 2. mode: Dialog / Tab / Window
  else if (props.page) {
    const drillId = `drill_${uuidv4().substring(0,8)}`;
    const drillData = {
      targetRemoteName: props.targetRemoteName,
      whereItems: whereItems,
      drillRow: row,
      loadAction: props.pageOpenForm ? 'viewRow' : null
    };
    sessionStorage.setItem(drillId, JSON.stringify(drillData));

    const url = `${props.page}?drill=${drillId}`;
    const title = props.pageTitle || '詳細資料';
    const eepApi = window.$ || $; 

    if (activeMode.value === 'dialog') {
      iframeUrl.value = url;
      isModalOpen.value = true;
      
      await nextTick();
      const el = modalRef.value; 
      if (el) {
        try {
          const GlobalBsModal = window?.bootstrap?.Modal || Modal;
          let m = GlobalBsModal.getInstance(el);
          if (!m) m = new GlobalBsModal(el, { backdrop: 'static', keyboard: false });
          m.show();
        } catch (e) { console.error(e); }
        el.addEventListener('hidden.bs.modal', closeModal, { once: true });
      }
    } 
    else if (activeMode.value === 'tab') {
      if (typeof eepApi.addTab === 'function') {
        eepApi.addTab({ title: title, url: url, path: url }); 
      } else {
        window.open(url, '_blank');
      }
    } 
    else {
      window.open(url, '_blank');
    }
  }
};

const formatValue = (value, row) => {
  if (props.onFormat && typeof $.invoke === 'function') {
    return $.invoke(props.onFormat, value, row) || value;
  }
  return value;
};

defineExpose({
  open,
  formatValue,
  bindingObject: props.bindingObject
});
</script>

<style scoped>
.drilldown-cell {
    cursor: pointer;
}
</style>