<template>
    <div v-if="processingText" class="progress" style="width:200px;height:38px;margin-top:4px">
        <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:100%">{{processingMsg}}</div>
    </div>
    <BButton v-else v-for="item in buttons" :root="$" :item="item" defaultCls="btn btn-primary" @click="click"></BButton>
</template>
<script lang="ts" setup>
    import { ref, reactive, computed } from 'vue'
    const { root: $, formID, autoPause = false, flowRow = {} } = defineProps<{
        root: object,
        formID: string,
        autoPause?: bool,
        flowRow?: object
    }>()

    import flowUtils from '@/utils/flowApi'
    const {
        isFlowStatus, isPlus, isFlowMode, getButtons, reloadFlowGrids,
        pauseFlow, deleteFlowNotify, queryFlow
    } = flowUtils($)

    const buttons = computed(() => {
        const names = []
        const openStatus = flowRow.openStatus
        switch (openStatus) {
            case 'Submit': {
                names.push(...['pause', 'submit', 'cancel'])
                break
            }
            case 'Reject': {
                names.push(...['reject', 'cancel'])
                break
            }
            case 'View': {
                names.push(...['view', 'close'])
                break
            }
            case 'ToDo': {
                if (!hasPlus()) {
                    names.push(...[
                        isPause() && 'pause', isPause() ? 'submit' : 'approve', canReturn() && 'return', 
                        canPlus() && 'plus', canPlusTransfer() && 'plusTransfer',
                        canReject() && 'reject', canPrint() && 'print', canNotify() && 'notify', 'cancel'
                    ])
                }
                else {
                    names.push(...['notify', canPrint() && 'print', 'close'])
                }
                break
            }
            case 'History':
            case 'End':
            case 'Comment': {
                names.push(...['view', canPrint() && 'print', 'close'])
                break
            }
            case 'Notify': {
                names.push(...['view', 'deleteNotify', canPrint() && 'print', 'close'])
                break
            }
        }
        return getButtons(names.filter(Boolean).filter(n => hiddenBtns.indexOf(n) < 0))
    })

    const processingText = ref('')
    const processingMsg = computed(() => $.getMessage(processingText.value))
    const hiddenBtns = reactive([])
    const hasPlus = () => flowRow.PlusCount > 0
    const isPause = () => isFlowStatus(flowRow, 'Prepare')
    const canReturn = () => flowRow.CanReturn
    const canNotify = () => flowRow.ActivityID != 'StartActivity'
    const canPlus = () => flowRow.CanPlus
    const canPlusTransfer = () => isFlowStatus(flowRow, 'ContinousPlus')
    const canReject = () => flowRow.CanReject && !isPlus(flowRow)
    const canPrint = () => flowRow.CanPrint

    function closeModal() {
        const flowParam = $.getEncryptParameters()
        if (isFlowMode(flowParam, 'Prepare')) {
            $['$' + formID].value.close()
        }
        else {
            $.closeCurrentTab()
        }
    }

    function loading(msg: string) {
        processingText.value = msg
    }

    function loaded(msg: string) {
        processingText.value = ''
    }

    async function submitForm() {
        loading('saving')
        var result = await $['$' + formID].value.submit(false)
        loaded()
        if (result) {
            initParam()
        }
        return result
    }

    async function pause() {
        initParam()
        loading('processing')
        try {
            const result = await pauseFlow(flowRow)
            reloadFlowGrids(['dgTodo'])
            if (result) {
                const InstanceID = result.Instance[0].InstanceID
                const queryResult = await queryFlow({ type: 'CurrentToDo', InstanceID })
                if (queryResult.rows.length) {
                    const qRow = queryResult.rows[0]
                    delete flowRow['XomlName']
                    delete flowRow['WEBFORM_NAME']
                    Object.keys(qRow).forEach(k => {
                        flowRow[k] = qRow[k]
                    })
                }
                else {
                    $.showError('flow notExist', true)
                    return false
                }
            }
            return true
        }
        catch (e) {
            $.showError(e, true)
            return false
        }
        finally {
            loaded()
        }
    }

    function initParam() {
        flowRow.Parameter = $['$' + formID].value.getFlowParameter(flowRow)
        if (flowRow.XomlName) {
            flowRow.FlowID = flowRow.XomlName;
        }
    }

    function click(item: object) {
        const me = BUTTON_METHODS[item.onclick]
        if (me) {
            me.call()
        }
    }

    const BUTTON_METHODS = {
        pause: async function () {
            if (await submitForm()) {
                if (await pause()) {
                    $.alertMessage('pause success')
                }
            }
        },
        openSubmit: async function () {
            if (await submitForm()) {
                if (autoPause) {
                    if (!await pause()) {
                        return
                    }
                }
                const isSubmited = await $.openFlowModal('approveReturn', flowRow, 'submit')
                if (isSubmited) {
                    closeModal()
                }
            }
        },
        openApprove: async function () {
            if (await submitForm()) {
                const isApproved = await $.openFlowModal('approveReturn', flowRow, 'approve')
                if (isApproved) {
                    closeModal()
                }
            }
        },
        openReturn: async function () {
            if (await submitForm()) {
                const isReturned = await $.openFlowModal('approveReturn', flowRow, 'return')
                if (isReturned) {
                    closeModal()
                }

            }
        },
        openView: function () {
            $.openFlowModal('detail', flowRow)
        },
        openNotify: async function () {
            if (await submitForm()) {
                $.openFlowModal('notifyPlus', flowRow, 'notify')
            }
        },
        openPlus: async function () {
            if (await submitForm()) {
                const isPlused = await $.openFlowModal('notifyPlus', flowRow, 'plus')
                if (isPlused) {
                    hiddenBtns.push(...['approve', 'return'])
                    reloadFlowGrids(['dgTodo'])
                }
            }
        },
        openPlusTransfer: async function () {
            if (await submitForm()) {
                const isPlused = await $.openFlowModal('notifyPlus', flowRow, 'plusTransfer')
                if (isPlused) {
                    hiddenBtns.push(...['approve', 'return', 'plusTransfer'])
                    reloadFlowGrids(['dgTodo', 'dgHistory'])
                }
            }
        },
        openReject: async function () {
            if (await submitForm()) {
                const isRejected = await $.openFlowModal('approveReturn', flowRow, 'reject')
                if (isRejected) {
                    closeModal()
                }
            }
        },
        deleteNotify: async function () {
            loading('deleting')
            try {
                await deleteFlowNotify(flowRow)
                hiddenBtns.push('deleteNotify')
                reloadFlowGrids(['dgNotify'])
            }
            catch (e) {
                $.showError(e, true)
            }
            finally {
                loaded()
            }
        },
        close: function () {
            $['$' + formID].value.close()
        }
    }
</script>