<template>
   <a v-if="fileName" href="javascript:void(0)" @click="download"><slot></slot></a>
</template>

<script lang="ts" setup>
    import dataUtils from '@/utils/dataApi'
    const {
        downloadFile
    } = dataUtils()
    let { fileName, folder} = defineProps<{ fileName: String, folder?: String }>()

    async function download() {
        const content = await downloadFile(fileName, folder)

        const binaryString = window.atob(content);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        downloadContent(fileName, bytes, { type: 'application/octet-stream' })
    }

    function downloadContent(fileName, content, blobOptions) {
        blobOptions = blobOptions || {};
        var blob = new Blob([content], blobOptions);
        var a = document.createElement('a');
        a.innerHTML = fileName;
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        const evt = document.createEvent("MouseEvents");
        evt.initEvent("click", false, false);
        a.dispatchEvent(evt);
        document.body.removeChild(a);
    }
</script>