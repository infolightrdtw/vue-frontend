<template>
    <!--flow query modal-->
    <BModal ref="refModal" :title="queryTitle" style="max-width:600px">
        <form class="form-horizontal bootstrap-form" role="form" onsubmit="return false;">
            <div class="row">
                <div class="col-sm-2"><label class="control-label form-field">{{flowLabel}}</label></div>
                <div class="col-sm-10 form-editor"><FlowCombo :root="$" type="flows" textField="value" v-model="queryValues['FlowText']" /></div>
            </div>
            <div class="row">
                <div class="col-sm-2"><label class="control-label form-field">{{activityLabel}}</label></div>
                <div class="col-sm-10 form-editor"><Textbox v-model="queryValues['ActivityText']" /></div>
            </div>
            <div class="row">
                <div class="col-sm-2"><label class="control-label form-field">{{presentLabel}}</label></div>
                <div class="col-sm-10 form-editor"><Textbox v-model="queryValues['Parameter']" /></div>
            </div>
            <div class="row">
                <div class="col-sm-2"><label class="control-label form-field">{{startDateLabel}}</label></div>
                <div class="col-sm-4 form-editor"><Datebox v-model="queryValues['DatetimeFrom']" /></div>
                <div class="col-sm-2"><label class="control-label form-field">{{endDateLabel}}</label></div>
                <div class="col-sm-4 form-editor"><Datebox v-model="queryValues['DatetimeTo']" /></div>
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
    const flowLabel = computed(() => $.getMessage('flow'))
    const activityLabel = computed(() => $.getMessage('workName'))
    const presentLabel = computed(() => $.getMessage('flowCondition'))
    const startDateLabel = computed(() => $.getMessage('start date'))
    const endDateLabel = computed(() => $.getMessage('end date'))
    const buttons = getButtons(['ok', 'cancel'])

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
</style>