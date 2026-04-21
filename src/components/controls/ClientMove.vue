<template>
  <Teleport to="body">
    <div
      v-if="isModalOpen"
      class="clientmove modal fade show"
      style="display: block; background: rgba(0,0,0,0.4);"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable custom-modal">
        <div class="modal-content shadow" :style="{ height: height ? height + 'px' : '85vh' }">
          
          <div class="modal-header">
            <h5 class="modal-title">{{ title || '整批新增' }}</h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          
          <div class="modal-body p-0 d-flex flex-column">
            <div class="table-responsive" style="flex: 1; overflow: auto;">
              <table class="table table-hover table-bordered table-striped align-middle mb-0 bootstrap-datagrid">
                <thead class="sticky-top" style="z-index: 2;">
                  <tr>
                    <th class="text-center" style="width: 50px;">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :checked="isAllChecked"
                        @change="toggleCheckAll"
                      >
                    </th>
                    <th 
                      v-for="col in columns" 
                      :key="col.field" 
                      :class="col.alignment ? `text-${col.alignment}` : ''"
                    >
                      {{ col.title || col.field }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td :colspan="columns.length + 1" class="text-center py-4 text-muted">
                      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      載入中...
                    </td>
                  </tr>
                  <tr v-else-if="rows.length === 0">
                    <td :colspan="columns.length + 1" class="text-center py-4 text-muted">
                      無資料
                    </td>
                  </tr>
                  <tr 
                    v-else
                    v-for="row in rows" 
                    :key="row.__uuid"
                    @click="toggleCheckRow(row)"
                    style="cursor: pointer;"
                  >
                    <td class="text-center" @click.stop>
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :checked="isChecked(row)"
                        @change="toggleCheckRow(row)"
                      >
                    </td>
                    <td 
                      v-for="col in columns" 
                      :key="col.field" 
                      :class="col.alignment ? `text-${col.alignment}` : ''"
                    >
                      {{ formatCell(row, col) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="modal-footer d-flex justify-content-between align-items-center">
            <div class="text-muted small">
              <span v-if="checkedRows.length > 0">已選取 {{ checkedRows.length }} 筆</span>
            </div>

            <div class="d-flex align-items-center gap-3">
              
              <nav v-if="pagination" class="d-flex align-items-center gap-2">
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }"><a class="page-link" href="#" @click.prevent="goPage(1)">«</a></li>
                  <li class="page-item" :class="{ disabled: currentPage === 1 }"><a class="page-link" href="#" @click.prevent="goPage(currentPage - 1)">‹</a></li>
                  <li class="page-item" v-for="p in visiblePages" :key="p" :class="{ active: currentPage === p }"><a class="page-link" href="#" @click.prevent="goPage(p)">{{ p }}</a></li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }"><a class="page-link" href="#" @click.prevent="goPage(currentPage + 1)">›</a></li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }"><a class="page-link" href="#" @click.prevent="goPage(totalPages)">»</a></li>
                </ul>
                <small class="ms-2 text-muted">每頁 {{ localPageSize }} 筆，共 {{ totalRows }} 筆</small>
              </nav>

              <div>
                  <button type="button" class="btn btn-primary options-ok me-2" @click="confirmMove" :disabled="loading">確定</button>
                  <button type="button" class="btn btn-default" @click="closeModal">取消</button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import dataUtils from '@/utils/dataApi'; 

const props = defineProps({
  id: { type: String, default: () => `clientMove_${uuidv4().substring(0,8)}` },
  root: { type: Object, required: true },
  title: { type: String, default: '整批新增' },
  remoteName: { type: String, required: true },
  columns: { type: Array, default: () => [] },
  
  pagination: { type: Boolean, default: true },
  pageSize: { type: Number, default: 10 },
  pageList: { type: Array, default: () => [10, 20, 50] },
  height: { type: [Number, String], default: null },
  
  whereItems: { type: Array, default: () => [] },
  alwaysInsert: { type: Boolean, default: false },
  triggerExpression: { type: Boolean, default: true },
  
  targetDataGrid: { type: String, required: true },
  keyFields: { type: Array, default: () => [] },
  columnMatchs: { type: Array, default: () => [] },
});

const $ = props.root;
const isModalOpen = ref(false);
const loading = ref(false);

const rows = ref<any[]>([]);
const totalRows = ref(0);
const currentPage = ref(1);
const localPageSize = ref(props.pageSize || 10);
const checkedRows = ref<any[]>([]);

const totalPages = computed(() => Math.ceil(totalRows.value / localPageSize.value) || 0);
const visiblePages = computed(() => {
  const tp = totalPages.value;
  const cur = currentPage.value;
  const spread = 2;
  const pages: number[] = [];
  const start = Math.max(1, cur - spread);
  const end = Math.min(tp, cur + spread);
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
});

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return;
  currentPage.value = p;
  fetchData();
}

