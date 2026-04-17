<template>
    <span v-if="flowStatus" class="flow-status" :class="spanCls" style="cursor:pointer" @click="click" v-html="text"></span>
</template>
<script lang="ts" setup>
    import { computed } from 'vue'
    const { root:$, value = '' } = defineProps<{
        root: object,
        value?: string
    }>()

    
    const flowStatus = computed(() => {
        let status
        const v = value.split(':')
        if (v.length == 2) {
            switch (v[0]) {
                case 'P':
                    status = 'paused'
                    break
                case 'N':
                    status = 'approving'
                    break;
                case 'Z':
                    status = 'approved'
                    break;
                case 'X':
                    status = 'rejected'
                    break;
            }
        }
        return status
    })

    const spanCls = computed(() => `flow-${flowStatus.value}`)
    const text = computed(() => $.getMessage(flowStatus.value))

    function click() {
        const v = value.split(':')
        $.openFlowModal('detail', { InstanceID: v[1] })
    }
</script>
