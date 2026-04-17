<template>
    <Tabs :tabs="tabItems" :root="$">
        <template #0>
            <FlowGrid :root="$" ref="$dgTodo" id="dgTodo" flowType="ToDo" :columns="dgTodo_columns" :toolItems="dgTodo_toolItems" rowStyler="dg_rowStyler" />
        </template>
        <template #1>
            <FlowGrid :root="$" ref="$dgHistory" id="dgHistory" flowType="History" :columns="dgHistory_columns" :toolItems="dgHistory_toolItems" :showCheckbox="false" rowStyler="dg_rowStyler" />
            <FlowGrid :root="$" ref="$dgEnd" id="dgEnd" flowType="End" :columns="dgEnd_columns" :toolItems="dgEnd_toolItems" :visible="false" :showCheckbox="false" />
        </template>
        <template #2>
            <FlowGrid :root="$" ref="$dgNotify" id="dgNotify" flowType="Notify" :columns="dgNotify_columns" :toolItems="dgNotify_toolItems" />
        </template>
        <template #3>
            <FlowGrid :root="$" ref="$dgComment" id="dgComment" flowType="Comment" :columns="dgComment_columns" :toolItems="dgComment_toolItems" :queryParam="dgComment_queryParam" />
        </template>
        <!--<template #4>
            <FlowGrid :root="$" ref="$dgWarning" id="dgWarning" flowType="Warning" :columns="dgWarning_columns" :toolItems="dgWarning_toolItems" :queryParam="dgWarning_queryParam" />
        </template>-->
    </Tabs>
    <FlowModals ref="$__modals" :root="$" />
    <BAlert ref="$__alert" :root="$" />
