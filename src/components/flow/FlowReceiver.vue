<template>
    <a style="cursor:pointer" href="javascript:void(0)" @click="click">{{text}}</a>
</template>
<script lang="ts" setup>
    import { computed } from 'vue'
    const { root: $, row = {} } = defineProps<{
        root: object,
        row: object
    }>()

    const text = computed(() => {
        if (row['UserName']) {
            return `${row['UserName']}(${row['UserID']})`
        }
        else if (row['RoleName']) {
            return `${row['RoleName']}(${row['RoleID']})`
        }
    })

    function click() {
        $.openFlowModal('receiver', row)
    }
</script>
