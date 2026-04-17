<template>
    <div :class="labelDivCls"><label class="control-label form-field">{{column.title}}</label></div>
    <div :class="editorDivCls"><BEditor :type="editorType" :options="editorOptions" :row="row" :column="column" /></div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    let { row, column, readonly = false } = defineProps<{
        row: object,
        column: object,
        readonly?: boolean
    }>()

    const labelDivCls = computed(() => `col-sm-${column.labelSpan}`)
    const editorDivCls = computed(() => `col-sm-${column.colSpan} form-editor`)
    const editorType = computed(() => column.editor ? (column.editor.type || 'textbox') : 'textbox')
    const editorOptions = computed(() => {
        const opts = { ...(column.editor ? (column.editor.options || {}) : {}) }
        if (readonly) {
            opts.readonly = true
        }
        return opts
    })
</script>

<style scoped>
</style>
