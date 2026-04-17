<template>
    <!--flow user/role modal-->
    <BModal ref="refModal" :title="title" style="max-width:600px;margin-top:5px">
        <FlowGrid :root="$" ref="$datagrid" mode="data" :pageSize="8" :flowType="dataType" :columns="datagrid_columns" :showCommand="false" style="font-size:14px;margin-bottom:0" />
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

    const datagrid_columns = computed(() => {
        if (dataType.value == 'Users') {
            return getColumns(['UserID', 'UserName']).value
        }
        else {
            return getColumns(['RoleID', 'RoleName']).value
        }
    })

    const datagrid_loadParam = computed(() => {
        return { InstanceID: flowRow.value.InstanceID }
    })

    const refModal = ref()
    const $datagrid = ref()

    const title = computed(() => dataType.value == 'Users' ? $.getMessage('select user') : $.getMessage('select role'))
    const buttons = getButtons(['ok', 'cancel'])
    const flowRow = ref({})
    const dataType = ref('')

    let resolvePromise
    function open(row: object, type: 'Users' | 'Roles') {
        flowRow.value = row
        dataType.value = type
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
            refModal.value.close()
            if (resolvePromise) {
                const rows = $datagrid.value.getChecked()
                resolvePromise(rows)
            }
        },
        close: function () {
            refModal.value.close()
        }
    }

    const EXPOSE_METHODS = {
        open
    }

    defineExpose({
        open
    })

</script>
