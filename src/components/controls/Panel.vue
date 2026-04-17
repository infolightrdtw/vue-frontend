<template>
    <BCard ref="refCard" :title="title" :collapsed="collapsed" v-if="isCard">
        <slot></slot>
    </BCard>
    <div v-if="isDiv">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    let { title = '', collapsed = false, hidden = false, background = '' } = defineProps<{
        root: object,
        title?: string,
        collapsed?: boolean,
        hidden?: boolean,
        background?: string
    }>()

    const isCard = computed(() => !hidden && title != '')
    const isDiv = computed(() => !hidden && title == '')
    const style = computed(() => background ? { background } : {})
    const refCard = ref(null)

    function show() {
        refCard.value.show()
    }

    function hide() {
        refCard.value.hide()
    }

    function toggle() {
        refCard.value.toggle()
    }

    defineExpose({ show, hide, toggle })
</script>

<style scoped>
</style>
