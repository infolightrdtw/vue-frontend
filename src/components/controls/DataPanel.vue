<template>
    <fieldset v-if="title">
        <legend>
            <span :class="iconCls" @click="toggle"></span>
            <span>{{title}}</span>
        </legend>
        <BHtmlForm ref="refForm" v-show="isShow" :columns="columns" :row ="row" :readonly="readonly" :horizontalColumnsCount="horizontalColumnsCount" />
    </fieldset>

    <BHtmlForm ref="refForm" v-else :columns="columns" :row ="row" :readonly="readonly" :horizontalColumnsCount="horizontalColumnsCount" />
</template>
<script setup lang="ts">
    import { ref, computed, reactive } from 'vue'
    let { columns = [], horizontalColumnsCount = 2, title = '', row, readonly = false } = defineProps<{
        root: object,
        remoteName?: string,
        row: object,
        readonly: boolean,
        columns: Array,
        horizontalColumnsCount: number,
        title?: string
    }>()

    const isShow = ref(true)
    const iconCls = computed(() => ['glyphicon panel-toggle', isShow.value ? 'glyphicon-minus' : 'glyphicon-plus'])
    const refForm = ref()

    function show() {
        isShow.value = true
    }

    function hide() {
        isShow.value = true
    }

    function toggle() {
        isShow.value = !isShow.value
    }

    function showColumn(columnName: string) {
        refForm.value.showColumn(columnName)
    }

    function hideColumn(columnName: string) {
        refForm.value.hideColumn(columnName)
    }

    defineExpose({
        show,
        hide,
        toggle,
        showColumn,
        hideColumn
    })
</script>

<style scoped>
    .panel-toggle {
        margin: 0 5px;
        cursor:pointer;
    }
</style>
