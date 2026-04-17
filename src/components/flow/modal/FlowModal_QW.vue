<template>
    <!--flow query modal-->
    <BModal ref="refModal" :title="queryTitle" style="max-width:600px">
        <form class="form-horizontal bootstrap-form" role="form" onsubmit="return false;">
            <div class="row">
                <div class="col-sm-2"><label class="control-label form-field">{{subjectLabel}}</label></div>
                <div class="col-sm-10 form-editor"><Textbox v-model="queryValues['WarningText']" /></div>
            </div>
            <div class="row">
                <div class="col-sm-2"><label class="control-label form-field">{{levelLabel}}</label></div>
                <div class="col-sm-4 form-editor"><FlowCombo :root="$" :items="levelItems" v-model="queryValues['Level']" /></div>
                <div class="col-sm-2"><label class="control-label form-field">{{typeLabel}}</label></div>
                <div class="col-sm-4 form-editor"><FlowCombo :root="$" :items="typeItems" v-model="queryValues['Type']" /></div>
            </div>
            <div class="row">
                <div class="col-sm-2"><label class="control-label form-field">{{startDateLabel}}</label></div>
                <div class="col-sm-4 form-editor"><Datebox v-model="queryValues['DatetimeFrom']" /></div>
                <div class="col-sm-2"><label class="control-label form-field">{{endDateLabel}}</label></div>
                <div class="col-sm-4 form-editor"><Datebox v-model="queryValues['DatetimeTo']" /></div>
            </div>
            <div class="row">
                <div class="col-sm-2"><label class="control-label form-field">{{finishedLabel}}</label></div>
                <div class="col-sm-4 form-editor"><input id="checkFinished" type="checkbox" v-model="queryValues['IsFinish']" /></div>
            </div>
        </form>
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
    const { getButtons } = flowUtils();

    const refModal = ref()
    const queryValues = ref({})
    const queryTitle = computed(() => $.getMessage('query'))
    const subjectLabel = computed(() => $.getMessage('subject / description'))
    const levelLabel = computed(() => $.getMessage('level'))
    const typeLabel = computed(() => $.getMessage('type'))
    const startDateLabel = computed(() => $.getMessage('start date'))
    const endDateLabel = computed(() => $.getMessage('end date'))
    const finishedLabel = computed(() => $.getMessage('finished2'))
    const buttons = getButtons(['ok', 'cancel'])
    const levelItems = computed(() => [
        { value: 'C', text: $.getMessage('concern') },
        { value: 'W', text: $.getMessage('warning') },
        { value: 'S', text: $.getMessage('serious') }
    ])
    const typeItems = computed(() => [
        { value: 'D', text: $.getMessage('data') },
        { value: 'W', text: $.getMessage('flow') },
        { value: 'P', text: $.getMessage('program') }
    ])

    let resolvePromise
    function open() {
        queryValues.value = {}
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
        ok: function () {
            refModal.value.close()
            if (resolvePromise) {
                resolvePromise(queryValues.value)
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
<style scoped>
    #checkFinished {
        width: 16px;
        height: 16px;
        margin-top: 10px;
    }
</style>