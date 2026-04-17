<template>
    <div :class ="cls" :style="style"></div>
</template>
<script lang="ts" setup>
    import { computed } from 'vue'
    const { item } = defineProps<{
        item: any
    }>()
    const cls = ['segment-body', item.cls || '']
    const style = {
        'background-color': item.options.fill,
        width: item.options.width + 'px',
        height: '100%',
        left: item.left + 'px',
        top: '0px',
        position: 'absolute'
    }
</script>