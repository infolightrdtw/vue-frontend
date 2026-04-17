<template>
    <component :is="editor" v-bind="options" v-model="row[column.field]" />
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    let { type, options, row, column } = defineProps<{
        type: string,
        options: object,
        row: object,
        column: object
    }>()

    import editorUtils from '@/utils/editorApi'
    const {
        getEditor
    } = editorUtils()
    const editor = getEditor(type)

</script>

<style scoped>
</style>
