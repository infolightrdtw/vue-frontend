import axios from 'axios'
import { computed } from 'vue';
axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

export default function (root: any) {
    const flowApiUrl = '/api/ApiMain/flow';

    const $ = root

    async function callFlowMethod(method: string, flowParam: object) {
        const param = {
            mode: 'callFlowMethod',
            method,
            ...flowParam
        }
        const { data: result } = await axios.post(flowApiUrl, param)
        return result

    }

    async function pauseFlow(flowParam: object) {
        if (isFlowStatus(flowParam, 'Prepare')) {

        }
        else {
            return callFlowMethod('Prepare', flowParam)
        }
    }

    async function submitFlow(flowParam: object) {
        return callFlowMethod('Start', flowParam)
    }

    async function approveFlow(flowParam: object) {
        if (isPlus(flowParam)) {
            return callFlowMethod('PlusApprove', flowParam)
        }
        else {
            return callFlowMethod('Submit', flowParam)
        }
    }

    async function returnFlow(flowParam: object) {
        if (isPlus(flowParam)) {
            return callFlowMethod('PlusReturn', flowParam)
        }
        else {
            return callFlowMethod('Return', flowParam)
        }
    }

    async function retakeFlow(flowParam: object) {
        return callFlowMethod('Retake', {
            InstanceID: flowParam['InstanceID'],
            ActivityID: flowParam['ActivityID']
        })
    }

    async function notifyFlow(flowParam: object) {
        if (isPlus(flowParam)) {
            return callFlowMethod('PlusNotify', flowParam)
        }
        else {
            return callFlowMethod('Notify', flowParam)
        }
    }

    async function plusFlow(flowParam: object) {
        return callFlowMethod('Plus', flowParam)
    }

    async function plusTransferFlow(flowParam: object) {
        return callFlowMethod('PlusTransfer', flowParam)
    }

    async function commentFlow(flowParam: object) {
        return callFlowMethod('Comment', flowParam)
    }

    async function rejectFlow(flowParam: object) {
        return callFlowMethod('Reject', flowParam)
    }

    async function previewFlow(flowParam: object) {
        return callFlowMethod('Preview', flowParam)
    }

    async function deleteFlowNotify(flowParam: object) {
        return callFlowMethod('DeleteNotify', {
            InstanceID: flowParam['InstanceID'],
            ActivityID: flowParam['ActivityID']
        })
    }

    async function readFlowComment(flowParams: Array<object>) {
        const ReplyID = flowParams.map(r => r['ReplyID']).join(',')
        return callFlowMethod('ReadComment', { ReplyID })
    }

    async function confirmFlowWarning(flowParams: Array<object>) {
        const WarningID = flowParams.map(r => r['ID']).join(',')
        return callFlowMethod('ConfirmWarning', { WarningID })
    }

    const FLOW_COLUMNS = {
        FlowText: { field: 'FlowText', title: 'flow' },
        ActivityText: { field: 'ActivityText', title: 'workName' },
        SenderName: { field: 'SenderName', title: 'sendFrom' },
        Receiver: { field: 'UserName', title: 'reciever', formatter: formatterReciever },
        SendFrom: { field: 'UserName', title: 'sendFrom', formatter: formatterSenderFrom },
        Parameter: { field: 'Parameter', title: 'flowCondition', formatter: formatterParameter },
        Status: { field: 'Status', title: 'status', formatter: formatterStatus },
        Remark: { field: 'Remark', title: 'remark' },
        Content: { field: 'Remark', title: 'content' },
        Datetime: { field: 'Datetime', title: 'date', format: 'yyyy/MM/dd hh:mm:ss' },
        Attachment: { field: 'Attachment', title: 'attachment', formatter: formatterAttachment },
        WarningLevel: { field: 'Level', title: 'level', formatter: formatterWarningStyle },
        WarningType: { field: 'Type', title: 'type', formatter: formatterWarningType },
        Subject: { field: 'Subject', title: 'subject' },
        Description: { field: 'Description', title: 'description' },
        PresentationFields: { field: 'PresentationFields', title: 'flowCondition' },
        Result: { field: 'Result', title: 'result', formatter: formatterResult },
        UserID: { field: 'USERID', title: 'user id', style: { width: '200px' } },
        UserName: { field: 'USERNAME', title: 'user name' },
        UserType: { field: 'UserType', title: 'user type', formatter: formatterUserType},
        RoleID: { field: 'GROUPID', title: 'role id', style: { width: '200px' } },
        RoleName: { field: 'GROUPNAME', title: 'role name' }
    }

    function getColumns(names: Array<string>, columnProps: object = {}) {
        return computed(() => {
            return names.map(n => {
                const column = FLOW_COLUMNS[n]
                const title = $.getMessage(column.title) || column.title
                return { ...column, ...{ title }, ...columnProps[n] }
            }).filter(Boolean)
        })
    }

    const FLOW_COMMANDS = {
        //row command
        openPage: { text: 'view', iconCls: 'fa-folder-open', onclick: 'openPage' },
        openApprove: { text: 'approve', iconCls: 'fa-check-square', onclick: 'openApprove' },
        openReturn: { text: 'back', iconCls: 'fa-arrow-circle-left', onclick: 'openReturn' },
        retake: { text: 'retake', iconCls: 'fa-retweet', onclick: 'retake', loading: true, reload: ['dgTodo', 'dgHistory'] },
        hasten: { text: 'hasten', iconCls: 'fa-warning', onclick: 'openHasten' },
        deleteNotify: { text: 'remove notify', iconCls: 'fa-remove', onclick: 'deleteNotify', loading: true, reload: ['dgNotify'] },
        reply: { text: 'reply', iconCls: 'fa-reply', onclick: 'openReply' },
        readComment: { text: 'read', iconCls: 'fa-check', onclick: 'readComment', loading: true, reload: ['dgComment'] },

        //tool command
        refresh: { text: 'refresh', iconCls: 'fa-refresh', onclick: 'refresh' },
        openQuery: { text: 'query', iconCls: 'fa-search', onclick: 'openQuery' },
        openWarningQuery: { text: 'query', iconCls: 'fa-search', onclick: 'openWarningQuery' },
        approveAll: { text: 'approveall', iconCls: 'fa-check', onclick: 'approveAll' },
        returnAll: { text: 'returnall', iconCls: 'fa-arrow-circle-left', onclick: 'returnAll' },
        toggleToEnd: { text: 'finished', iconCls: '', onclick: 'toggleHistory' },
        toggleToHistory: { text: 'history', iconCls: '', onclick: 'toggleHistory' },
        showRead: { text: 'showRead', iconCls: 'fa-envelope-open', onclick: 'showRead' },
        showUnread: { text: 'showUnread', iconCls: 'fa-envelope', onclick: 'showUnread' },
        removeAll: { text: 'removeall', iconCls: 'fa-remove', onclick: 'deleteAllNotify', loading: true, reload: ['dgNotify'] },
        readAll: { text: 'readTogether', iconCls: 'fa-check', onclick: 'readAllComment', loading: true, reload: ['dgComment'] },
        finishAll: { text: 'finishall', iconCls: 'fa-check', onclick: 'confirmAllWarning', loading: true, reload: ['dgWarning'] }
    }

    function getCommands(names: Array<string>) {
        return names.map(n => FLOW_COMMANDS[n]).filter(Boolean)
    }

    const FLOW_BUTTONS = {
        pause: { text: 'draft', onclick: 'pause' },
        submit: { text: 'submit', onclick: 'openSubmit' },
        approve: { text: 'approve', onclick: 'openApprove' },
        'return': { text: 'back', onclick: 'openReturn' },
        reject: { text: 'reject', btnCls: 'btn-danger', onclick: 'openReject' },
        preview: { text: 'preview', btnCls: 'btn-primary', onclick: 'openPreview' },
        plus: { text: 'plus', onclick: "openPlus" },
        plusTransfer: { text: 'plusTransfer', onclick: "openPlusTransfer" },
        notify: { text: 'notify', btnCls: ' btn-default', onclick: "openNotify" },
        deleteNotify: { text: 'remove notify', btnCls: 'btn-danger', onclick: 'deleteNotify' },
        view: { text: 'view', onclick: "openView" },
        print: { text: 'print', onclick: "print" },
        ok: { text: 'ok', btnCls: 'btn-primary', onclick: 'ok' },
        cancel: { text: 'cancel', btnCls: ' btn-default', onclick: "close" },
        close: { text: 'close', btnCls: ' btn-default', onclick: "close" }
    }

    function getButtons(names: Array<string>) {
        return names.map(n => FLOW_BUTTONS[n]).filter(Boolean)
    }

    const FLOW_STATUS = {
        Start: { value: 0, text: 'submit' },
        Submit: { value: 1, text: 'approve' },
        Return: { value: 2, text: 'back' },
        Retake: { value: 3, text: 'retake' },
        Plus: { value: 5, text: 'plus' },
        Transfer: { value: 6, text: 'transfer' },
        Reject: { value: 7, text: 'reject' },
        Prepare: { value: 8, text: 'startFlow' },
        End: { value: 9, text: 'finished' },
        Detail: { value: 10, text: 'multiapprove' },
        Notify: { value: 11, text: 'notify' },
        ContinousPlus: { value: 15, text: 'plus' }
    }

    function isFlowStatus(flowParam: object, status: 'Start' | 'Submit' | 'Return' | 'Retake' | 'Plus' | 'Reject' | 'Prepare' | 'End' | 'ContinousPlus') {
        return flowParam['Status'] == FLOW_STATUS[status].value
    }

    function isPlus(flowParam: object) {
        return isFlowStatus(flowParam, 'Plus') || isFlowStatus(flowParam, 'ContinousPlus')
    }

    function getEnumObj(obj: object) {
        const enumObj = {}
        Object.keys(obj).forEach((k: any) => {
            enumObj[obj[k].value] = obj[k].text
        })
        return enumObj
    }

    const FLOW_STATUS_VALUES = getEnumObj(FLOW_STATUS)

    function formatterStatus(value: any) {
        return {
            type: 'lText',
            value: FLOW_STATUS_VALUES[value],
            root
        }
    }

    const FLOW_MODES = {
        View: 0,
        Insert: 1,
        Prepare: 2
    }

    function isFlowMode(flowParam: object, mode: 'View' | 'Insert' | 'Prepare') {
        return flowParam && flowParam['NAVIGATOR_MODE'] == FLOW_MODES[mode]
    }

    const FLOW_FLAGS = {
        Pause: 'P',
        Approve: 'N',
        Reject: 'X',
        End: 'Z',
    }

    function isFlowFlag(row: object, flag: 'Pause' | 'Approve' | 'Reject' | 'End' | '' = '') {
        const flowflag = row['FlowFlag'] || row['FLOWFLAG']
        const v = FLOW_FLAGS[flag] || '\\w+'
        const rule = new RegExp("^" + v + ":(.*)$", 'g').exec(flowflag)
        if (rule) {
            return rule[1]
        } else {
            return ''
        }
    }

    function formatterReciever(value: any, row: object) {
        return {
            type: 'receiver',
            row: row,
            root
        }
    }

    function formatterSenderFrom(value: any, row: object) {
        return `${row['UserName']}(${row['UserID']})`
    }


    function formatterParameter(value: any) {
        const pObj = JSON.parse(value);
        return pObj.FORM_PRESENTATION_CT || pObj.FORM_PRESENTATION
    }

    function formatterAttachment(value: any, row: object) {
        const pObj = JSON.parse(row['Parameter']);
        if (pObj.ATTACHMENTS) {
            return {
                type: 'icon',
                cls: 'fa-paperclip',
                onclick: 'openAttachment',
                row: row,
                root
            }
        }
    }

    const WARNING_TYPE_VALUES = {
        D: 'data',
        P: 'program',
        W: 'flow'
    }

    function formatterWarningType(value: any) {
        return {
            type: 'lText',
            value: WARNING_TYPE_VALUES[value],
            root
        }
    }

    const WARNING_STYLE_VALUES = {
        C: 'fa-question-circle text-info',
        W: 'fa-warning text-warning',
        S: 'fa-info-circle text-danger'
    }

    function formatterWarningStyle(value: any) {
        return {
            type: 'icon',
            cls: WARNING_STYLE_VALUES[value],
            root
        }
    }


    function formatterUserType(value: any, row: object) {
        return {
            type: 'lText',
            value: value,
            root
        }
    }

    function formatterResult(value: any, row: object) {
        return row['Result'] || row['Error']
    }

    async function getFlows() {
        const param = {
            mode: 'getFlows'
        }
        const { data: result } = await axios.post(flowApiUrl, param)
        return result
    }

    async function queryFlow(flowParam: object) {
        const param = {
            mode: 'queryFlow',
            ...flowParam
        }
        const { data: result } = await axios.post(flowApiUrl, param)
        return result
    }

    async function queryData(flowParam: object) {
        const param = {
            mode: 'queryData',
            ...flowParam
        }
        const { data: result } = await axios.post(flowApiUrl, param)
        return result
    }

    async function getDefination(flowParam: object) {
        const param = {
            mode: 'getDefination',
            FlowID: flowParam['FlowID'],
            InstanceID: flowParam['InstanceID']
        }
        const { data: result } = await axios.post(flowApiUrl, param)
        return result
    }

    const CONTROL_TYPES = {
        Segment: 'segment',
        Activity: 'activity',
        Line: 'line'
    }

    const START_ACTIVITY = 'StartActivity'

    async function preview(flowParam: object) {
        const defination = await getDefination(flowParam)
        const previewDatas = await previewFlow(flowParam)
        const controls = defination.controls
        const flowSegments = controls.filter(c => c['type'] == CONTROL_TYPES.Segment)
        const flowLines = controls.filter(c => c['type'] == CONTROL_TYPES.Line)

        const names = ['History', 'Waiting', 'Next', 'Notify']
        names.forEach(n => {
            const datas = previewDatas[n]
            datas.forEach(data => {
                const id = (data.ActivityID || data.ID).split('_')[0]
                const activity = getActivityByID(controls, id, true)
                if (n == 'History') {
                    if (activity.options.type == 'NotifyActivity') {
                        activity.datas = activity.datas || []
                    }
                    else {
                        activity.datas = []
                    }
                    activity.datas.push({ type: n.toLowerCase(), text: `(${data.UserName || data.RoleName })`, title: (data.StartDatetime || '').split('.')[0].replace(/T/g, ' ') + '\r\n' + data.Remark })
                }
                else if (n == 'Notify') {
                    activity.datas = activity.datas || []
                    activity.datas.push({ type: 'next', text: `(${data.UserName || data.RoleName})` })
                } 
                else {
                    activity.datas = activity.datas || []
                    activity.datas.push({ type: n.toLowerCase(), text: `(${ data.UserName || data.RoleName })` })
                } 
            })
        })

        const lineInfos = {}
        flowLines.forEach(line => {
            lineInfos[line.source] = line.target
        })

        const flowActivities = []
        let start = START_ACTIVITY
        while (start) {
            let activity = getActivityByID(controls, start)
            if (!activity && start == START_ACTIVITY) {
                activity = controls.filter(c => c['type'] == CONTROL_TYPES.Activity)[0]
                start = activity.id
            }
            if (activity) {
                flowActivities.push(activity)
                start = lineInfos[start]
            }
            else {
                throw new Error(`Activity:'${start}' not found.`)
            }
        }

        return {
            flowSegments,
            flowActivities,
            flowLines
        }
    }

    function getActivityByID(activities: Array<object>, id: string, recursive = false) {
        for (var i = 0; i < activities.length; i++) {
            const activity = activities[i]
            if (activity["id"] == id) {
                return activity
            }
            else if (recursive && activity["children"]) {
                const act = getActivityByID(activity["children"], id, recursive)
                if (act) {
                    return act
                }
            }
        }
    }

    function reloadFlowGrids(ids: Array<string>) {
        const frames = window.top.frames
        for (var i = 0; i < frames.length; i++) {
            if (frames[i].location.pathname == '/flow') {
                frames[i].window.postMessage({ method: 'reloadFlowGrids', ids })
            }
        }
    }

    function getFlowWhereItems(flowParam: object) {
        if (flowParam) {
            let pObj = {};
            if (flowParam['Parameter']) {
                pObj = JSON.parse(flowParam['Parameter']);
            }
            if (pObj['FORM_PRESENTATION'] && pObj['FORM_KEYS']) {
                const whereItems = pObj['FORM_KEYS'].split(';').map(function (key) {
                    return {
                        field: key,
                        operator: '=',
                        value: pObj[key]
                    };
                });
                return whereItems
            }
        }
    }

    return {
        //flow props
        getColumns,
        getCommands,
        getButtons,
        //call flow api
        pauseFlow,
        submitFlow,
        approveFlow,
        returnFlow,
        retakeFlow,
        rejectFlow,
        notifyFlow,
        plusFlow,
        plusTransferFlow,
        commentFlow,
        deleteFlowNotify,
        readFlowComment,
        confirmFlowWarning,
        //query flow api
        getFlows,
        queryFlow,
        queryData,
        //getDefination,
        //flow methods
        preview,
        getActivityByID,
        reloadFlowGrids,
        getFlowWhereItems,
        isFlowStatus,
        isPlus,
        isFlowMode,
        isFlowFlag,
    }
}