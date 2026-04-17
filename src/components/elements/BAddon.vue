<template>
    <!--Flow Modal-->
    <FlowModals ref="flowModal" :root="$" />
    <!--Alert-->
    <BAlert ref="alert" :root="$" />
</template>
<script lang="ts" setup>
    import { ref } from 'vue'
    const { root: $ } = defineProps<{
        root: object
    }>()

    const alert = ref()
    const flowModal = ref()

    defineExpose({
        alert,
        flowModal
    })
</script>