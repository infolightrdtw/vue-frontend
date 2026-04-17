<template>
    <li class="list-group-item list-group-item-info">
        <div>
            <div class="d-flex justify-content-end">
                <span>{{datetime}}</span>
            </div>
            <div class="comment-sender">
                {{sender}}
                <span v-if="canReply" style="cursor:pointer" :title="replyTitle" class="fa fa-reply pull-right" @click="openReply"></span>
            </div>
            <div class="comment-remark">{{row.Remark}}</div>
            <div v-if="row.Attachments">
                <FileLink v-for="attachment in attachments" :fileName="attachment" :folder="folder">
                    <button class="btn btn-sm btn-default"><i class="fa fa-file"></i> {{attachment}}</button>
                </FileLink>
            </div>
        </div>
    </li>
</template>
<script lang="ts" setup>
    import { ref, computed } from 'vue'
    const { root: $, row } = defineProps<{
        root: object,
        row: object
    }>()

    const emit = defineEmits<{
        (e: 'reply'): void;
    }>();

    const sender = computed(() => `${row.SenderName} @ ${row.SendToName}`)
    const datetime = computed(() => $.getFormatValue(row.Datetime, row, 'yyyy/MM/dd hh:mm:ss'))
    const attachments = computed(() => row.Attachments.split(',').filter(Boolean))
    const canReply = computed(() => row.CanReply)

    async function openReply() {
        if (await $.openFlowModal('comment', row)) {
            onReply()
        }
    }

    function onReply() {
        emit('reply')
    }

</script>
<style scoped>
    .pull-right {
        float: right;
    }
</style>