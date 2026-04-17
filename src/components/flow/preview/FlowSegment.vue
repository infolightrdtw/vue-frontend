<template>
    <div :class="cls" :style="style">{{item.options.text}}</div>
</template>
<script lang="ts" setup>
    import { computed } from 'vue'
    const { item } = defineProps<{
        item: any
    }>()
    const cls = ['flow-segment', item.cls || '']
    const style = {
        color: item.options.textStroke,
        'background-color': item.options.fill,
        'font-size': '16px',
        width: item.options.width + 'px',
        height: '50px',
        'line-height': '50px',
        left: item.left + 'px',
        top: '0px',
        position: 'absolute'
    }
</script>