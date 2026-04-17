<template>
    <!--flow approve/return modal-->
    <BModal ref="refModal" :title="title" style="max-width:700px;margin-top:5px">
        <div ref="refContainer" class="table-responsive" style="max-height: 250px; font-size: 14px">
            <table class="bootstrap-datagrid table table-bordered table-hover table-striped table-condensed table-xsblock">
                <thead>
                    <tr>
                        <th v-for="col in columns" :style="thStyle(col)">
                            {{col.title}}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in flowRows" :class="trCls(row)">
                        <td v-for="col in columns" class="ellipsis" :style="thStyle(col)">
                            <BTableCell :row="row" :rowIndex="rowIndex" :column="col" :root="$"></BTableCell>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <textarea ref="refTextarea" class="form-control" :placeholder="$.getMessage('inputContent')" rows="2" v-model="remark"></textarea>
        <div class="row">
            <div class="col-sm-2">
                <label class="control-label form-field">{{senderLabel}}</label>
            </div>
            <div class="col-sm-4 form-editor">
                <FlowCombo :root="$" type="userGroups" v-model="role" valueField="GROUPID" textField="GROUPNAME" :allowEmpty="true" style="font-size: 14px" />
            </div>
        </div>
        <template v-slot:footer>
            <div v-if="isProcessing" class="progress" style="width:100%;height:30px">
                <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:100%">{{processingMsg}}</div>
            </div>
            <BButton v-else v-for="btn in buttons" :item="btn" :root="$" @click="buttonClick"></BButton>
        </template>
    </BModal>
</template>
<script lang="ts" setup>
    import { ref, reactive, watch, computed } from 'vue'
    import emitter from '@/utils/emitter'
    const { root: $ } = defineProps<{
        root: object
    }>()

    import flowUtils from '@/utils/flowApi'
    const {
        getColumns, getButtons,
        approveFlow, returnFlow
    } = flowUtils($);

    const columns = getColumns(['ActivityText', 'Parameter', 'Result'],
        {
            ActivityText: { style: { 'max-width': '120px', width: '120px' }, cellCls: 'ellipsis' },
            Parameter: { style: { 'max-width': '150px', width: '150px' }, cellCls: 'ellipsis' },
        }
    )

    const refModal = ref()
    const refTextarea = ref()
    watch(refTextarea, () => {
        if (refTextarea.value) {
            refTextarea.value.focus()
        }
    })

    const title = computed(() => $.getMessage(flowMethod.value))
    const senderLabel = computed(() => $.getMessage('sender'))
    const processingMsg = computed(() => $.getMessage('processing') + `(${processedCount.value}/${flowRows.length})`)
    const processedCount = ref(0)
    const isProcessing = ref(false)
    const isSubmited = ref(false)
    const buttons = computed(() => {
        const btns = [!isSubmited.value && 'ok', 'close'].filter(Boolean)
        return getButtons(btns)
    })
    const flowRows = reactive([])
    const flowMethod = ref('approve')
    const remark = ref('')
    const role = ref('')
    const trCls = row => row.Error ? 'text-danger' : ''
    const thStyle = c => c.style

    function open(rows: Array<object>, method: 'approve' | 'return') {
        flowRows.splice(0, flowRows.length)
        rows.forEach(r => flowRows.push(r))
        flowMethod.value = method

        remark.value = ''
        isProcessing.value = false
        isSubmited.value = false
        processedCount.value = 0

        refModal.value.open()
    }

    function buttonClick(item) {
        const me = TOOL_METHODS[item.onclick]
        if (me) {
            me.call()
        }
    }

    const TOOL_METHODS = {
        ok: async function () {
            if (flowRows.filter(r => !r.RoleID).length > 0 && !role.value) {
                $.alertMessage('unableToApprove', 'warning')
            }
            else {
                isProcessing.value = true
                isSubmited.value = true
                for (let i = 0; i < flowRows.length; i++) {
                    processedCount.value = i
                    const flowRow = flowRows[i]
                    const param = {
                        ...flowRow,
                        Remark: remark.value,
                        Role: flowRow.RoleID || role.value
                    }
                    try {
                        let result
                        if (flowMethod.value == 'approve') {
                            result = await approveFlow(param)
                        }
                        else if (flowMethod.value == 'return') {
                            param.ReturnTo = ''
                            result = await returnFlow(param)
                        }
                        flowRow.Result = result
                    }
                    catch (e) {
                        flowRow.Error = $.getErrorText(e)
                    }
                }
            }
            emitter.emit('reloadFlowGrids', ['dgTodo', 'dgHistory', 'dgEnd'])
            isProcessing.value = false
        },
        close: function () {
            refModal.value.close()
        }
    }

    defineExpose({
        open
    })
</script>
<style scoped>
    div.row {
        margin-top: 10px;
    }
</style>