<template>
  <div class="orgchart-container">
    <div v-if="toolItems && toolItems.length > 0" class="btn-group orgchart-toolitem mb-2">
      <button
        v-for="(item, index) in toolItems"
        :key="index"
        v-show="!item.hidden"
        class="btn btn-sm"
        :class="item.btnCls || 'btn-default'"
        @click="handleToolClick(item.onclick)"
      >
        <span v-if="item.iconAlign === 'Left' && item.iconCls" :class="['glyphicon', item.iconCls]"></span>
        <span class="btn-text">{{ getLocaleText(item.text) }}</span>
        <span v-if="item.iconAlign === 'Right' && item.iconCls" :class="['glyphicon', item.iconCls]"></span>
      </button>
    </div>

    <div 
      class="bootstrap-Orgchart" 
      ref="chartWrapper" 
      v-loading="isLoading"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue';
import OrgChart from 'orgchart';
import 'orgchart/dist/css/jquery.orgchart.css'; 

const props = defineProps({
  remoteName: { type: String, required: true },
  toolItems: { type: Array, default: () => [] },
  idField: { type: String, default: 'id' },
  parentField: { type: String, default: 'parentId' },
  nameField: { type: String, default: 'name' },
  titleField: { type: String, default: 'title' },
  editable: { type: Boolean, default: true },
  editForm: { type: String },
  verticalLevel: { type: Number, default: 1 },
  whereStr: { type: String, default: '' },
  
  // Hooks
  onBeforeLoad: { type: Function },
  onNodeClick: { type: Function },
  onBeforeDrop: { type: Function },
  onLoad: { type: Function },
  nodeTemplate: { type: Function }
});

const emit = defineEmits(['openEditForm']);

const chartWrapper = ref(null);
const isLoading = ref(false);
const rawData = ref([]);
const keys = ref([]);
const updatedRows = ref([]);
const selectedNodeData = ref(null);

let chartInstance = null;

const getLocaleText = (text) => {
  if (!text) return '';
  let key = text.toLowerCase();
  if (key === 'delete') key = 'remove';
  else if (key === 'export') key = 'exports';

  return window.$.fn?.locale?.[key] || text; 
};

const load = () => {
  isLoading.value = true;
  const param = { total: true, whereStr: props.whereStr };

  if (props.onBeforeLoad) props.onBeforeLoad(param);

  window.$.loadData(props.remoteName, param, (data) => {
    keys.value = data.keys || [];
    rawData.value = data.rows || [];
    acceptChanges();
    
    if (props.onLoad) props.onLoad(data.rows);
    
    renderChart(data.rows);
    isLoading.value = false;
  }, (err) => {
    console.error(err);
    isLoading.value = false;
  });
};

const getNodeData = (nodeRows, parentID) => {
  return nodeRows.filter(r => {
    let pid = props.parentField ? r[props.parentField] : '';
    if (pid === null || pid === undefined) pid = '';
    return parentID !== undefined && pid !== undefined && parentID.toString() === pid.toString();
  }).map(r => {
    const id = r[props.idField];
    const childNodes = getNodeData(nodeRows, id);
    r.children = childNodes.length ? childNodes : null;
    return r;
  });
};

const renderChart = (rows) => {
  if (!chartWrapper.value) return;

  if (chartInstance) {
    chartWrapper.value.innerHTML = ''; 
    chartInstance = null;
  }

  const treeData = getNodeData(rows, '')[0];
  if (!treeData) return;

  chartInstance = new OrgChart({
    'chartContainer': chartWrapper.value,
    'data': treeData,
    'nodeId': props.idField,
    'nodeTitle': props.nameField,
    'nodeContent': props.titleField,
    'draggable': props.editable,
    'verticalLevel': props.verticalLevel,
    'nodeTemplate': props.nodeTemplate
  });

  chartWrapper.value.addEventListener('click', handleNodeClick);

  chartWrapper.value.addEventListener('nodedrop.orgchart', handleNodeDrop);
};