</template>
<script lang="ts" setup>
    import { ref, reactive, computed } from 'vue'
    import emitter from '@/utils/emitter'

    //control ref auto generated
    const $dgTodo = ref()
    const $dgHistory = ref()
    const $dgEnd = ref()
    const $dgNotify = ref()
    const $dgComment = ref()
    const $dgWarning = ref()
    const $__modals = ref()
    const $__alert = ref()

    import pageUtils from '@/utils/pageApi'
    const __functions = {
        //events
        dg_rowStyler,
        //tool command
        refresh, openQuery, openWarningQuery, approveAll, returnAll, toggleHistory,
        deleteAllNotify, readAllComment, showRead, showUnread, confirmAllWarning,
        //row command
        openPage, openApprove, openReturn, openAttachment, retake, openHasten, deleteNotify, openReply, readComment

    }
    const __controls = { $dgTodo, $dgHistory, $dgEnd, $dgNotify, $dgComment, $dgWarning, $__alert }
    const $ = pageUtils(__functions, __controls)
    $.registerFlowModal($__modals)

    import flowUtils from '@/utils/flowApi'
    const {
        getColumns, getCommands,
        retakeFlow, deleteFlowNotify, readFlowComment, confirmFlowWarning
    } = flowUtils($)

    //control properties
    const tabItems = reactive([
        { type: 'ToDo', name: 'todo', count: 0, active: true },
        { type: 'History', name: 'history', count: 0 },
        { type: 'Notify', name: 'notify', count: 0 },
        { type: 'Comment', name: 'comment', count: 0 },
/*        { type: 'Warning', name: 'prewarning', count: 0 }*/
    ])

    //columns
    const dgTodo_columns = getColumns(['FlowText', 'ActivityText', 'SenderName', 'Parameter', 'Status', 'Remark', 'Datetime', 'Attachment'])
    const dgHistory_columns = getColumns(['FlowText', 'ActivityText', 'Receiver', 'Parameter', 'Status', 'Remark', 'Datetime', 'Attachment'])
    const dgEnd_columns = getColumns(['FlowText', 'ActivityText', 'SendFrom', 'Parameter', 'Remark', 'Datetime', 'Attachment'])
    const dgNotify_columns = getColumns(['FlowText', 'ActivityText', 'SenderName', 'Parameter', 'Remark', 'Datetime', 'Attachment'])
    const dgComment_columns = getColumns(['FlowText', 'SenderName', 'Remark', 'Datetime', 'Attachment'])
    const dgWarning_columns = getColumns(['WarningLevel', 'WarningType', 'Subject', 'SenderName', 'Description', 'Datetime', 'PresentationFields'], { WarningLevel: { style: { width: '40px' } } })
    //toolItems
    const dgTodo_toolItems = getCommands(['refresh', 'openQuery', 'approveAll', 'returnAll'])
    const dgHistory_toolItems = getCommands(['refresh', 'openQuery', 'toggleToEnd'])
    const dgEnd_toolItems = getCommands(['refresh', 'openQuery', 'toggleToHistory'])
    const dgNotify_toolItems = getCommands(['refresh', 'openQuery', 'removeAll'])
    const dgComment_toolItems = getCommands(['refresh', 'showRead', 'showUnread', 'readAll'])
    const dgWarning_toolItems = getCommands(['refresh', 'openWarningQuery', 'finishAll'])
    //queryParam
    const dgComment_queryParam = { IsRead: false }
    const dgWarning_queryParam = { IsFinish: false }

    //tool command
    function refresh() {
        this.load()
    }

    async function openQuery() {
        const values = await $.openFlowModal('query')
        this.setWhere(values)
    }

    async function openWarningQuery() {
        const values = await $.openFlowModal('queryW')
        if (values.IsFinish !== true) {
            values.IsFinish = false
            this.isShowCheck = true
        }
        else {
            this.isShowCheck = false
        }
        this.setWhere(values)
    }

    function approveAll() {
        const rows = this.getChecked()
        if (rows.length) {
            const filterRows = rows.filter(r => !r.PlusCount)
            if (filterRows.length) {
                $.openFlowModal('approveReturnAll', filterRows, 'approve')
            }
            else {
                $.alertMessage('unableToApprove', 'warning')
            }
        }
        else {
            $.alertMessage('selectData', 'warning')
        }
    }

    function returnAll() {
        const rows = this.getChecked()
        if (rows.length) {
            const filterRows = rows.filter(r => !r.PlusCount && r.CanReturn)
            if (filterRows.length) {
                $.openFlowModal('approveReturnAll', filterRows, 'return')
            }
            else {
                $.alertMessage('unableToApprove', 'warning')
            }
        }
        else {
            $.alertMessage('selectData', 'warning')
        }
    }

    function toggleHistory() {
        $dgHistory.value.toggleVisible()
        $dgEnd.value.toggleVisible()
    }

    async function deleteAllNotify() {
        const rows = this.getChecked()
        if (rows.length) {
            for (var i = 0; i < rows.length; i++) {
                await deleteFlowNotify(rows[i])
            }
        }
    }

    async function readAllComment() {
        const rows = this.getChecked()
        if (rows.length) {
            await readFlowComment(rows)
        }
    }

    function showRead() {
        this.isShowCheck = false
        this.setWhere({ IsRead: true })
    }

    function showUnread() {
        this.isShowCheck = true
        this.setWhere({ IsRead: false })
    }

    async function confirmAllWarning() {
        const rows = this.getChecked()
        if (rows.length) {
            await confirmFlowWarning(rows)
        }
    }

    //row command
    function openPage(row) {
        const pObj = JSON.parse(row.Parameter)
        row.openStatus = this.flowType.toString()
        const item = {
            id: row.InstanceID,
            text: pObj.tabTitle,
            param: row,
            attributes: {
                form: pObj.E_WEBFORM_NAME || pObj.WEBFORM_NAME
            }
        }
        $.addTab(item)
    }

    function openApprove(row) {
        $.openFlowModal('approveReturn', row, 'approve')
    }

    function openReturn(row) {
        $.openFlowModal('approveReturn', row, 'return')
    }

    function openAttachment(row) {
        $.openFlowModal('attachement', row)
    }

    async function retake(row) {
        await retakeFlow(row)
        $.alertMessage('retake success')
    }

    function openHasten(row) {
        $.openFlowModal('hasten', row)
    }

    async function deleteNotify(row) {
        await deleteFlowNotify(row)
    }

    async function readComment(row) {
        await readFlowComment([row])
    }

    function openReply(row) {
        $.openFlowModal('comment', row)
    }

    async function confirmWarning(row) {
        await confirmFlowWarning([row])
    }

    emitter.on('refreshCount', function(param: any){
        refreshCount(param.type, param.count)
    })

    function refreshCount(type: string, count: number) {
        for (var i = 0; i < tabItems.length; i++) {
            const tabItem = tabItems[i]
            if (tabItem.type == type) {
                tabItem.count = count
                break
            }
        }
    }

    //events
    function dg_rowStyler(index, row) {
        if (row.ExpDatetime) {
            var expDate = new Date(row.ExpDatetime.replace(/\-/g, '/').replace('T', ' '));
            var now = new Date();
            if (expDate.getTime() < now.getTime()) {
                return 'text-danger'
            }
        }
    }


    window.addEventListener('message', function (e) {
        const data = e.data
        if (data.method == 'reloadFlowGrids') {
            reloadFlowGrids(data.ids)
        }
    })

    emitter.on('reloadFlowGrids', reloadFlowGrids)
    function reloadFlowGrids(ids: Array<string>) {
        ids.forEach(id => {
            $['$' + id].value.load()
        })
    }

</script>
<style scoped>
    * {
        font-size: 14px
    }
</style>