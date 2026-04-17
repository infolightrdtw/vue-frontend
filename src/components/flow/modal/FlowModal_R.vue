<template>
    <!--flow reciver modal-->
    <BModal ref="refModal" :title="title" style="max-width: 600px">
        <FlowGrid :root="$" ref="$datagrid" mode="data" flowType="UserInfos" :columns="datagrid_columns" :loadParam="datagrid_loadParam" :pagination="false" :showCommand="false" :showCheckbox="false" style="max-height:250px;min-height:250px;font-size:14px" />
        <template v-slot:footer>
            <BButton v-for="btn in buttons" :item="btn" :root="$" @click="buttonClick"></BButton>
        </template>
    </BModal>
</template>
<script lang="ts" setup>
    import { ref, computed } from 'vue'
    const { root: $ } = defineProps<{
        root: object
    }>()

    import flowUtils from '@/utils/flowApi'
    const {
        getColumns, getButtons
    } = flowUtils($);

    const datagrid_columns = getColumns(['UserID', 'UserName', 'UserType'])
    const datagrid_loadParam = computed(() => {
        return {
            InstanceID: flowRow.value.InstanceID,
            Group: flowRow.value.RoleID || '',
            User: flowRow.value.UserID || '',
        }
    })

    const refModal = ref()
    const title = computed(() => $.getMessage('historyRemark'))
    const buttons = getButtons(['close'])
    const flowRow = ref()

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