const openMove = () => {
    checkedRows.value = [];      
    currentPage.value = 1;  
    isModalOpen.value = true;
    fetchData();
};

const closeModal = () => {
    isModalOpen.value = false;
    checkedRows.value = [];  
    currentPage.value = 1; 
};

function getDParams(sourceRow: any = null) {
  let parentRow = {};
  const targetGrid = $['$' + props.targetDataGrid];
  
  if (targetGrid && targetGrid.value) {
    const parentObjName = targetGrid.value.$props?.parentObject || targetGrid.value.parentObject;
    if (parentObjName) {
      const parentForm = $['$' + parentObjName];
      if (parentForm && parentForm.value && typeof parentForm.value.getParentObj === 'function') {
         parentRow = parentForm.value.getParentObj().parentRow || {};
      }
    }
  }

  return {
    parent: parentRow,
    autoseq: targetGrid?.value?.rows || [], 
    row: sourceRow || {} 
  };
}

function getParsedWhereItems() {
  if (!props.whereItems || props.whereItems.length === 0) return null;
  
  const dParams = getDParams();

  return props.whereItems.map((wi: any) => {
    return {
      field: wi.field,
      operator: wi.operator,
      value: $.getDefaultValue ? $.getDefaultValue(wi.value, dParams) : wi.value
    };
  });
}

async function fetchData() {
  loading.value = true;
  try {
    const { loadData: apiLoadData } = dataUtils(props.remoteName);
    const param: any = {
      page: currentPage.value,
      rows: props.pagination ? localPageSize.value : -1,
    };
    
    const parsedWhere = getParsedWhereItems();
    if (parsedWhere) {
      param.whereItems = JSON.stringify(parsedWhere);
    }

    const data = await apiLoadData(param);
    const resultRows = Array.isArray(data) ? data : (data?.rows || []);
    resultRows.forEach((row: any) => { if (!row.__uuid) row.__uuid = uuidv4(); });

    rows.value = resultRows;
    totalRows.value = data?.total ?? resultRows.length;
  } catch (error) {
    console.error('[ClientMove] 資料載入失敗:', error);
    if ($.showError) $.showError('資料載入失敗');
  } finally {
    loading.value = false;
  }
}

const isChecked = (row: any) => checkedRows.value.some(r => r.__uuid === row.__uuid);

const isAllChecked = computed(() => {
  if (rows.value.length === 0) return false;
  return rows.value.every(r => isChecked(r));
});

const toggleCheckRow = (row: any) => {
  const index = checkedRows.value.findIndex(r => r.__uuid === row.__uuid);
  if (index >= 0) checkedRows.value.splice(index, 1);
  else checkedRows.value.push(row);
};

const toggleCheckAll = (event: any) => {
  const isChecked = event.target.checked;
  rows.value.forEach(row => {
    const index = checkedRows.value.findIndex(r => r.__uuid === row.__uuid);
    if (isChecked && index < 0) checkedRows.value.push(row);
    else if (!isChecked && index >= 0) checkedRows.value.splice(index, 1);
  });
};

