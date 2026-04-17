<template>
  <div class="datalist-wrapper" :id="id" :class="listCls">
    <div class="list-group" :class="{ 'list-group-flush': !bordered }">
      <div
        v-for="(row, index) in dataList"
        :key="index"
        class="list-group-item list-item d-flex justify-content-between align-items-center"
        :class="[{ 'active': selectedIndex === index }, rowCls]"
        @click="selectRow(index, row)"
        style="cursor: pointer;"
      >
        <div class="row w-100 align-items-center">
          <div 
            v-for="col in columns" 
            :key="col.field" 
            :class="col.columnCls || 'col'"
          >
            <span v-if="col.formatter" v-html="col.formatter(row[col.field], row, index)"></span>
            <span v-else>{{ row[col.field] != null ? row[col.field] : (showEmptyColumn ? '&nbsp;' : '') }}</span>
          </div>
        </div>

        <div v-if="hasCommands" class="ms-auto position-relative ms-2">
          <button 
            class="btn btn-link p-0 text-secondary fs-4" 
            @click.stop="toggleMenu(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-list-task text-primary" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M2 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5H2zM3 3H2v1h1V3z"/>
              <path d="M5 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM5.5 7a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 4a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9z"/>
              <path fill-rule="evenodd" d="M1.5 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5V7zM2 7h1v1H2V7zm0 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H2zm1 .5H2v1h1v-1z"/>
            </svg>
          </button>

          <div 
            v-if="activeMenuIndex === index" 
            class="position-absolute bg-white border rounded shadow-sm p-1"
            style="right: 100%; top: 50%; transform: translateY(-50%); margin-right: 10px; z-index: 1050; white-space: nowrap;"
            @click.stop
          >
            <div class="btn-group btn-group-sm">
              <button v-if="viewCommandVisible" type="button" class="btn btn-light border-end" @click="viewRow(row, index)">查看</button>
              <button v-if="editCommandVisible" type="button" class="btn btn-light border-end" @click="editRow(row, index)">編輯</button>
              <button v-if="deleteCommandVisible" type="button" class="btn btn-light text-danger" @click="deleteRow(row, index)">刪除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && dataList.length === 0" class="text-center py-3 text-muted">目前沒有資料</div>

    <button 
      v-if="pagination && hasMore" 
      class="btn btn-link w-100 mt-2" 
      :disabled="loading"
      @click="loadMore"
    >
      <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      {{ loading ? '載入中...' : '載入更多 ▼' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import dataUtils from '@/utils/dataApi'; 

const props = defineProps({
  id: { type: String, default: '' },
  root: { type: Object, default: () => ({}) }, 
  remoteName: { type: String, required: true },
  columns: { type: Array, required: true },
  pageSize: { type: Number, default: 10 },
  pagination: { type: Boolean, default: true },
  listCls: { type: String, default: '' },
  rowCls: { type: String, default: '' },
  bordered: { type: Boolean, default: false },
  showEmptyColumn: { type: Boolean, default: true },
  
  viewCommandVisible: { type: Boolean, default: false },
  editCommandVisible: { type: Boolean, default: false },
  deleteCommandVisible: { type: Boolean, default: false },
  
  editForm: { type: String, default: '' },
  onUpdate: String,
  onInsert: String,
  onDelete: String
});

const emit = defineEmits(['onSelect', 'onView', 'onEdit', 'onDelete', 'onInsert', 'onLoad', 'onBeforeLoad']);

const $ = props.root;

const dataList = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const selectedIndex = ref(-1);
const whereStr = ref(null);
const whereItems = ref(null);
const keys = ref([]);

const activeMenuIndex = ref(-1);

const hasCommands = computed(() => {
  return props.viewCommandVisible || props.editCommandVisible || props.deleteCommandVisible;
});

const hasMore = computed(() => {
  return page.value < Math.ceil(total.value / props.pageSize);
});

const parseRemoteName = (remoteName) => {
  const rn = String(remoteName || '').trim();
  return { module: rn.split('.')[0] || '', command: rn.split('.')[1] || '' };
};

const closeMenu = () => { activeMenuIndex.value = -1; };
const toggleMenu = (index) => { activeMenuIndex.value = activeMenuIndex.value === index ? -1 : index; };

onMounted(() => {
  loadData(true);
  document.addEventListener('click', closeMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeMenu);
});

const loadData = async (clear = false) => {
  if (clear) {
    page.value = 1;
    dataList.value = [];
    selectedIndex.value = -1;
  }
  let param = {
    rows: props.pagination ? Number(props.pageSize) : -1,
    page: Number(page.value)
  };
  if (whereStr.value) param.whereStr = whereStr.value;
  if (whereItems.value) param.whereItems = JSON.stringify(whereItems.value);

  emit('onBeforeLoad', param);
  loading.value = true;
  try {
    const { loadData: apiLoadData } = dataUtils(props.remoteName);
    const data = await apiLoadData(param);

    if (typeof data?.keys === 'string') {
        keys.value = data.keys.split(',');
    } else {
        keys.value = data?.keys || [];
    }

    const rows = Array.isArray(data) ? data : (data?.rows || []);
    const dataTotal = data?.total || rows.length;
    
    if (clear) dataList.value = rows;
    else dataList.value.push(...rows);
    
    total.value = dataTotal;
    emit('onLoad', data);
  } catch (error) {
    console.error("[Datalist] 資料載入失敗:", error);
  } finally {
    loading.value = false;
  }
};

const loadMore = () => { if (hasMore.value && !loading.value) { page.value += 1; loadData(false); } };

const selectRow = (index, row) => {
  selectedIndex.value = index;
  emit('onSelect', index, row);
};

const openForm = (row, status) => {
  const form = $['$' + props.editForm];
  if (form) {
    if (!form.value.viewGrids) form.value.viewGrids = {};
    form.value.viewGrids[props.id] = $['$' + props.id];
    
    form.value.open({ row, keys: keys.value, status });
  } else {
    console.warn(`[Datalist] 找不到名稱為 ${props.editForm} 的表單元件，請確認該元件的 ref 設定`);
  }
};

const viewRow = (row, index) => {
  activeMenuIndex.value = -1; 
  selectRow(index, row);
  
  if (props.editForm) {
    openForm({ ...row }, 'view');
  }
  emit('onView', row, index);
};

const editRow = async (row, index) => {
  activeMenuIndex.value = -1; 
  selectRow(index, row);
  
  const rowData = { ...row };

  if (props.onUpdate && typeof $.invoke === 'function') {
    if ($.invoke(props.onUpdate, rowData, index) === false) return;
  }
  
  if (props.editForm) {
    openForm(rowData, 'updated');
  }
  emit('onEdit', rowData, index);
};

const insertRow = () => {
  const rowData = {};
  if (props.onInsert && typeof $.invoke === 'function') {
    if ($.invoke(props.onInsert, rowData) === false) return;
  }
  if (props.editForm) {
    openForm(rowData, 'inserted');
  }
  emit('onInsert', rowData);
};

const deleteRow = async (row, index) => {
  activeMenuIndex.value = -1; 
  
  if (props.onDelete && typeof $.invoke === 'function') {
      if ($.invoke(props.onDelete, row, index) === false) return;
  }

  const r = await $.confirmMessage('confirm remove ?');
  if (!r) {
      return;
  }

  loading.value = true;
  try {
    const { command } = parseRemoteName(props.remoteName);
    const { updateData: apiUpdateData } = dataUtils(props.remoteName);
    const datas = [{ table: command, inserted: [], updated: [], deleted: [row] }];
    
    await apiUpdateData(datas);
    
    dataList.value.splice(index, 1);
    emit('onDelete', row, index);
    
  } catch (error) {
    console.error("[Datalist] 刪除資料失敗:", error);
    if (typeof $.showError === 'function') {
        $.showError(error);
    } else {
        alert('刪除失敗！');
    }
  } finally {
    loading.value = false;
  }
};

const setWhere = (where) => {  };
const getRows = () => dataList.value;
const getSelectedIndex = () => selectedIndex.value;
const reload = () => loadData(true);

defineExpose({ loadData: reload, setWhere, getRows, getSelectedIndex, insertRow });
</script>