<template>
    <component :is="editor" v-bind="effectiveOptions" v-model="row[column.field]" />
</template>

<script setup lang="ts">
    import { computed } from 'vue'
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

    const RENAME_STYLE_EDITORS = new Set(['switch', 'switchbutton'])
    const effectiveOptions = computed(() => {
        const o: Record<string, unknown> = { ...(options as Record<string, unknown>) }
        if (RENAME_STYLE_EDITORS.has(type) && typeof o.style === 'string' && o.style && o.type == null) {
            o.type = o.style
            delete o.style
        }
        return o
    })

</script>

<style scoped>
</style>
