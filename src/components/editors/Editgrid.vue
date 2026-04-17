<template>
    <div class="bootstrap-editgrid">
        <table v-if="columnCount>0" class="bootstrap-datagrid table editgrid-table table-hover table-striped table-bordered table-condensed">
            <thead>
                <tr>
                    <th v-for="column in columns" :style="thStyle">{{column.title}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(rowV, rowIndex) in rowValues">
                    <td v-for="column in columns">
                        <div class="editgrid-label" v-if="isReadonly(column, rowIndex)">{{ rowV[column.field]}}</div>
                        <BEditor v-else :type="editorType(column)" :options="editorOptions(column)" :row="rowV" :column="column" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
    import { reactive, watch, onMounted } from 'vue'

    let { modelValue = '', rows = 3, columns = [] } = defineProps<{
        modelValue: String,
        rows: Number,
        columns: Array,
    }>()
    const emit = defineEmits<{
        (e: 'update:modelValue', v: string): void
    }>()

    for (var i = 0; i < columns.length; i++) {
        columns[i].field = i.toString()
    }
    const rowValues = reactive([])

    const columnCount = columns.length
    const thStyle = { width: `${100 / columnCount}%` }

    onMounted(() => {
        const array = []
        for (var i = 0; i < rows; i++) {
            var obj = {}
            columns.forEach(c => obj[c.field] = '')
            array.push(obj)
        }
        try {
            const sRow = JSON.parse(modelValue)

            for (var i = 0; i < rows && sRow.length; i++) {
                const sObj = sRow[i]
                for (var j = 0; j < columns.length && sObj.length; j++) {
                    array[i][columns[j].field] = sObj[j]
                }
            }

        }
        catch (e) { }
        array.forEach(o => rowValues.push(o))
    })

    watch(rowValues, rs => {
        const array = rs.map(r => columns.map(c => r[c.field] || ''))
        const v = JSON.stringify(array)
        emit('update:modelValue', v)
    })

    const isReadonly = (column, rowIndex) => rowIndex < (column.values || []).length
    const editorType = column => column.editor.type || 'textbox'
    const editorOptions = column => column.editor.options || {}

</script>
<style>
    .editgrid-label{
        padding: 6px 12px;
       
    }
</style>
