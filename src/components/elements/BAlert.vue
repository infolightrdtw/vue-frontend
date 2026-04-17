<template>
    <div v-if="isShow" class="modal fade show" role="dialog" style="display: block;">
        <div class="modal-dialog">
            <div :class="contentCls" role="alert">
                <h5 id="modal-title" v-html="alertTitle"></h5>
                <p class="text-right">
                    <button type="button" :class="okBtnCls" @click="ok">{{ okText }}</button>
                    <button v-if="cancelVisible" type="button" class="btn btn-cancel btn-default" style="margin-left:5px" @click="cancel">{{ cancelText }}</button>
                </p>
            </div>
        </div>
    </div>
    <div v-if="isShow" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    let { root } = defineProps<{
        root: object
    }>()

    const $ = root

    const alertType = ref('warning')
    const alertTitle = ref('')
    const isShow = ref(false)
    const cancelVisible = ref(false)

    const contentCls = computed(() => ['modal-content', 'alert', `alert-${alertType.value}`])
    const okBtnCls = computed(() => ['btn', 'btn-ok', alertTitle.value, `btn-${alertType.value}`])

    const okText = computed(() => $.localeMessages.value['ok'])
    const cancelText = computed(() => $.localeMessages.value['cancel'])

    let resolvePromise

    async function alert(title: string, type: string) {
        alertTitle.value = title
        alertType.value = type || 'info'
        cancelVisible.value = false
        isShow.value = true
        return new Promise((resolve) => {
            resolvePromise = resolve
        })
    }

    async function confirm(title: string, type: type) {
        alertTitle.value = title
        alertType.value = type || 'warning'
        cancelVisible.value = true
        isShow.value = true
        return new Promise((resolve) => {
            resolvePromise = resolve
        })
    }

    function ok() {
        isShow.value = false
        if (resolvePromise) {
            resolvePromise(true)
        }
    }

    function cancel() {
        isShow.value = false
        if (resolvePromise) {
            resolvePromise(false)
        }
    }

    defineExpose({
        isShow,
        alert,
        confirm
    })
</script>

<style scoped>
    #modal-title {
        word-wrap: break-word
    }
</style>
