<template>
    <BButton v-for="item in commands" :root="$" :item="item" :showText="false" defaultCls="btn-sm btn-link datagrid-btn" @click="click"></BButton>
</template>
<script lang="ts" setup>
    import { computed } from 'vue'

    const { root: $, flowType = 'todo', row, queryValues = {} } = defineProps<{
        root: object,
        flowType?: string,
        row: object,
        queryValues?: object
    }>()

    const emit = defineEmits<{
        (e: 'click', item: object, row: object): void;
    }>();
    import flowUtils from '@/utils/flowApi'
    const { getCommands } = flowUtils($)

    const commands = computed(() => {
        const names = ['openPage']
        switch (flowType) {
            case 'ToDo': {
                if (!hasPlus()) {
                    names.push('openApprove')
                    if (canReturn()) {
                        names.push('openReturn')
                    }
                }
                break
            }
            case 'History': {
                if (canRetake()) {
                    names.push('retake')
                }
                names.push('hasten')
                break
            }
            case 'Notify': {
                names.push('deleteNotify')
                break
            }
            case 'Comment': {
                names.push('reply')
                if (!queryValues.IsRead) {
                    names.push('readComment')
                }
                break
            }
            case 'Message': {

                break
            }
        }
        return getCommands(names)
    })

    const hasPlus = () => row.PlusCount > 0
    const canReturn = () => row.CanReturn
    const canRetake = () => row.CanRetake !== false

    function click(item: object) {
        emit('click', item, row)
    }
</script>