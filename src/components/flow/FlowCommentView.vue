<template>
    <div class="datagrid-toolitem d-flex justify-content-end gap-2">
        <BButton defaultCls="btn-sm btn-primary" :item="addItem" :root="$" @click="addComment"></BButton>
    </div>
    <div ref="refContainer" class="panel-group">
        <FlowCommentItem v-for="row in rows" :root="$" :row="row" @reply="reloadComment"/>
        <FlowNewComment ref="refComment" :root="$" @send="reloadComment" @add="scollPanel"/>
    </div>
</template>
<script lang="ts" setup>
    import { ref, reactive, onMounted, nextTick } from 'vue'
    const { root: $, flowRow } = defineProps<{
        root: object,
        flowRow: object
    }>()
    const emit = defineEmits<{
        (e: 'load', rows: array): void;
    }>();

    import flowUtils from '@/utils/flowApi'
    const { queryFlow } = flowUtils($);

    const refComment = ref()
    const addItem = { text: 'insert', iconCls: 'fa-add' }
    const rows = reactive([])
    const refContainer = ref()

    onMounted(async () => {
        load()
    })

    async function load() {
        try {
            const param = {
                type: 'CurrentComment',
                InstanceID: flowRow.InstanceID
            }
            const data = await queryFlow(param)
            loadData(data)
        }
        catch (e) {
            $.showError(e)
        }
    }

    async function loadData(data) {
        rows.splice(0, rows.length)
        const crows = data.rows.filter(r => !r.PActivityID)
        crows.forEach(cr => {
            cr.replies = data.rows.filter(r => r.PActivityID == cr.ActivityID)
        })
        crows.forEach(r => {
            rows.push(r)
        })
        emit('load', crows)
    }

    function addComment(){
        refComment.value.add(flowRow)
    }

    function reloadComment() {
        load()
    }

    function scollPanel() {
        nextTick(() => {
            const container = refContainer.value
            container.scrollTop = container.scrollHeight
        })
    }

</script>
<style scoped>
    .panel-group {
        max-height: 260px;
        height: 260px;
        overflow: auto;
    }

    .pull-right {
        float: right;
    }
</style>