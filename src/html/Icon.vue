<template>
    <button v-if="isBtn" class="btn btn-sm datagrid-btn" @click.prevent="clickIcon">
        <i :class="iconCls"></i>
    </button>
    <i v-else :class="iconCls"></i>
</template>
<script lang="ts" setup>
    import { computed } from 'vue'
    const { root, cls, row = {}, onclick = '' } = defineProps<{
        root: object,
        cls: string,
        row?: object,
        onclick?:string
    }>()
    const $ = root

    const iconCls = computed(() => cls.indexOf('fa') == 0 ? ['fa', cls] : ['glyphicon', cls])
    const isBtn = computed(()=>  onclick != '')

    function clickIcon(){
        $.invoke(onclick, row)
    }

</script>
<style scoped>
    .datagrid-btn{
        padding: 0;
    }
</style>