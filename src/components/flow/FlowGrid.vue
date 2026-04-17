<template>
    <div v-show="isShow" ref="refContainer" class="table-responsive" :style="style">
        <div v-if="hasToolItem" class="datagrid-toolitem d-flex align-items-center gap-2 mb-2">
            <BButton v-for="item in toolItems" defaultCls="btn-sm datagrid-btn" :item="item" :root="$" @click="invokeCommand"></BButton>
        </div>
        <table class="bootstrap-datagrid table table-bordered table-hover table-striped table-condensed table-xsblock">
            <thead>
                <tr>
                    <th v-if="showCommand" class="datagrid-command nowrap">

                    </th>
                    <th v-if="isShowCheck" class="datagrid-check">
                        <input type="checkbox" v-model="checked" />
                    </th>
                    <th v-for="col in columns" :style="thStyle(col)">
                        {{col.title}}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in rows" v-bind="trAttrs(row, rowIndex)" :class="trCls(rowIndex)">
                    <td v-if="showCommand" class="datagrid-command nowrap">
                        <FlowCommands :flowType="flowType" :queryValues="queryValues" :row="row" @click="invokeCommand" :root="$" />
                    </td>
                    <td v-if="isShowCheck" class="datagrid-check">
                        <input type="checkbox" id="checkbox" v-model="row.__checked" />
                    </td>
                    <td v-for="col in columns" @click.stop="select(rowIndex, row)">
                        <BTableCell :row="row" :rowIndex="rowIndex" :column="col" :root="$"></BTableCell>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="pagination" class="d-flex justify-content-end align-items-center">
            <BPagination :root="$" :visible="isShow" v-model:currentPage="currentPage" :pageSize="pageSize" :rowsCount="rowsCount" />
        </div>
        <BLoading :root="$" ref="refLoading" :style="loadingStyle" />
    </div>
</template>
<script lang="ts" setup>
    import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
    import emitter from '@/utils/emitter'

    const { root: $, id, mode = 'flow', flowType = 'ToDo', columns, toolItems = [], queryParam = {}, loadParam = {},
        pagination = true, pageSize = 10, showCommand = true, showCheckbox = true, showLoading = true,
        visible = true, initLoad = true,
        style, rowStyler
    } = defineProps<{
        root: object,
        id?: string,
        mode?: string,
        flowType: string,
        columns: Array,
        toolItems?: Array,
        queryParam?: object,
        loadParam?: object,
        pagination?: boolean,
        pageSize?: number,
        showCommand?: boolean,
        showCheckbox?: boolean,
        showLoading?: boolean,
        visible?: boolean,
        initLoad?: boolean,
        style?: object,
        rowStyler?: string
    }>()
    import flowUtils from '@/utils/flowApi'
    const { queryFlow, queryData } = flowUtils($);

    const refContainer = ref()
    const refLoading = ref()
    const isShow = ref(visible)
    const isShowCheck = ref(showCheckbox)
    const rows = reactive([])
    const currentPage = ref(1)
    const rowsCount = ref(0)
    const selectedIndex = ref(-1)
    const queryValues = ref(queryParam)
    const loadingMsg = ref('')

    const hasToolItem = computed(() => toolItems.length > 0)

    const thStyle = c => c.style
    const trAttrs = (r, rIndex) => {
        if (rowStyler) {
            const attrs = $.invoke(rowStyler, rIndex, r)
            if (typeof attrs == 'string') {
                return { class: attrs }
            }
            else if (typeof attrs == 'object') {
                const style = object.keys(attrs).map(c => `${c}:${attrs[c]};`).join('')
                return { style }
            }
        }
    }
    const trCls = index => selectedIndex.value === index ? 'info' : ''
    const loadingStyle = computed(() => pagination ? { width: '200px', left: '15px', bottom: '5px' } : { width: '200px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'})

    const checked = ref('false')
    watch(checked, v => {
        for (let i = 0; i < rows.length; i++) {
            rows[i].__checked = v
        }
    })

    onMounted(async () => {
        if (initLoad) {
            load()
        }
    })

    async function load() {
        select(-1)
        try {
            const param = {
                type: flowType,
                queryParam: JSON.stringify(queryValues.value),
                ...loadParam
            }
            if (pagination) {
                //pagination
                param.page = currentPage.value
                param.rows = pageSize
            }
            loading('loading')
            let data
            if (mode == 'data') {
                data = await queryData(param)
            }
            else {
                data = await queryFlow(param)
            }
            loaded()
            loadData(data)
        }
        catch (e) {
            loaded()
            $.showError(e)
        }
    }

    async function loadData(data) {
        rows.splice(0, rows.length)
        checked.value = false
        const rs = data.rows || data
        rs.forEach(r => {
            r.__checked = false
            rows.push(r)
        })
        rowsCount.value = data.total
        if (pagination) {
            emitter.emit('refreshCount', { type: flowType, count: data.total })
        }
        if (style && style['max-height']) { //scroll to bottom
            nextTick(() => {
                const container = refContainer.value
                container.scrollTop = container.scrollHeight
            })
        }
    }

    watch(currentPage, load)

    function toggleVisible() {
        isShow.value = !isShow.value
    }

    function setWhere(values: object) {
        rows.splice(0, rows.length)
        queryValues.value = values
        if (currentPage.value == 1) {
            load()
        }
        else {
            currentPage.value = 1
        }
    }

    function select(index, row) {
        selectedIndex.value = index
        if (row) {
            row.__checked = row.__checked !== true
        }
    }

    function getChecked() {
        const checkedRows = []
        rows.forEach(r => {
            if (r.__checked) {
                const { __checked, __selected, ...cr } = { ...r }
                checkedRows.push(cr)
            }
        })
        return checkedRows
    }

    function loading(msg: string) {
        if (showLoading) {
            refLoading.value.show(msg)
        }
    }

    function loaded() {
        if (showLoading) {
            refLoading.value.hide()
        }
    }

    async function invokeCommand(item: object, row: object) {
        const target = $['$' + id].value
        const { __checked, __selected, ...r } = { ...row }
        if (item.loading) {
            loading('processing')
        }
        try {
            await $.invoke({
                target,
                name: item.onclick
            }, r)
            if (item.loading) {
                loaded()
            }
            if (item.reload) {
                emitter.emit('reloadFlowGrids', item.reload)
            }
        }
        catch (e) {
            if (item.loading) {
                loaded()
            }
            $.showError(e, true)
        }
    }

    const EXPOSE_METHODS = {
        load,
        loading,
        loaded,
        toggleVisible,
        isShowCheck,
        setWhere,
        getChecked,
    }

    defineExpose({
        flowType,
        ...EXPOSE_METHODS
    })

</script>
<style scoped>
    th.datagrid-check,
    td.datagrid-check {
        width: 25px;
        max-width: 25px;
    }

    .table-responsive {
        position: relative;
    }
</style>
