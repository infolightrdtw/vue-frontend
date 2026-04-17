<template>
    <div v-if="isShow">
        <div class="d-flex m-2 gap-2">
            <a v-for="(user, uIndex) in users" class="btn btn-sm btn-default" @click.stop="removeUser(uIndex)"><i class="fa fa-user" aria-hidden="true"></i> {{user.text}} <i class="fa  fa-remove"></i></a>
            <a v-for="(role, rIndex) in roles" class="btn btn-sm btn-default" @click.stop="removeRole(rIndex)"><i class="fa fa-user-group" aria-hidden="true"></i> {{role.text}} <i class="fa  fa-remove"></i></a>
        </div>
        <div class="m-2">
            <textarea ref="refTextarea" class="form-control" :placeholder="promptMsg" rows="3" v-model="remark"></textarea>
        </div>
        <div v-if="attachments.length" class="d-flex m-2 gap-2">
            <a v-for="(attachment, aIndex) in attachments" class="btn btn-sm btn-default" @click.stop="removeAttachment(aIndex)"><i class="fa fa-file" aria-hidden="true"></i> {{attachment}} <i class="fa  fa-remove"></i></a>
        </div>
        <div v-if="isProcessing" class="progress" style="width:100%;height:30px">
            <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:100%">{{processingMsg}}</div>
        </div>
        <div v-else class="datagrid-toolitem d-flex gap-2">
            <div>
                <BButton v-for="tool in toolItems" :item="tool" :root="$" @click="buttonClick"></BButton>
            </div>
            <div class="ms-auto">
                <BButton v-for="btn in buttons" :item="btn" :root="$" @click="buttonClick"></BButton>
            </div>
        </div>

        <input ref="refFile" type="file" multiple="multiple" class="d-none" @change="fileChanged" />

    </div>
</template>
<script lang="ts" setup>
    import { ref, reactive, computed, watch } from 'vue'

    const { root: $ } = defineProps<{
        root: object
    }>()
    const emit = defineEmits<{
        (e: 'send'): void;
        (e: 'add'): void;
    }>();

    import dataUtils from '@/utils/dataApi'
    const { uploadFiles } = dataUtils();
    import flowUtils from '@/utils/flowApi'
    const { commentFlow } = flowUtils($);

    const refTextarea = ref()
    watch(refTextarea, () => {
        if (refTextarea.value) {
            refTextarea.value.focus()
        }
    })
    const refFile = ref()
    const addItem = { text: 'insert', iconCls: 'fa-add' }
    const toolItems = computed(() => [
        !sendFrom.value && { text: 'user', btnCls: 'btn-sm btn-primary', iconCls: 'fa-add', onclick: 'addUser' },
        !sendFrom.value && { text: 'role', btnCls: 'btn-sm btn-primary', iconCls: 'fa-add', onclick: 'addRole' },
        { text: 'attachment', btnCls: 'btn-sm  btn-primary', iconCls: 'fa-add', onclick: "uploadFile" }
    ].filter(Boolean))
    const buttons = computed(() => [
        !sendFrom.value && { text: 'ok', btnCls: 'btn-sm btn-primary', onclick: 'ok' },
        !sendFrom.value && { text: 'cancel', btnCls: 'btn-sm  btn-default', onclick: "cancel" }
    ].filter(Boolean))

    const isShow = ref(false)
    const flowRow = ref({})
    const sendFrom = ref('')
    const promptMsg = ref('')
    const remark = ref('')
    const users = reactive([])
    const roles = reactive([])
    const attachments = reactive([])
    const isProcessing = ref(false)
    const processingMsg = ref('')

    function add(row: object) {
        flowRow.value = row
        promptMsg.value = $.getMessage('inputContent')
        users.splice(0, users.length)
        roles.splice(0, roles.length)
        attachments.splice(0, attachments.length)
        remark.value = ''
        isShow.value = true
    }

    function reply(row: object) {
        flowRow.value = row
        sendFrom.value = row.SenderID
        promptMsg.value = $.getMessage('reply :') + row.SenderName
        users.splice(0, users.length)
        roles.splice(0, roles.length)
        attachments.splice(0, attachments.length)
        remark.value = ''
        isShow.value = true
    }

    function removeUser(index: number) {
        users.splice(index, 1)
    }

    function removeRole(index: number) {
        roles.splice(index, 1)
    }

    function removeAttachment(index: number) {
        attachments.splice(index, 1)
    }

    async function fileChanged(e) {
        const files = e.target.files
        if (files.length) {
            try {
                processingMsg.value = $.getMessage('uploading')
                isProcessing.value = true

                const result = await uploadFiles(files, { folder: `WorkFlow_${flowRow.value.FlowID}`, isAutoNum: true })
                result.forEach(r => {
                    attachments.push(r.name)
                })
                emit('add')
            }
            catch (e) {
                $.showError(e)
            }
            finally {
                isProcessing.value = false
            }
        }
    }

    async function send() {
        try {
            const param = {
                InstanceID: flowRow.value.InstanceID,
                Remark: remark.value
            }
            if (sendFrom.value) {
                //reply
                param.ActivityID = flowRow.value.PActivityID || flowRow.value.ActivityID
                param.ReplyID = flowRow.value.ReplyID
                param.Roles = ''
                param.Users = sendFrom.value
            }
            else {
                param.Roles = roles.map(r => r.value).join(',')
                param.Users = users.map(r => r.value).join(',')
            }
            param.Attachments = attachments.join(',')
            processingMsg.value = $.getMessage('processing')
            isProcessing.value = true
            const result = await commentFlow(param)
            emit('send')
            isShow.value = false
            return true
        }
        catch (e) {
            $.showError(e)
        }
        finally {
            isProcessing.value = false
        }
    }

    function buttonClick(item) {
        const me = TOOL_METHODS[item.onclick]
        if (me) {
            me.call()
        }
    }

    const TOOL_METHODS = {
        ok: async function () {
            return await send()
        },
        addUser: async function () {
            const us = await $.openFlowModal('userRole', flowRow.value, 'Users')
            us.forEach(u => {
                if (!users.find(user => user.value == u.USERID)) {
                    users.push({
                        value: u.USERID,
                        text: u.USERNAME
                    })
                }
            })
            emit('add')
        },
        addRole: async function () {
            const rs = await $.openFlowModal('userRole', flowRow.value, 'Groups')
            rs.forEach(r => {
                roles.push({
                    value: r.GROUPID,
                    text: r.GROUPNAME
                })
            })
            emit('add')
        },
        uploadFile: function () {
            refFile.value.click()
        },
        cancel: function () {
            isShow.value = false
        }
    }

    defineExpose({
        add,
        reply,
        send
    })
</script>