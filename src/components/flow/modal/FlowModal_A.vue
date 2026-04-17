<template>
    <!--flow attachment modal-->
    <BModal ref="refModal" :title="title" style="max-width:600px">
        <FlowAttachments :root="$" :readonly="true" :flowRow="flowRow" v-model="attachments" />
        <template v-slot:footer>
            <BButton v-for="btn in buttons" :item="btn" :root="$" @click="buttonClick"></BButton>
        </template>
    </BModal>
</template>
<script lang="ts" setup>
    import { ref, computed } from 'vue'
    import flowUtils from '@/utils/flowApi'
    const { getButtons } = flowUtils($);
    const { root: $ } = defineProps<{
        root: object
    }>()

    const refModal = ref()
    const title = computed(() => $.getMessage('attachment'))
    const buttons = getButtons(['close'])
    const flowRow = ref({})
    const attachments = computed({
        get: () => {
            if (flowRow.value.Parameter) {
                const pObj = JSON.parse(flowRow.value.Parameter)
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

    const TOOL_METHODS = {
        close: function () {
            refModal.value.close()
        }
    }

    defineExpose({
        open
    })

</script>