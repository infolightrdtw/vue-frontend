<template>
  <div :id="id" :class="containerCls">
    <div class="row">
      <div 
        v-for="(col, index) in columns" 
        :key="index" 
        :class="getColumnClass(col)"
      >
        <slot :name="index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  root: {
    type: Object,
    default: () => ({})
  },
  containerCls: {
    type: String,
    default: 'container-fluid'
  },
  columns: {
    type: Array,
    default: () => []
  }
});

const getColumnClass = (col) => {
  if (typeof col === 'string') return col;
  return col?.columnCls || col?.class || 'col-12';
};
</script>