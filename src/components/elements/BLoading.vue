<template>
    <div v-if="isShow" class="datagrid-mask"></div>
    <div v-if="isShow" class="progress" :style="style">
        <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:100%">{{ text }}</div>
    </div>

</template>
<script lang="ts" setup>
    import { ref, computed } from 'vue'
    const { root: $ } = defineProps<{
        root: object
        style?: object
    }>()

    const isShow = ref(false)
    const message = ref('')
    const text = computed(()=> $.getMessage(message.value))

    function show(msg: string) {
        message.value = msg
        isShow.value = true
    }

    function hide() {
        isShow.value = false
    }

    defineExpose({ show, hide })

</script>
<style scoped>
    .progress {
        height: 30px;
        position: absolute;
    }
</style>