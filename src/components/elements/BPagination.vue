<template>
    <ul v-show="visible" class="pagination pagination-sm">
        <li class="page-item" :class="prevItemCls"><a class="page-link" href="javascript:void(0)" @click.prevent="firstPage">«</a></li>
        <li class="page-item" :class="prevItemCls"><a class="page-link" href="javascript:void(0)" @click.prevent="previousPage">‹</a></li>
        <li v-for="p in visiblePages" :key="p" class="page-item" :class="{ active: p === currentPage }">
            <a class="page-link" href="javascript:void(0)" @click.prevent="changePage(p)">{{ p }}</a>
        </li>
        <li class="page-item" :class="nextItemCls"><a class="page-link" href="javascript:void(0)" @click.prevent="nextPage">›</a></li>
        <li class="page-item" :class="nextItemCls"><a class="page-link" href="javascript:void(0)" @click.prevent="lastPage">»</a></li>
        <li class="page-item disabled"><a class="page-link" href="javascript:void(0)">{{ pageText }}</a></li>
    </ul>
</template>
<script lang="ts" setup>
    import { computed } from 'vue'
    const { root, currentPage, pageSize, rowsCount, visible = true } = defineProps<{
        root: object,
        currentPage: number,
        pageSize: number,
        rowsCount: number,
        visible?: boolean
    }>()
    const $ = root
    const emit = defineEmits<{
        (e: 'update:currentPage', v: string): void
    }>()
    const pageCount = computed(() => Math.ceil(rowsCount / pageSize))

    const visiblePages = computed(() => {
        const pages = []
        const range = 2
        for (let i = Math.max(1, currentPage - range); i <= Math.min(pageCount.value, currentPage + range); i++) {
            pages.push(i)
        }
        return pages
    })

    const prevItemCls = computed(()=> currentPage == 1 ? 'disabled': '')
    const nextItemCls = computed(()=> currentPage >= pageCount.value? 'disabled': '')

    const pageText = computed(()=> $.getMessage('pageItemsCount', rowsCount, pageCount.value))

    function firstPage(){
       changePage(1)
    }

    function previousPage(){
        changePage(currentPage - 1)
    }

    function nextPage(){
        changePage(currentPage + 1)
    }

    function lastPage(){
      changePage(pageCount.value)
    }

    function changePage(newPage:number){
        emit('update:currentPage', newPage)
    }

</script>
<style scoped>
    .pagination{
        margin-bottom:5px;
    }
</style>