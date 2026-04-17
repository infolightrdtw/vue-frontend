<template>
  <li 
    class="list-group-item tree-node-item" 
    :style="{ paddingLeft: (level * 1.5) + 'rem' }"
    @click="selectNode"
  >
    <span class="icon-wrapper" @click.stop="toggle">
      <span v-if="node.nodes" class="expand-icon">
        {{ expanded ? '−' : '＋' }}
      </span>
      <span v-else class="expand-spacer"></span>
    </span>

    <i v-if="icon" :class="icon" class="me-2 text-secondary"></i>
    
    <span class="node-text">{{ node.text }}</span>
  </li>

  <template v-if="expanded && node.nodes">
    <TreeNode 
      v-for="child in node.nodes" 
      :key="child.row.id || child.text" 
      :node="child"
      :icon="icon"
      :level="level + 1"
      :max-levels="maxLevels"
      @node-selected="$emit('node-selected', $event)"
    />
  </template>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  node: Object,
  icon: String,
  level: { type: Number, default: 1 },
  maxLevels: { type: Number, default: 2 }
});

const emit = defineEmits(['node-selected']);

const expanded = ref(props.level < props.maxLevels);

const toggle = () => {
  expanded.value = !expanded.value;
};

const selectNode = () => {
  emit('node-selected', props.node);
};
</script>

<style scoped>
.tree-node-item {
  cursor: pointer;
  border-left: none; 
  border-right: none;
  padding-top: 10px;
  padding-bottom: 10px;
}
.tree-node-item:first-child {
  border-top: none;
}
.tree-node-item:hover {
  background-color: #f9f9f9;
}
.icon-wrapper {
  display: inline-block;
  width: 20px;
  text-align: center;
  margin-right: 5px;
  user-select: none;
}
.expand-icon {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}
.expand-spacer {
  display: inline-block;
  width: 20px;
}
.node-text {
  font-size: 14px;
  color: #333;
}
</style>