<template>
    <!--flow notify/plus modal-->
    <BModal ref="refModal" :title="title" style="max-width:600px;margin-top:5px">
        <div class="row">
            <div class="col-sm-2">
                <label class="control-label form-field">{{userLabel}}</label>
            </div>
            <div class="col-sm-10 form-editor">
                <div class="users form-control" :class="usersCls" @click.stop="addUser">
                    <a v-for="(user, uIndex) in users" class="user btn btn-sm btn-default" @click.stop="removeUser(uIndex)"><i class="fa fa-user" aria-hidden="true"></i> {{user.text}} <i class="fa  fa-remove"></i></a>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-2">
                <label class="control-label form-field">{{roleLabel}}</label>
            </div>
            <div class="col-sm-10 form-editor">
                <div class="roles form-control" :class="rolesCls" @click.stop="addRole">
                    <a v-for="(role, rIndex) in roles" class="role btn btn-sm btn-default" @click.stop="removeRole(rIndex)"><i class="fa fa-user-group" aria-hidden="true"></i> {{role.text}} <i class="fa  fa-remove"></i></a>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12 form-editor">
                <textarea ref="refTextarea" class="form-control" :placeholder="$.getMessage('inputContent')" rows="2" v-model="remark"></textarea>
            </div>
        </div>
        <div class="d-flex flex-wrap gap-1">
            <span v-for="msg in messages" class="label label-danger">{{msg}}</span>
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
    const { root: $ } = defineProps<{
        root: object
    }>()

    import flowUtils from '@/utils/flowApi'
    const {
        getButtons,
        notifyFlow, plusFlow, plusTransferFlow
    } = flowUtils($);

    const tabItems = [
        { name: 'user', active: true },
        { name: 'group' }
    ]

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
    const processingMsg = computed(() => $.getMessage('processing'))
    const userLabel = computed(() => title.value + $.getMessage('user'))
    const roleLabel = computed(() => title.value + $.getMessage('role'))
    const usersCls = computed(() => users.length > 0 ? '' : 'add')
    const rolesCls = computed(() => roles.length > 0 ? '' : 'add')
    const remarkLabel = computed(() => $.getMessage('remark'))
    const addText = computed(() => $.getMessage('add'))
    const isProcessing = ref(false)
    const isSubmited = ref(false)
    const buttons = computed(() => {
        const btns = [!isSubmited.value && 'ok', 'close'].filter(Boolean)
        return getButtons(btns)
    })
    const flowRow = ref({})
    const flowMethod = ref('notify')
    const remark = ref('')
    const users = reactive([])
    const roles = reactive([])
    const messages = reactive([])

    let resolvePromise
    async function open(row: object, method: 'notify' | 'plus'| 'plusTransfer') {
        flowRow.value = row
        flowMethod.value = method

        users.splice(0, users.length)
        roles.splice(0, roles.length)
        messages.splice(0, messages.length)
        remark.value = ''
        isProcessing.value = false
        isSubmited.value = false

        refModal.value.open()
        return new Promise((resolve) => {
            resolvePromise = resolve
        })
    }

    function buttonClick(item: any) {
        const me = TOOL_METHODS[item.onclick]
        if (me) {
            me.call()
        }
    }

    async function addUser() {
        const us = await $.openFlowModal('userRole', flowRow.value, 'Users')
        us.forEach(u => {
            if (!users.find(user => user.value == u.USERID)) {
                users.push({
                    value: u.USERID,
                    text: u.USERNAME
                })
            }
        })
    }

    async function addRole() {
        const rs = await $.openFlowModal('userRole', flowRow.value, 'Groups')
        rs.forEach(r => {
            roles.push({
                value: r.GROUPID,
                text: r.GROUPNAME
            })
        })
    }

    function removeUser(index: number) {
        users.splice(index, 1)
    }

    function removeRole(index: number) {
        roles.splice(index, 1)
    }

    const TOOL_METHODS = {
        ok: async function () {
            if (users.length == 0 && roles.length == 0) {
                $.alertMessage('pleaseSelect user or role', 'warning')
            }
            else {
                const param = {
                    ...flowRow.value,
                    Remark: remark.value
                }
                param.Roles = roles.map(r => r.value).join(',')
                param.Users = users.map(r => r.value).join(',')

                let result
                try {
                    isProcessing.value = true
                    let result
                    if (flowMethod.value == 'notify') {
                        result = await notifyFlow(param)
                    }
                    else if (flowMethod.value == 'plusTransfer') {
                        result = await plusTransferFlow(param)
                    }
                    else {
                        result = await plusFlow(param)
                    }
                    isSubmited.value = true
                    result.split(/\n/g).filter(Boolean).forEach(t => {
                        messages.push(t)
                    })
                }
                catch (e) {
                    $.showError(e, true)
                }
                finally {
                    isProcessing.value = false
                }
            }
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

    label.form-field,
    textarea {
        font-size: 14px;
    }

    div.row {
        margin-bottom: 5px;
    }

    div.users,
    div.roles {
        min-height: 120px;
        position: relative;
        overflow-y: auto;
        cursor: pointer;
    }

    div.add {
        background: url('../../icons/add.svg') no-repeat center center;
    }


    a.user,
    a.role {
        margin: 2px;
    }
</style>