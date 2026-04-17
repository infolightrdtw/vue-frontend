<template>
    <div v-if="isShow" class="modal fade show" role="dialog" data-bs-backdrop="static" aria-modal="true">
        <div class="modal-dialog" role="document" :style="style">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" @click="close">
                        <span aria-hidden="true">×</span>
                    </button>
                    <h5 class="modal-title">{{title}}</h5>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
                <div v-if="showFooter" class="modal-footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </div>
    <div v-if="isShow" class="modal-backdrop fade show"></div>
</template>
<script lang="ts" setup>
    import { ref, computed } from 'vue'

    const { title = '', showFooter = true } = defineProps<{
        title?: string,
        style?: object,
        showFooter?: boolean
    }>()

    const isShow = ref(false)
    //const contentStyle = computed(() => width > 0 ? { width: `${width}px` } : {})
    //const dialogStyle = computed(() => width > 0 ? { 'max-width': `${width}px` } : {})

    //const modalCls = computed(() => ['modal', 'fade', isShow.value ? 'show': ''])

    function open() {
        isShow.value = true
    }

    function close() {
        isShow.value = false
    }

    defineExpose({ open, close })
</script>
<style scoped>
    .modal-header {
        padding: 8px 16px;
    }

    .modal.show {
        display: block
    }
</style>