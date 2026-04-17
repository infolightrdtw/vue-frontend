<template>
    <!--flow detail modal-->
    <BModal ref="refModal" :title="title" style="max-width:600px;margin-top:5px">
        <Tabs mode="tab" ref="refTab" :tabs="tabItems" :root="$">
            <template #0>
                <FlowGrid :root="$" flowType="Detail" :columns="dgDetail_columns" :loadParam="dgDetail_loadParam" :pagination="false" :showCommand="false" :showCheckbox="false" style="max-height: 250px; min-height: 250px; font-size: 14px" />
            </template>
            <template #1>
                <FlowAttachments :readonly="true" :root="$" :flowRow="flowRow" v-model="attachments" />
            </template>
        </Tabs>
        <template v-slot:footer>
            <BButton v-for="btn in buttons" :item="btn" :root="$" @click="buttonClick"></BButton>
        </template>
    </BModal>
</template>
<script lang="ts" setup>
    import { ref, reactive, watch, computed } from 'vue'
    const { root: $ } = defineProps<{
        root: object
    }>()

    import flowUtils from '@/utils/flowApi'
    const {
        getColumns, getButtons
    } = flowUtils($);

    const tabItems = reactive([
        { name: 'remark', active: true },
        { name: 'attachment' }
    ])

    const dgDetail_columns = getColumns(['ActivityText', 'SendFrom', 'Status', 'Remark', 'Datetime'])
    const dgDetail_loadParam = computed(() => {
        return { InstanceID: flowRow.value.InstanceID }
    })

    const refModal = ref()
    const refTab = ref()
    watch(refTab, () => {
        if (refTab.value) {
            refTab.value.select(0)
        }
    })
    const title = computed(() => $.getMessage('historyRemark'))
    const buttons = getButtons(['preview', 'close'])
    const flowRow = ref({})
    const attachments = computed({
        get: () => {
            if (flowRow.value.Parameter) {
                const pObj = JSON.parse(flowRow.value.Parameter)
                refreshCount('attachment', (pObj.ATTACHMENTS || '').split(';').filter(Boolean).length)
                return pObj.ATTACHMENTS
            }
        },
        set: (v) => { }
    })

    function open(row: object) {
        flowRow.value = row
        refModal.value.open()
    }

    function buttonClick(item) {
        const me = TOOL_METHODS[item.onclick]
        if (me) {
            me.call()
        }
    }

    function refreshCount(name: string, count: number) {
        for (var i = 0; i < tabItems.length; i++) {
            const tabItem = tabItems[i]
            if (tabItem.name == name) {
                tabItem.count = count
                break
            }
        }
    }

    const TOOL_METHODS = {
        openPreview: function () {
            $.openFlowModal('preview', flowRow.value)
        },
        close: function () {
            refModal.value.close()
        }
    }

    defineExpose({
        open
    })

</script>
