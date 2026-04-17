<template>
    <div :class="cls" :style="style">
        <svg v-if="isContainer" width="100%" height="100%">
            <FlowLine v-for="line in lines" v-bind="line"></FlowLine>
        </svg>
        <div class="activity-text">{{item.options.text}}</div>
        <div class="arrow-div"></div>
        <div class="activity-icon"></div>
        <template v-if="item.datas">
            <div v-for="data in item.datas" :class="dataCls(data.type)" :title="data.title">{{data.text}}</div>
        </template>
        <template v-if="item.children">
            <FlowActivity v-for="child in item.children" :item="child" :position="childPosition"></FlowActivity>
        </template>
    </div>
</template>
<script lang="ts" setup>
    import { computed } from 'vue'
    const { item, position = 'absolute' } = defineProps<{
        item: any,
        position?: string
    }>()

    const isBranch = item.options.type == 'IfElseBranchActivity' || item.options.type == 'ParallelBranchActivity'
    const isContainer = item.options.type == 'IfElseActivity' || item.options.type == 'ParallelActivity'
    const childPosition = isBranch ? 'relative' : 'absolute'
    const cls = ['flow-activity', item.options.type, isBranch ? 'vertical' : '', item.datas ? 'preview' : '']
    const dataCls = (type)=> `flow-${type}`

    const style = {
        'background-color': item.options.fill,
        color: item.options.textStroke,
        width: item.width + 'px',
        height: item.height + 'px',
        position
    }
    if (position == 'absolute') {
        style.top = item.top + 'px'
        style.left = item.left + 'px'
    }

    const lines = computed(() => {
        const innerLines = []
        item.children.forEach(c => {
            innerLines.push({
                source: { points: { x: item.width /2 - 1, y:0, d:180, inner:true } },
                target: c,
            })
            innerLines.push({
                source: c,
                target: { points: { x: item.width /2 - 1, y:item.height, d: 0, inner:true } },
                showArrow: false
            })
        })
        return innerLines
    })
</script>
