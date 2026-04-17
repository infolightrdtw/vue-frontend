<template>
    <!--flow submit/approve/return modal-->
    <BModal ref="refModal" :title="title" style="max-width:600px;margin-top:5px">
        <Tabs mode="tab" ref="refTab" :tabs="tabItems" :root="$">
            <template #0>
                <FlowGrid :root="$" flowType="Detail" :columns="dgDetail_columns" :loadParam="dgDetail_loadParam" :pagination="false" :showCommand="false" :showCheckbox="false" style="max-height:150px;min-height:150px;font-size:14px" />
                <textarea ref="refTextarea" class="form-control" :placeholder="$.getMessage('inputContent')" rows="2" v-model="remark"></textarea>
                <div class="row">
                    <div class="col-sm-2">
                        <label class="control-label form-field">{{senderLabel}}</label>
                    </div>
                    <div class="col-sm-4 form-editor">
                        <FlowCombo :root="$" type="userGroups" v-model="role" :disabled="roleDisabled" valueField="GROUPID" textField="GROUPNAME" :allowEmpty="false" style="font-size: 14px" />
                    </div>
                    <div v-if="returnVisible" class="col-sm-2">
                        <label class="control-label form-field">{{returnToLabel}}</label>
                    </div>
                    <div v-if="returnVisible" class="col-sm-4 form-editor">
                        <FlowCombo :root="$" type="previvousActivities" v-model="returnTo" valueField="ID" textField="Text" :emptyLabel="comboReturnTo_EmptyLabel" :loadParam="comboReturnTo_loadParam" style="font-size: 14px" />
                    </div>
                </div>
                <div class="d-flex flex-wrap gap-1">
                    <span v-for="msg in messages" class="label label-danger">{{msg}}</span>
                </div>

            </template>
            <template #1>
                <FlowAttachments :readonly="isSubmited" :root="$" :flowRow="flowRow" v-model="attachments" />
            </template>
            <template #2>
                <FlowCommentView :root="$" :flowRow="flowRow" @load="commentLoad"/>
            </template>
        </Tabs>
        <template v-slot:footer>
            <div v-if="isProcessing" class="progress" style="width:100%;height:30px">
                <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:100%">{{processingMsg}}</div>
            </div>
            <BButton v-else v-for="btn in buttons" :item="btn" :root="$" @click="buttonClick"></BButton>
        </template>
    </BModal>
</template>
<script lang="ts" setup>
    import { ref, reactive, watch, computed, toRaw } from 'vue'
    import emitter from '@/utils/emitter'
    const { root: $ } = defineProps<{
        root: object
    }>()

    import flowUtils from '@/utils/flowApi'
    const {
        getColumns, getButtons, reloadFlowGrids, isFlowStatus,
        submitFlow, approveFlow, returnFlow, rejectFlow
    } = flowUtils($);

    const tabItems = reactive([
        { name: 'remark', active: true },
        { name: 'attachment' },
        { name: 'comment' }
    ])

    const dgDetail_columns = getColumns(['ActivityText', 'SendFrom', 'Status', 'Remark', 'Datetime'])
    const dgDetail_loadParam = computed(() => {
        return { InstanceID: flowRow.value.InstanceID }
    })
    const comboReturnTo_EmptyLabel = computed(() => $.getMessage('lastActivity'))
    const comboReturnTo_loadParam = computed(() => {
        return {
            InstanceID: flowRow.value.InstanceID,
            ActivityID: flowRow.value.ActivityID
        }
    })

    const refModal = ref()
    const refTab = ref()
    watch(refTab, () => {
        if (refTab.value) {
            refTab.value.select(0)
        }
    })
    const refTextarea = ref()
    watch(refTextarea, () => {
        if (refTextarea.value) {
            refTextarea.value.focus()
        }
    })
    const title = computed(() => $.getMessage(flowMethod.value))
    const senderLabel = computed(() => $.getMessage('sender'))
    const returnToLabel = computed(() => $.getMessage('returnTo'))
    const processingMsg = computed(() => $.getMessage('processing'))
    const returnVisible = computed(() => flowMethod.value == 'return' && !isFlowStatus(flowRow.value, 'Plus'))
    const isProcessing = ref(false)
    const isSubmited = ref(false)
    const buttons = computed(() => {
        const btns = [!isSubmited.value && 'ok', 'preview', 'close'].filter(Boolean)
        return getButtons(btns)
    })
    const flowRow = ref({})
    const flowMethod = ref('submit')
    const remark = ref('')
    const role = ref('')
    const roleDisabled = computed(() => flowRow.value.RoleID != '')
    const returnTo = ref('')
    const attachments = computed({
        get: () => {
            if (flowRow.value.Parameter) {
                const pObj = JSON.parse(flowRow.value.Parameter)
                refreshCount('attachment', (pObj.ATTACHMENTS || '').split(';').filter(Boolean).length)
                return pObj.ATTACHMENTS
            }
        },
        set: (v) => {
            const pObj = JSON.parse(flowRow.value.Parameter)
            pObj.ATTACHMENTS = v
            refreshCount('attachment', pObj.ATTACHMENTS.split(';').filter(Boolean).length)
            flowRow.value.Parameter = JSON.stringify(pObj)
        }
    })
    const messages = reactive([])

    function commentLoad(rows) {
        refreshCount('comment', rows.length)
    }

    let resolvePromise
    async function open(row: object, method: 'submit' | 'approve' | 'return' | 'reject') {
        flowRow.value = row
        flowMethod.value = method
        role.value = row.RoleID

        messages.splice(0, messages.length)
        returnTo.value = ''
        remark.value = ''
        isProcessing.value = false
        isSubmited.value = false

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
        ok: async function () {

            refTab.value.select(0)

            const param = {
                ...flowRow.value,
                Remark: remark.value,
                Role: role.value,
            }

            let result
            try {
                isProcessing.value = true
                if (flowMethod.value == 'submit') {
                    if (param.InstanceID && param.ActivityID) {
                        result = await approveFlow(param)
                    }
                    else {
                        result = await submitFlow(param)
                    }
                }
                else if (flowMethod.value == 'approve') {
                    result = await approveFlow(param)
                }
                else if (flowMethod.value == 'return') {
                    if (returnTo.value) {
                        param.ReturnTo = returnTo.value
                    }
                    result = await returnFlow(param)
                }
                else if (flowMethod.value == 'reject') {
                    result = await rejectFlow(param)
                }
                isSubmited.value = true
                result.split(/\n/g).filter(Boolean).forEach(t => {
                    messages.push(t)
                })

                reloadFlowGrids(['dgTodo', 'dgHistory', 'dgEnd'])
            }
            catch (e) {
                $.showError(e, true)
            }
            finally {
                isProcessing.value = false
            }
        },
        openPreview: function () {
            $.openFlowModal('preview', flowRow.value)
        },
        close: function () {
            refModal.value.close()
            resolvePromise(isSubmited.value)
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

    label.form-field,
    textarea {
        font-size: 14px
    }
</style>