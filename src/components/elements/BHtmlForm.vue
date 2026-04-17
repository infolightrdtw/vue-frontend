<template>
    <form class="form-horizontal" role="form" onsubmit="return false;">
        <div v-for="group in groups" class="row">
            <BField v-for="column in group" :readonly="readonly" :column="column" :row="row" />
        </div>
        <!--<input v-for="column in hiddenColumns" type="hidden" :name="column.field" v-model="row[column.field]" />-->
    </form>
</template>
<script setup lang="ts">
    import { computed, reactive } from 'vue'
    let { row, columns = [], horizontalColumnsCount = 2, readonly= false } = defineProps < {
        row: object,
        columns: Array,
        readonly?: boolean,
        horizontalColumnsCount?: number
    }>()

    const rColumns = reactive(columns)
    const groups = computed(() => groupColumns())

    function groupColumns() {
        const vColumns = rColumns.filter(c => !c.hidden)
        let groups = []
        let group = []
        let columnPosition = 0
        for (let i = 0; i < vColumns.length; i++) {
            let column = vColumns[i]
            if (columnPosition == 0 || column.newRow) {
                group = []
                groups.push(group)
            }
            let span = column.span || 1
            column.labelSpan = horizontalColumnsCount >= 4 ? 1 : 2
            column.colSpan = 12 / horizontalColumnsCount * span - column.labelSpan
            group.push(column)
            columnPosition += span;
            if (columnPosition >= horizontalColumnsCount) {
                columnPosition = 0;
            }
        }
        return groups
    }

    function showColumn(columnName: string) {
        for (let i = 0; i < rColumns.length; i++) {
            if (rColumns[i].field == columnName) {
                rColumns[i].hidden = false
            }
        }
    }

    function hideColumn(columnName: string) {
        for (let i = 0; i < rColumns.length; i++) {
            if (rColumns[i].field == columnName) {
                rColumns[i].hidden = true
            }
        }
    }

    defineExpose({
        showColumn,
        hideColumn
    })
</script>

<style scoped>
</style>
