<template>
    <!--flow hasten modal-->
    <BModal ref="refModal" :title="title" style="max-width:600px">
        <textarea ref="refTextarea" class="form-control" :placeholder="$.getMessage('inputContent')" rows="4" v-model="remark"></textarea>
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
        notifyFlow
    } = flowUtils($);

    const refModal = ref()
    const refTextarea = ref()
    watch(refTextarea, () => {
        refTextarea.value.focus()
    })
    const title = computed(() => $.getMessage('hasten'))
    const processingMsg = computed(() => $.getMessage('processing'))
    const isProcessing = ref(false)
    const isNotified = ref(false)
    const buttons = computed(() => {
        const btns = [!isNotified.value && 'ok', 'close'].filter(Boolean)
        return getButtons(btns)
    })
    const flowRow = ref()
    const remark = ref('')
    const messages = reactive([])

    function open(row: object) {
        flowRow.value = row

        messages.splice(0, messages.length)
        remark.value = ''
        isProcessing.value = false
        isNotified.value = false

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
            const param = {
                ...flowRow.value,
                Remark: remark.value
            }
            if (param.RoleID) {
                param.Roles = param.RoleID
            }
            if (param.UserID) {
                param.Users = param.UserID
            }
            try {
                isProcessing.value = true
                const result = await notifyFlow(param)
                isNotified.value = true
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
        },
        close: function () {
            refModal.value.close()
        }
    }

    defineExpose({
        open
    })

</script>