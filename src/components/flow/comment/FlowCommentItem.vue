<template>
    <div class="panel panel-default">
        <div class="panel-heading">
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
            <div v-if="row.replies.length" class="d-flex justify-content-end">
                <a class="comment-reply" href="javascript:void(0)" @click="toggleShowReply">{{showReplyText}}</a>
            </div>
        </div>
        <div class="panel-collapse" :class="replyDivCls">
            <div class="panel-body">
                <ul class="list-group">
                    <FlowReplyItem v-for="reply in row.replies" :root="$" :row="reply" @reply="onReply"/>
                </ul>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { ref, computed } from 'vue'
    const { root: $, row, showReply = true } = defineProps<{
        root: object,
        row: object,
        showReply: boolean
    }>()

    const emit = defineEmits<{
        (e: 'reply'): void;
    }>();

    const sender = computed(() => row.SendToName ? `${row.SenderName} @ ${row.SendToName}:` : `${row.SenderName}:`)
    const datetime = computed(() => $.getFormatValue(row.Datetime, row, 'yyyy/MM/dd hh:mm:ss'))
    const attachments = computed(() => row.Attachments.split(',').filter(Boolean))
    const folder = computed(() => `WorkFlow_${row.FlowID}`)
    const showReplyText = computed(() => $.getMessage('view reply') + `(${row.replies.length})`)
    const isShowReply = ref(false)
    const replyDivCls = computed(() => isShowReply.value ? '' : 'collapse')
    const canReply = computed(() => showReply && row.CanReply)
    const replyTitle = computed(() => $.getMessage('reply'))

    function toggleShowReply() {
        isShowReply.value = !isShowReply.value
    }

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
    .panel-heading {
        padding: 5px 10px;
    }

    .panel-body {
        padding: 5px;
    }

    .pull-right {
        float: right;
    }

    .comment-sender {
        font-weight: bolder;
        font-size: 16px
    }

    .comment-remark {
        font-size: 14px;
        padding-left: 10px
    }

    .comment-reply {
        font-weight: bolder;
        font-size: 14px;
    }

    button {
        color: #000 !important;
    }

    ul {
        margin: 0;
    }
</style>