const handleNodeClick = (e) => {
  const nodeEl = e.target.closest('.node');
  if (!nodeEl) return;

  const nodeId = nodeEl.id; 
  const rowData = rawData.value.find(r => r[props.idField].toString() === nodeId);
  
  if (rowData) {
    chartWrapper.value.querySelectorAll('.node').forEach(n => n.classList.remove('focused'));
    nodeEl.classList.add('focused');

    selectedNodeData.value = rowData;
    if (props.onNodeClick) {
      props.onNodeClick(rowData);
    }
  }
};

const handleNodeDrop = (e) => {
  const dragNode = e.detail.draggedNode;
  const dropZone = e.detail.dropZone;

  const dragData = rawData.value.find(r => r[props.idField].toString() === dragNode.id);
  const dropData = rawData.value.find(r => r[props.idField].toString() === dropZone.id);

  if (!dragData || !dropData) return;

  if (props.onBeforeDrop) {
    if (props.onBeforeDrop(dragData, dropData) === false) {
      renderChart(rawData.value); 
      return;
    }
  }

  dragData[props.parentField] = dropData[props.idField];
  if (!updatedRows.value.includes(dragData)) {
    updatedRows.value.push(dragData);
  }

  if (props.verticalLevel && (dragData.level >= props.verticalLevel || dropData.level >= props.verticalLevel - 1)) {
    renderChart(rawData.value);
  }
};


const handleToolClick = (onclickMethodName) => {
  if (!onclickMethodName) return;
  
  const internalMethods = {
    'insert_row': insertRow,
    'edit_row': editRow,
    'delete_row': deleteRow,
    'submit': submit
  };

  if (internalMethods[onclickMethodName]) {
    internalMethods[onclickMethodName]();
  } else if (typeof window[onclickMethodName] === 'function') {
    window[onclickMethodName](null, chartWrapper.value);
  }
};

const insertRow = () => {
  if (!props.editForm) return;
  const row = {};
  if (selectedNodeData.value) {
    row[props.parentField] = selectedNodeData.value[props.idField];
  }
  emit('openEditForm', { status: 'inserted', row, keys: keys.value });
};

const editRow = () => {
  if (!props.editForm || !selectedNodeData.value) return;
  emit('openEditForm', { status: 'updated', row: selectedNodeData.value, keys: keys.value });
};

const deleteRow = () => {
  if (!selectedNodeData.value) return;

  const msg = (window.$.fn?.locale?.confirm || 'Confirm') + (window.$.fn?.locale?.remove || 'Remove');
  if (confirm(msg)) {
    const tablePart = props.remoteName.split('.')[1];
    const datas = [{ table: tablePart, inserted: [], updated: [], deleted: [selectedNodeData.value] }];

    window.$.updateData(props.remoteName, datas, false, () => {
      selectedNodeData.value = null; 
      load(); 
    }, (err) => console.error(err));
  }
};

const acceptChanges = () => { updatedRows.value = []; };

const getChangedDatas = () => {
  if (updatedRows.value.length === 0) return [];
  return [{ table: props.remoteName.split('.')[1], updated: updatedRows.value }];
};

const submit = () => {
  const datas = getChangedDatas();
  if (datas.length > 0) {
    isLoading.value = true;
    window.$.updateData(props.remoteName, datas, false, () => {
        acceptChanges();
        isLoading.value = false;
      }, (err) => {
        console.error(err);
        isLoading.value = false;
      });
  }
};


onMounted(() => {
  nextTick(() => load());
});

onBeforeUnmount(() => {
  if (chartWrapper.value) {
    chartWrapper.value.removeEventListener('click', handleNodeClick);
    chartWrapper.value.removeEventListener('nodedrop.orgchart', handleNodeDrop);
  }
});

defineExpose({ load, insertRow, editRow, deleteRow, submit, getChangedDatas, acceptChanges });
</script>

<style scoped>
.orgchart-toolitem {
  margin-bottom: 10px;
}
.btn-text {
  margin: 0 4px;

:deep(.orgchart .node.focused) {
  background-color: rgba(238, 217, 54, 0.5);
  border-radius: 4px;
}
</style>