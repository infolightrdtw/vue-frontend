<template>
    <FlowModal_Q ref="query" :root="$" />
    <FlowModal_QW ref="queryW" :root="$" />
    <FlowModal_SAR ref="approveReturn" :root="$" />
    <FlowModal_NP ref="notifyPlus" :root="$" />
    <FlowModal_A ref="attachement" :root="$" />
    <FlowModal_H ref="hasten" :root="$" />
    <FlowModal_AR_All ref="approveReturnAll" :root="$" />
    <FlowModal_UR ref="userRole" :root="$" />
    <FlowModal_D ref="detail" :root="$" />
    <FlowModal_C ref="comment" :root="$" />
    <FlowModal_R ref="receiver" :root="$" />
    <FlowModal_P ref="preview" :root="$" />
</template>
<script lang="ts" setup>
    import { ref } from 'vue'
    const { root: $ } = defineProps<{
        root: object
    }>()

    const query = ref()
    const queryW = ref()
    const approveReturn = ref()
    const notifyPlus = ref()
    const attachement = ref()
    const hasten = ref()
    const approveReturnAll = ref()
    const userRole = ref()
    const detail = ref()
    const comment = ref()
    const receiver = ref()
    const preview = ref()

    defineExpose({
        query,
        queryW,
        approveReturn,
        notifyPlus,
        attachement,
        hasten,
        approveReturnAll,
        userRole,
        detail,
        comment,
        receiver,
        preview
    })
</script>