<template>
    <!--flow preview modal-->
    <BModal ref="refModal" :title="title" :showFooter="false" style="max-width: 90%; margin-top: 5px; margin-bottom: 0">
        <div :style="style">
            <FlowPreview :root="$" :flowParam="flowRow" />
        </div>
    </BModal>
</template>
<script lang="ts" setup>
    import '@/assets/stylesheets/flow.css'
    import { ref, computed } from 'vue'
    import flowUtils from '@/utils/flowApi'
    const { } = flowUtils();
    const { root: $ } = defineProps<{
        root: object
    }>()

    const refModal = ref()
    const title = computed(() => $.getMessage('preview'))
    const flowRow = ref()
    const style = computed(() => {
        let h = document.body.clientHeight - 120
        return { height: `${h}px`, overflow: 'auto' }
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