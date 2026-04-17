<template>
    <!--flow comment modal-->
    <BModal ref="refModal" :title="title" style="max-width: 600px">
        <FlowCommentItem :root="$" :row="flowRow" :showReply="false" />
        <FlowNewComment ref="refComment" :root="$"/>
        <template v-slot:footer>
            <BButton v-for="btn in buttons" :item="btn" :root="$" @click="buttonClick"></BButton>
        </template>
    </BModal>
</template>
<script lang="ts" setup>
    import { ref, computed, watch } from 'vue'
    const { root: $ } = defineProps<{
        root: object
    }>()

    import flowUtils from '@/utils/flowApi'
    const {
        getColumns, getButtons, reloadFlowGrids
    } = flowUtils($);

    const refModal = ref()
    const refComment = ref()
    watch(refComment, () => {
        if (refComment.value) {
            refComment.value.reply(flowRow.value)
        }
    })
    const title = computed(() => $.getMessage('reply'))
    const buttons = getButtons(['ok', 'close'])
    const flowRow = ref()

    let resolvePromise
    function open(row: object) {
        row.replies = []
        flowRow.value = row
        refModal.value.open()
        return new Promise((resolve) => {
            resolvePromise = resolve
        })
    }

    function buttonClick(item) {
        const me = TOOL_METHODS[item.onclick]
        if (me) {
            me.call()
        }
    }

    const TOOL_METHODS = {
        ok: async function () {
            if (await refComment.value.send()) {
                refModal.value.close()
                reloadFlowGrids(['dgComment'])
                if (resolvePromise) {
                    resolvePromise(true)
                }
            }
        },
        close: function () {
            refModal.value.close()
        }
    }

    defineExpose({
        open
    })

</script>