const confirmMove = () => {
  if (checkedRows.value.length === 0) {
    const msg = $.getMessage ? $.getMessage('selectData') : '請先勾選要匯入的資料！';
    if ($.showError) $.showError(msg);
    else alert(msg);
    return;
  }
  addRows(checkedRows.value);
  closeModal();
};

const addRows = (sourceRows: any[]) => {
  const targetGrid = $['$' + props.targetDataGrid];
  if (!targetGrid) return console.error(`[ClientMove] 找不到目標 DataGrid: ${props.targetDataGrid}`);

  const tgInstance = targetGrid.value;
  const oldRows = tgInstance.rows || (typeof tgInstance.getRows === 'function' ? tgInstance.getRows() : []);
  
  let insertedCount = 0;

  sourceRows.forEach(row => {
    let exist = false;

    if (!props.alwaysInsert) {
      for (const orow of oldRows) {
        let keyMatch = true;
        for (const kf of props.keyFields) {
          if (orow[(kf as any).targetField] !== row[(kf as any).sourceField]) {
            keyMatch = false;
            break;
          }
        }
        if (props.keyFields.length > 0 && keyMatch) {
          exist = true;
          break;
        }
      }
    }

    if (!exist) {
      let newRow: any = {};
      
      const dParams = getDParams(row);
      
      if (typeof tgInstance.getDefaultValues === 'function') {
          newRow = { 
              ...tgInstance.getDefaultValues(), 
              ...dParams.parent 
          };
      } else { 
          newRow = { ...dParams.parent };
          newRow.__isNew = true; 
          newRow.__uuid = uuidv4(); 
      }

      props.columnMatchs.forEach(cm => {
        const match = cm as any;
        if (match.sourceField) {
          newRow[match.targetField] = row[match.sourceField];
        } else {
          newRow[match.targetField] = ($.getDefaultValue && match.sourceValue) 
            ? $.getDefaultValue(match.sourceValue, dParams) 
            : match.sourceValue;
        }
      });

      if (!props.alwaysInsert) {
        props.keyFields.forEach(kf => {
          const field = kf as any;
          newRow[field.targetField] = row[field.sourceField];
        });
      }

      if (typeof tgInstance.appendRow === 'function') tgInstance.appendRow(newRow);
      else if (Array.isArray(tgInstance.rows)) {
        tgInstance.rows.push(newRow);
        if (tgInstance.insertedRows) tgInstance.insertedRows.push(newRow);
      }
      
      if (props.triggerExpression && $.triggerValueChanged) {
        props.columnMatchs.forEach(cm => {
          $.triggerValueChanged(props.targetDataGrid, (cm as any).targetField);
        });
      }
      insertedCount++;
    }
  });

  const autoApply = tgInstance.autoApply !== undefined
    ? tgInstance.autoApply
    : tgInstance.$props?.autoApply;
  if (insertedCount > 0 && autoApply === true && typeof tgInstance.submit === 'function') {
    tgInstance.submit();
  }
};

const addAll = async () => {
  try {
    const { loadData: apiLoadData } = dataUtils(props.remoteName);
    const param: any = { page: 1, rows: -1 };
    
    const parsedWhere = getParsedWhereItems();
    if (parsedWhere) param.whereItems = JSON.stringify(parsedWhere);
    
    const data = await apiLoadData(param);
    const rows = Array.isArray(data) ? data : (data?.rows || []);
    addRows(rows);
  } catch (error) {
    if ($.showError) $.showError(error);
  }
};

const formatCell = (row: any, col: any) => {
  const val = row[col.field];
  if (val == null) return '';
  if (col.format === 'N0') {
    const num = Number(val);
    return Number.isFinite(num) ? num.toLocaleString() : String(val);
  }
  return String(val);
};

defineExpose({
  openMove,
  addRows,
  addAll,
  targetDataGrid: props.targetDataGrid 
});
</script>

<style scoped>
.modal.fade.show { transition: opacity 0.15s linear; }
.page-link { text-decoration: none; }

.bootstrap-datagrid thead th {
    background-color: var(--bs-table-bg, #fff);
}
</style>