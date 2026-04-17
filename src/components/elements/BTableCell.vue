<template>
    <b class="table-cell-label">{{title}}</b>
    <div v-if="type" class="table-cell-text">
        <component :is="cellType" v-bind="cellOptions">{{cellText}}</component>
    </div>
    <div v-else-if="html" class="table-cell-text" v-html="html">
    </div>
    <div v-else class="table-cell-text" :class="cellCls" :title="value">
        {{value}}
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    import elementUtils from '@/utils/elementApi'

    let { row, rowIndex = 0, column, root } = defineProps<{
        root: object,
        row: object,
        rowIndex?: number,
        column: object
    }>()
    const $ = root
    const title = computed(() => column.title || column.field)
    const value = computed(() => formatValue.value?.toString())
    const formatValue = computed(() => {
        let v = row[column.field]

        let fv
        if (column.formatter) {
            fv = column.formatter.call(null, v, row, rowIndex)
        }
        else if (column.format) {
            fv = $.getFormatValue(v, row, column.format)
        }
        else if(column.relation?.options.remoteName){
            fv = {
                type: 'relation',
                value: v,
                root,
                ...column.relation?.options
            }
        }
        return fv || v
    })
    const html = computed(() => formatValue.value?.html)

    const type = computed(() => formatValue.value?.type)
    const cellType = computed(() => {
        const {
            getElement
        } = elementUtils()
        return getElement(type.value)
    })
    const cellOptions = computed(() => {
        const opts = { ...formatValue.value }
        delete opts.type
        return opts
    })
    const cellCls = computed(() => column.cellCls)
    const cellText = computed(() => formatValue.value.text)
</script>

<style scoped>
    tr.text-danger .table-cell-text {
        color: rgb(var(--bs-danger-rgb))
    }

    .ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
