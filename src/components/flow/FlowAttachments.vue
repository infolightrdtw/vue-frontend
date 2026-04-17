<template>
    <div class="table-responsive">
        <div v-if="!readonly" class="datagrid-toolitem d-flex align-items-center gap-2 mb-2">
            <div v-if="isUploading" class="progress" style="width:100%;height:30px">
                <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:100%">{{uploadingMsg}}</div>
            </div>
            <BButton v-if="!isUploading" defaultCls="btn-sm btn-primary" :item="btnUpload" :root="$" @click="upload"></BButton>
        </div>
        <table class="bootstrap-datagrid table table-bordered table-hover table-striped table-condensed table-xsblock">
            <tbody>
                <tr v-for="(row, rowIndex) in rows">
                    <td v-for="col in columns">
                        <BTableCell :row="row" :rowIndex="rowIndex" :column="col" :root="$"></BTableCell>
                    </td>
                    <td v-if="!readonly" class="datagrid-command nowrap">
                        <BButton :showText="false" defaultCls="btn-sm btn-link datagrid-btn" :item="btnRemove" :root="$" @click="remove(rowIndex)"></BButton>
                    </td>
                </tr>
            </tbody>
        </table>
        <input ref="refFile" type="file" multiple="multiple" class="d-none" @change="fileChanged" />
    </div>
</template>
<script lang="ts" setup>
    import { ref, reactive, watch, computed, onMounted } from 'vue'
    import dataUtils from '@/utils/dataApi'
    const { uploadFiles } = dataUtils();
    const {
        root: $,
        modelValue = '',
        flowRow = {},
        readonly = false
    } = defineProps<{
        root: object,
        modelValue?: string,
        flowRow?: object
        readonly?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', v: string): void
    }>()

    const refFile = ref()
    const rows = reactive([])
    const columns = [{ field: 'value', title: '', formatter: formatterAttachment }]
    const btnUpload = { text: 'upload attachment' }
    const btnRemove = { text: 'remove', iconCls: 'fa-remove' }
    const isUploading = ref(false)
    const uploadingMsg = computed(() => $.getMessage('uploading'))

    onMounted(() => {
        const files = modelValue.split(';').filter(Boolean)
        files.forEach(f => rows.push({ value: f }))
    })

    watch(rows, () => {
        const v = rows.map(r => r.value).join(';')
        emit('update:modelValue', v)
    })

    function formatterAttachment(value) {
        return {
            type: 'link',
            fileName: value,
            text: value,
            folder: `WorkFlow_${flowRow.FlowID}`
        }
    }

    function upload() {
        refFile.value.click()
    }

    async function fileChanged(e) {
        const files = e.target.files
        if (files.length) {
            try {
                isUploading.value = true
                const result = await uploadFiles(files, { folder: `WorkFlow_${flowRow.FlowID}`, isAutoNum: true })
                result.forEach(r => {
                    rows.push({ value: r.name })
                })
            }
            catch (e) {
                $.showError(e)
            }
            finally {
                isUploading.value = false
            }
        }
    }

    function remove(index: number) {
        rows.splice(index, 1)
    }

</script>
<style scoped>
</style>