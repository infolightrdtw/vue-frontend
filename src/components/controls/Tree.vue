<template>
  <div class="vue-tree-container" :class="{ 'has-border': showBorder }" :style="borderStyle">
    
    <div v-if="title" class="datagrid-title">{{ title }}</div>
    
    <div v-if="allowAdd && editable" class="p-2 border-bottom bg-light">
      <button class="btn btn-sm btn-outline-secondary" @click="handleAdd">
        新增
      </button>
    </div>

    <div v-if="loading" class="text-muted text-center py-2">載入中...</div>
      
    <ul v-else class="list-group list-group-flush mb-0">
      <TreeNode 
        v-for="node in treeData" 
        :key="node.row[idField]" 
        :node="node" 
        :icon="nodeIcon"
        :level="1"
        :max-levels="Number(levels)"
        @node-selected="handleNodeSelected"
      />
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import TreeNode from './TreeNode.vue';
import dataUtils from '@/utils/dataApi'; 

const props = defineProps({
  root: { type: Object, default: null },
  remoteName: { type: String, required: true },
  idField: { type: String, default: 'id' },
  parentField: { type: String, default: 'parentId' },
  textField: { type: String, default: 'text' },
  targetObject: { type: String, default: '' },
  whereItems: { type: Array, default: () => [] },
  whereStr: { type: String, default: null },
  title: { type: String, default: '' },
  editable: { type: Boolean, default: false },
  allowAdd: { type: Boolean, default: false },
  levels: { type: [Number, String], default: 2 },
  showBorder: { type: Boolean, default: false },
  borderColor: { type: [String, Boolean], default: '#ddd' },
  onBeforeLoad: { type: [String, Function], default: null },
  onNodeSelected: { type: [String, Function], default: null },
  onUpdate: { type: [String, Function], default: null },
  onRenderNode: { type: [String, Function], default: null },
  nodeIcon: { type: String, default: '' }
});

const rawData = ref([]);
const loading = ref(false);
const activeNodeId = ref(null); 

const executeRootMethod = (methodProp, ...args) => {
  if (!methodProp) return args[0];
  if (typeof methodProp === 'function') return methodProp(...args);
  if (typeof methodProp === 'string' && props.root) {
    const fn = props.root[methodProp];
    if (typeof fn === 'function') return fn(...args);
  }
  return args[0];
};

const borderStyle = computed(() => {
  if (!props.showBorder) return {};
  return {
    border: '1px solid',
    borderColor: props.borderColor === false ? '#ddd' : props.borderColor
  };
});

const parseRemote = (rn) => {
  if (!rn) return { module: '', command: '' };
  const names = rn.split('.');
  return {
    module: names[0] || '',
    command: names.length > 1 ? names[1] : ''
  };
};

const treeData = computed(() => {
  const buildTree = (nodeRows, parentID) => {
    return nodeRows
      .filter(r => {
        let pid = r[props.parentField];
        if (pid === null || pid === undefined || pid === 0 || pid === '0') pid = '';
        
        let targetPid = parentID;
        if (targetPid === null || targetPid === undefined) targetPid = '';
        
        return String(pid) === String(targetPid);
      })
      .map(r => {
        const childNodes = buildTree(nodeRows, r[props.idField]);
        return { text: r[props.textField], row: r, nodes: childNodes.length > 0 ? childNodes : null };
      });
  };
  return buildTree(rawData.value, '');
});

const loadTreeData = async (customWhereStr = null) => {
  loading.value = true;
  try {
    const rn = props.remoteName;
    const { loadData: apiLoadData } = dataUtils(rn);

    let param = {
      total: true
    };

    const finalWhereStr = customWhereStr || props.whereStr;
    if (finalWhereStr) {
      param.whereStr = finalWhereStr;
    }

    if (props.onBeforeLoad) {
      const newParams = executeRootMethod(props.onBeforeLoad, param);
      if (newParams) param = newParams;
    }

    console.log("[Tree] 修正後送出的純淨參數:", param);

    const r = await apiLoadData(param);

    const data = r && (r.rows || r.items || r.data || r);
    rawData.value = Array.isArray(data) ? data : [];
    
    console.log("[Tree] 資料載入成功，共", rawData.value.length, "筆");

  } catch (error) {
    console.error("[Tree API 載入失敗]:", error);
    if (error.response) {
      console.error("後端回覆錯誤:", error.response.data);
    }
  } finally {
    loading.value = false;
  }
};

const handleNodeSelected = (node) => {
  activeNodeId.value = node.row[props.idField];

  if (props.onNodeSelected) executeRootMethod(props.onNodeSelected, null, node);
  
  if (props.targetObject && props.whereItems && props.root) {
    const targetWhere = props.whereItems.map(wi => ({
      field: wi.targetField, operator: wi.operator || '=', value: node.row[wi.sourceField]
    }));
    const targetCtrl = props.root.$refs[props.targetObject];
    if (targetCtrl && typeof targetCtrl.setWhere === 'function') targetCtrl.setWhere(targetWhere);
  }
};

const handleAdd = () => {
  console.log("新增");
};

defineExpose({
  loadTreeData,

  options: () => props,
  rawData,

  load:        () => loadTreeData(),
  loadData:    (data) => { rawData.value = Array.isArray(data) ? data : (data?.rows || []); },
  setWhere:    (whereStr) => loadTreeData(whereStr),
  getSelected: () => rawData.value.find(r => r[props.idField] === activeNodeId.value) || null,
  insert_row:  () => {
    if (props.onUpdate) executeRootMethod(props.onUpdate, null, 'insert');
  },
  delete_row:  () => {
    if (activeNodeId.value == null) return;
    rawData.value = rawData.value.filter(r => r[props.idField] !== activeNodeId.value);
    activeNodeId.value = null;
  },
  renderNode:  (node) => (typeof props.onRenderNode === 'function' ? props.onRenderNode(node) : node)
});
onMounted(() => loadTreeData());
</script>

<style scoped>
.vue-tree-container {
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.datagrid-title {
  background-color: var(--theme-table-bg);
  padding: 10px 15px;
  margin: 0;
  color: #333;
  font-size: 15px;
  border-bottom: 1px solid #ddd;
}
</style>