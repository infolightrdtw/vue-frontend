<template>
    <div class="table-responsive position-relative">
        <p v-if="title" class="datagrid-title" style="margin:0">{{ title }}</p>
        <div class="datagrid-toolitem d-flex align-items-center gap-2 mb-2">
            <div v-if="hasTopTools" class="d-flex align-items-center gap-2">
                <BButton v-for="item in visibleToolItems" :item="item" defaultCls="btn-sm datagrid-btn" :root="$" @click="toolItemClick"></BButton>
            </div>
        </div>

        <div class="modal fade" id="queryModal" tabindex="-1" ref="modalRef" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable custom-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{queryTitle}}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="query-form-wrap">
                            <BHtmlForm :row="queryValues" :columns="queryColumns" :horizontalColumnsCount="queryColumnsCount"></BHtmlForm>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" data-bs-dismiss="modal" @click="load">{{ queryText }}</button>
                        <button class="btn btn-secondary" data-bs-dismiss="modal">{{ cancelText }}</button>
                    </div>
                </div>
            </div>
        </div>

        <table :id="id" :class="tableClasses" :style="tableStyle">
            <thead>
                <tr>
                    <th v-if="showCommandColumn" style="width: 80px"></th>
                    <th v-for="col in visibleColumns" :key="col.field" :style="{ width: col.cWidth ? col.cWidth + 'px' : undefined }">
                        {{ col.title }}
                        <span v-if="col.sortable" class="fa fa-sort pull-right sort-btn" :class="sortCls(col)" @click="setOrder(col.field)" />
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr v-if="!hasRow">
                    <td :colspan="columnSpan" class="text-center text-muted"></td>
                </tr>

                <tr v-for="(row, index) in rows" :class="trCls(index)">
                    <td v-if="showCommandColumn" class="datagrid-command">
                        <div class="d-flex gap-2 align-items-center" v-if="!isEditing(index)">
                            <i v-if="canView" class="bi bi-search text-info" :title="$.localeMessages?.value?.view || 'View'" @click.stop="view_row(index)"></i>
                            <i v-if="canEdit" class="bi bi-pencil-square text-warning" :title="$.localeMessages?.value?.edit || 'Edit'" @click.stop="edit_row(index)"></i>
                            <i v-if="canDelete" class="bi bi-trash text-danger" :title="$.localeMessages?.value?.remove || 'Delete'" @click.stop="delete_row(index)"></i>
                        </div>
                        <div class="d-flex gap-2 align-items-center" v-else>
                            <i class="bi bi-check2 text-success" :title="$.localeMessages?.value?.save || 'Save'" @click.stop="endEdit"></i>
                            <i class="bi bi-x text-secondary" :title="$.localeMessages?.value?.cancel || 'Cancel'" @click.stop="cancelEdit"></i>
                        </div>
                    </td>

                    <td v-for="col in visibleColumns" :key="col.field" :class="tdCls(col)" :data-field="col.field" :style="{ width: col.cWidth ? col.cWidth + 'px' : undefined }" @click.stop="clickCell(index,col)">
                        <template v-if="isEditing(index)">
                            <template v-if="isInlineReadonly(editRow, col)">
                                <BTableCell :row="editRow" :rowIndex="index" :column="col" :root="$"></BTableCell>
                            </template>
                            <template v-else>
                                <BEditor :type="editorType(col)" :options="editorOptions(col)" :row="editRow" :column="col" :root="$"></BEditor>
                            </template>
                        </template>
                        <template v-else>
                            <BTableCell :row="row" :rowIndex="index" :column="col" :root="$"></BTableCell>
                        </template>
                    </td>
                </tr>
            </tbody>
            <tfoot v-if="footRow">
                <tr>
                    <td v-if="showCommandColumn" class="text-end fw-bold">
                    </td>

                    <td v-for="col in visibleColumns" :key="col.field">
                        <span v-if="footRow[col.field] !== undefined && footRow[col.field] !== null">
                            <BTableCell :row="footRow" :column="col" :root="$"></BTableCell>
                        </span>
                    </td>
                </tr>
            </tfoot>
        </table>

        <div v-if="pagination" class="dg-pager d-flex justify-content-end align-items-center gap-2">
            <ul class="pagination pagination-sm mb-0">
                <li class="page-item">
                    <a class="page-link" href="#" :title="$.localeMessages?.value?.refresh || 'Refresh'" @click.prevent="load">
                        <i class="bi bi-arrow-clockwise"></i>
                    </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }"><a class="page-link" href="#" @click.prevent="changePage(1)">«</a></li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }"><a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">‹</a></li>
                <li v-for="p in visiblePages" :key="p" class="page-item" :class="{ active: p === currentPage }">
                    <a class="page-link" href="#" @click.prevent="changePage(p)">{{ p }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }"><a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">›</a></li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }"><a class="page-link" href="#" @click.prevent="changePage(totalPages)">»</a></li>
            </ul>
            <small class="ms-2 text-muted">
                {{ 
                    ($.localeMessages?.value?.pageItemsCount || '{1} pages, {0} items')
                        .replace('{0}', rowsCount)
                        .replace('{1}', totalPages) 
                }}
            </small>
        </div>

        <div v-if="isLoading" 
             class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
             style="background-color: rgba(255, 255, 255, 0.6); z-index: 1050; backdrop-filter: blur(1px);">
            <div class="spinner-border text-primary mb-2" role="status"></div>
            <div class="fw-bold text-primary">{{ loadingMessage }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick, toRaw, getCurrentInstance } from 'vue'
    import { v4 as uuidv4 } from 'uuid';
    import { Modal } from 'bootstrap'
    import dataUtils from '@/utils/dataApi'
    import defaultThemeUrl from '@/assets/stylesheets/themes/vue_default.css?url'
    import blackThemeUrl from '@/assets/stylesheets/themes/vue_black.css?url'
    import violetThemeUrl from '@/assets/stylesheets/themes/vue_violet.css?url'
    import flowUtils from '@/utils/flowApi'

    const themeMap: Record<string, string> = {
        'default': defaultThemeUrl,
        'black': blackThemeUrl,
        'violet': violetThemeUrl
    };

    function applyIframeTheme(themeName: string) {
        const linkId = 'iframe-theme-style';
        let link = document.getElementById(linkId) as HTMLLinkElement;
        
        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        const targetUrl = themeMap[themeName] || themeMap['default'];
        if (targetUrl) {
            link.href = targetUrl;
        }
    }

    function handleMessage(event: MessageEvent) {
        const data = event.data;
        if (data && data.type === 'THEME_CHANGE') {
            applyIframeTheme(data.theme);
        }
    }

    onMounted(() => {
        const savedTheme = localStorage.getItem('user-theme') || 'default';
        applyIframeTheme(savedTheme);

        window.addEventListener('message', handleMessage);
    });

    onUnmounted(() => {
        window.removeEventListener('message', handleMessage);
    });


    // ---------- Props & Emits ----------
    const props = defineProps({
        id: String,
        root: Object,
        remoteName: String,
        title: String,
        columns: Array,
        rows: Array,
        toolItems: Array,
        queryColumns: {
            type: Array,
            default: []
        },
        queryColumnsCount: {
            type: Number,
            default: 2
        },
        queryTitle: {
            type: String,
            default: '',
        },
        toolItemPosition: {
            type: String,
            default: 'Top',
        },
        options: Object,
        viewCommandVisible: {
            type: Boolean,
            default: false,
        },
        editCommandVisible: {
            type: Boolean,
            default: false,
        },
        deleteCommandVisible: {
            type: Boolean,
            default: false,
        },
        editForm: { type: String, default: '' },
        editOnEnter: { type: Boolean, default: false },
        parentObject: { type: String, default: '' },

        reportName: String,
        reportType: [String, Number],

        whereStr: String,
        alwaysClose: { type: Boolean, default: false },

        autoApply: { type: Boolean, default: true },
        validateXss: { type: Boolean, default: true },
        confirmDelete: { type: Boolean, default: true },
        duplicateCheck: { type: Boolean, default: true },
        fixColumnHeader: { type: Boolean, default: false },
        audDetect: { type: Boolean, default: false },
        columnHidable: { type: Boolean, default: false },


        targetObject: { type: String, default: '' },
        whereItems: Array,
        totalMode: [String, Number],
        showColumnTitle: { type: Boolean, default: true },
        autoQueryColumn: { type: Boolean, default: false },

        queryMode: [String, Number],
        queryTitle: String,
        queryColumnsCount: { type: Number, default: 2 },

        showCheckbox: { type: Boolean, default: false },
        checkOnSelect: { type: Boolean, default: false },
        recordLock: { type: Boolean, default: false },

        pagination: { type: Boolean, default: true },
        pageCount: { type: Boolean, default: true },
        pageJump: { type: Boolean, default: false },
        rownumbers: { type: Boolean, default: false },
        pageSize: { type: Number, default: 10 },
        pageList: Array,

        height: [Number, String],

        bordered: { type: Boolean, default: true },
        hover: { type: Boolean, default: true },
        striped: { type: Boolean, default: false },
        condensed: { type: Boolean, default: false },
        xsblock: { type: Boolean, default: true },
        simple: { type: Boolean, default: false },
        chatDetect: { type: Boolean, default: true },
        rowStyler: String,

        onBeforeLoad: String,
        onLoad: String,
        onInsert: String,
        onUpdate: String,
        onDelete: String
    })
    const $ = props.root
    
    const {
        isFlowMode, isFlowFlag, getFlowWhereItems,
        queryFlow
    } = flowUtils($)

    //ref props
    const viewCommandVisible = ref(props.viewCommandVisible)
    const editCommandVisible = ref(props.editCommandVisible)
    const deleteCommandVisible = ref(props.deleteCommandVisible)
    const canView = computed(() => viewCommandVisible.value)
    const canEdit = computed(() => {
        if (isFlow.value && isFlowMode(flowParam, 'View')) {
            return false
        }
        else {
            return editCommandVisible.value
        }
    })
    const canDelete  = computed(() => {
        if (isFlow.value && isFlowMode(flowParam, 'View')) {
            return false
        }
        else {
            return deleteCommandVisible.value
        }
    })

    const isLoading = ref(false)
    const loadingMessage = ref('')

    function showLoading(msg) {
        isLoading.value = true
        loadingMessage.value = msg || $.localeMessages?.value?.processing || '處理中...'
    }

    function hideLoading() {
        isLoading.value = false
        loadingMessage.value = ''
    }

    const columns = reactive(props.columns || [])

    const rows = reactive([])
    const hasRow = computed(() => rows.length > 0)
    let keys = []
    const flowParam = $.getEncryptParameters()
    const sort = ref('')
    const order = ref('asc')
    const queryValues = ref({})
    const currentPage = ref(1)
    const pageSize = ref(props.pageSize)
    const rowsCount = ref(0)

    const selectedIndex = ref(-1)
    const totalRow = ref(null)
    const editIndex = ref(-1)
    const editRow = ref({})
    const invalidColumn = ref('')

    const isReadonly = ref(false)

    const visibleColumns = computed(() => {
        return columns.filter(c => c && c.hidden === false)
    })
    const columnSpan = computed(() => visibleColumns.value.length + (showCommandColumn.value ? 1 : 0))

    const pagination = computed(() => props.pagination !== false)
    const totalPages = computed(() => Math.max(0, Math.ceil(rowsCount.value / pageSize.value)))
    const visiblePages = computed(() => {
        const pages = []
        const range = 2
        for (let i = Math.max(1, currentPage.value - range); i <= Math.min(totalPages.value, currentPage.value + range); i++) {
            pages.push(i)
        }
        return pages
    })

    let lastRow = {}

    const footRow = computed(() => {
        if (props.totalMode == 'All') {
            return totalRow.value
        }
        else {
            const totals = {}
            const footer = {}

            props.columns.forEach(col => {
                if (!col) return
                const field = col.field
                const total = col.total
                if (!field || !total || total === 'none') return

                totals[field] = total
                if (total === 'max' || total === 'min') {
                    footer[field] = null
                } else {
                    footer[field] = 0
                }
            })

            const fields = Object.keys(totals)
            if (!fields.length) return null

            const rowCount = rows.length

            rows.forEach(row => {
                fields.forEach(f => {
                    const mode = totals[f]
                    if (mode === 'count') return

                    const raw = row && row[f]
                    if (raw === '' || raw === null || raw === undefined) return

                    const num = Number(raw)
                    if (mode === 'sum' || mode === 'avg') {
                        footer[f] += isNaN(num) ? 0 : num
                    } else if (mode === 'max') {
                        if (isNaN(num)) return
                        footer[f] = footer[f] == null ? num : Math.max(footer[f], num)
                    } else if (mode === 'min') {
                        if (isNaN(num)) return
                        footer[f] = footer[f] == null ? num : Math.min(footer[f], num)
                    }
                })
            })

            fields.forEach(f => {
                const mode = totals[f]
                if (mode === 'count') {
                    footer[f] = rowCount
                } else if (mode === 'avg') {
                    footer[f] = rowCount ? footer[f] / rowCount : 0
                }
            })

            return footer
        }

    })

    const trCls = index => selectedIndex.value === index ? 'info' : ''
    const tdCls = c => {
        let cls = invalidColumn.value === c.field ? 'error' : '';
        if (c.format === 'drilldown') {
            cls += ' text-primary text-decoration-underline drilldown-cell';
        }
        return cls;
    }
    const isEditing = index => editIndex.value === index
    const isNew = r => r.__isNew === true
    const isInlineReadonly = (r, c) => {
        if (isNew(r)) {
            return false
        }
        else {
            return keys.indexOf(c.field) >= 0
        }
    }

    const sortCls = c => c.field == sort.value ? order.value : ''
    const editorType = c => c.editor ? (c.editor.type || 'textbox') : 'textbox'

    function resolveWhereItemsExpressions(whereItems) {
        if (!Array.isArray(whereItems) || whereItems.length === 0) return whereItems
        const dParams = {
            parent: getParentValues() || {},
            row: toRaw(editRow.value) || {},
            autoseq: toRaw(rows) || []
        }
        return whereItems.map(wi => {
            if (!wi || typeof wi.value !== 'string') return wi
            if (!/^[a-zA-Z_]+\[/.test(wi.value)) return wi
            const resolved = $.getDefaultValue ? $.getDefaultValue(wi.value, dParams) : undefined
            return { ...wi, value: resolved !== undefined ? resolved : wi.value }
        })
    }

    const editorOptions = c => {
        const ed = c.editor || {}
        const opts = ed.options || {}
        const base = { ...opts }
        const type = ed.type || 'textbox'

        if (type === 'refval') {
            base.whereItems = resolveWhereItemsExpressions(base.whereItems)

            const prevOnApply = base.onApply
            base.onApply = (mapped, row) => {
                applyMappedToGrid(mapped)
                if (typeof prevOnApply === 'function') {
                    prevOnApply(mapped, row)
                }
            }
        }

        return base
    }

    const visibleToolItems = computed(() => {
        const toolItems = props.toolItems?.filter(t => !t.hidden) || []
        if (isReadonly.value) {
            return toolItems.filter(t => Object.keys(TOOL_METHODS).indexOf(t.onclick) < 0)
        }
        else {
            return toolItems
        }
    })

    const queryText = computed(() => $.localeMessages.value['query'])
    const cancelText = computed(() => $.localeMessages.value['cancel'])


    const hasTopTools = computed(() => props.toolItemPosition == 'Top' && (visibleToolItems.value?.length > 0))
    const tableClasses = computed(() => ([
        'table',
        'bootstrap-datagrid',
        (props.bordered !== false) && 'table-bordered',
        props.hover && 'table-hover',
        props.striped && 'table-striped',
        props.condensed && 'table-condensed',
        props.xsblock !== false && 'table-xsblock',
        props.simple && 'table-simple',
    ].filter(Boolean)))
    const tableStyle = computed(() => 'width: 100%;') //table-layout: fixed;
    const showCommandColumn = computed(() => !isReadonly.value && !!(props.viewCommandVisible || props.editCommandVisible || props.deleteCommandVisible))

    onMounted(async () => {
        const instance = getCurrentInstance()
        load(true)
    })

    const isFlow = computed(() => {
        if (props.editForm) {
            const form = $['$' + props.editForm]
            if (form) {
                return form.value.isShowFlowIcon
            }
        }
        return false
    })

    async function load(init) {
        showLoading(); // <--- 1. 開始時顯示 Loading

        try {

            select(-1)
            resetEdit()
            rows.splice(0, rows.length)
            acceptChanges()
            const loadParam = {}
            if (props.pagination) {
                //pagination
                loadParam.page = currentPage.value
                loadParam.rows = pageSize.value
            }
            //query and sort
            if (sort.value) {
                loadParam.sort = sort.value
                loadParam.order = order.value
            }
            //total
            if (props.totalMode == 'All') {
                const totals = {};
                const cols = props.columns || []

                cols.forEach(c => {
                    if (c.total && c.total != 'none') {
                        totals[c.field] = c.total
                    }
                })
                loadParam.totalColumns = totals;
            }
            if (props.parentObject) {
                const { loadDetailData } = dataUtils(props.remoteName);
                var form = $['$' + props.parentObject]
                const {
                    parentRow,
                    parentTable,
                    parentReadOnly,
                    parentStatus,
                } = form.value.getParentObj()

                //register detail grid
                form.value.detailGrids[props.id] = $['$' + props.id]

                isReadonly.value = parentReadOnly
                if (props.onBeforeLoad && $.invoke(props.onBeforeLoad, loadParam) === false) {
                    return
                }
                if (parentStatus === 'inserted') {
                    rowsCount.value = 0
                    return
                }
                const data = await loadDetailData(parentTable, parentRow, loadParam)
                loadData(data)
            }
            else {
                const { loadData: loadRemoteData } = dataUtils(props.remoteName);

                const flowWhereItems = getFlowWhereItems(flowParam)
                if (isFlow.value & flowWhereItems) {
                    //flow
                    loadParam.whereItems = flowWhereItems
                }
                else {
                    //query
                    const whereItems = []
                    const qCols = props.queryColumns || []
                    qCols.forEach(qc => {
                        let value = queryValues.value[qc.field]
                        if (value !== undefined & value !== '') {
                            whereItems.push({
                                field: qc.field,
                                operator: qc.operator,
                                value
                            })
                        }
                    })
                    loadParam.whereItems = whereItems
                }
                if (props.onBeforeLoad && $.invoke(props.onBeforeLoad, loadParam) === false) {
                    return
                }
                const data = await loadRemoteData(loadParam)
                await loadData(data)
                if (init && isFlow.value && flowParam && (flowParam.InstanceID || isFlowMode(flowParam, 'Insert'))) {
                    openFlowForm(flowParam)
                }
            }
        } catch (e) {
            $.showError(e); 
        } finally {
            hideLoading(); // 關閉 Loading
        }
    }

    function openFlowForm(flowParam) {
        let status = 'view'
        let row = rows[0]
        if (flowParam.openStatus == 'ToDo' && flowParam.CanEdit == true && !flowParam.PlusCount) {
            status = 'updated'
        }
        else if (isFlowMode(flowParam, 'Insert')) {
            flowParam.openStatus = 'Submit'
            status = 'inserted'
            row = {}
        }
        if (row) {
            openForm(row, status, flowParam)
        }
        else {
            const pObj = JSON.parse(flowParam.Parameter)
            const msg = $.getMessage('dataNotFound', pObj.FORM_PRESENTATION)
            $.showError(msg)
        }
    }

    async function loadRelations(data) {
        const cols = props.columns || []
        for (var i = 0; i < cols.length; i++) {
            const col = cols[i]
            if (col.relation?.options.remoteName) {
                const seperator = col.relation?.options?.seperator || ','
                const values = []
                data.rows.forEach(r => {
                    const value = r[col.relation.options.valueField]?.toString()
                    if (value) {
                        value.split(seperator).filter(Boolean).forEach(v => {
                            values.push(v)
                        })
                    }
                })
                await $.loadRelationValues(col.relation?.options, values.join(','))
            }
        }
    }

    async function loadData(data) {
        await loadRelations(data)
        keys = data.keys.split(',')
        acceptChanges()
        rows.splice(0, rows.length)

        data.rows.forEach(r => {
            rows.push(r)
        })
        rowsCount.value = data.total
        if (data.footer) {
            totalRow.value = data.footer[0]
        }
        if (props.onLoad) {
            $.invoke(props.onLoad, data)
        }
    }

    watch(sort, load)
    watch(order, load)
    watch(currentPage, load)

    function applyMappedToGrid(mapped) {
        const buf = editRow.value
        if (!buf || !mapped) return

        Object.keys(mapped).forEach(field => {
            buf[field] = mapped[field]
        })
    }

    function changePage(page) {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
        }
    }

    function openForm(row, status, flowRow) {
        const form = $['$' + props.editForm]
        if (form) {
            //register view grid
            form.value.viewGrids[props.id] = $['$' + props.id]
            form.value.open({ row, keys, status, flowRow })
        }
    }

    async function checkFlowFlag(row) {
        if (isFlowFlag(row, 'Approve')) {
            $.showError('canNotEditForApproved', true)
            return false
        }
        else if (isFlowFlag(row, 'Reject')) {
            $.showError('canNotEditForRejected', true)
            return false
        }
        else {
            return true
        }
    }

    async function getPauseRow(intanceID) {
        const queryResult = await queryFlow({ type: 'CurrentToDo', InstanceID: intanceID })
        if (queryResult.rows.length) {
            const qRow = queryResult.rows[0]
            if (qRow.SenderID != $.clientInfo.value.user) {
                $.showError('noAccessApprove', true)
                return false
            }
            else {
                return qRow
            }
        }
        else {
            const msg = $.getMessage('flow notExist')
            $.showError(msg)
            return false
        }
    }

    function view_row(index) {
        select(index)
        if (props.editForm) {
            const row = { ...rows[index] }
            const flowRow = onFlowView(row)
            openForm(row, 'view', flowRow)
        }
    }

    function onFlowView(row) {
        if (isFlow.value || (isFlowMode(flowParam, 'Prepare') || isFlowMode(flowParam, 'View'))) {
            const InstanceID = isFlowFlag(row)
            if (InstanceID) {
                return {
                    openStatus: 'View',
                    InstanceID
                }
            }
        }
    }

    async function edit_row(index, focusCol) {
        const row = { ...rows[index] }
        if (props.onUpdate && $.invoke(props.onUpdate, row, index) === false) {
            return
        }

        if (props.editForm) {
            select(index)
            const flowRow = await onFlowEdit(row)
            if (flowRow !== false) {
                openForm(row, 'updated', flowRow)
            }
        }
        else {
            if (index != editIndex.value) {
                if (await endEdit()) {
                    beginEdit(index, false, focusCol)
                }
            }
        }
    }

    async function onFlowEdit(row) {
        if (isFlow.value && isFlowMode(flowParam, 'Prepare')) {
            if (!await checkFlowFlag(row)) {
                return false
            }
            else {
                const pInstanceID = isFlowFlag(row, 'Pause')
                if (pInstanceID) {
                    const qRow = await getPauseRow(pInstanceID)
                    if (qRow) {
                        return {
                            openStatus: 'ToDo',
                            ...qRow
                        }
                    }
                    else {
                        return false
                    }
                }
                else {
                    const eInstanceID = isFlowFlag(row, 'End')
                    if (eInstanceID) {
                        return {
                            ...flowParam,
                            TextSuffix: $.getMessage('modify'),
                            EndStatus: '',
                            InstanceID: eInstanceID,
                            openStatus: 'Submit'
                        }
                    }
                    else {
                        return {
                            ...flowParam,
                            openStatus: 'Submit'
                        }
                    }
                }
            }
        }
    }

    async function insert_row() {
        if (props.editForm) {
            const row = { ...getParentValues() }
            if (props.onInsert && $.invoke(props.onInsert, row) === false) {
                return
            }
            const flowRow = onFlowInsert(row)
            openForm(row, 'inserted', flowRow)
        }
        else {
            if (await endEdit()) {
                const row = { ...getDefaultValues(), ...getCarryOnValues(), ...getParentValues() }
                if (props.onInsert && $.invoke(props.onInsert, row) === false) {
                    return
                }
                rows.push(row)
                beginEdit(rows.indexOf(row), true)
            }
        }
    }

    function onFlowInsert(row) {
        if (isFlow.value && isFlowMode(flowParam, 'Prepare')) {
            return {
                ...flowParam,
                openStatus: 'Submit'
            }
        }
    }

    async function copy_row(prompt) {
    }

    function clickCell(index, col) {
        if (!isReadonly.value && props.editOnEnter && !props.editForm) {
            edit_row(index, col.field)
        }
        else {
            select(index)
            if (col.format === 'drilldown') {
                triggerDrilldown(rows[index]);
            }
        }
    }


    function triggerDrilldown(row) {
        if ($) {
            const keys = Object.keys($);
            let found = false;

            for (let i = 0; i < keys.length; i++) {
                const comp = $[keys[i]];
                if (comp && comp.value && typeof comp.value.open === 'function') {
                    const bindTarget = comp.value.bindingObject || (comp.value.$props && comp.value.$props.bindingObject);
                    
                    if (bindTarget === props.id) {
                        comp.value.open(row);
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                console.warn(`[DataGrid] Cannot find Drilldown component with bindingObject="${props.id}"!`);
            }
        }
    }

    function select(index) {
        selectedIndex.value = index
    }

    function beginEdit(index, isNew, focusCol) {
        select(index)
        const row = {
            ...rows[index]
        }
        if (isNew) {
            row.__isNew = true
        }
        if (!row.__uuid) {
            row.__uuid = uuidv4()
        }
        editRow.value = row
        editIndex.value = index

        focusInput(focusCol)
    }

    function focusInput(focusCol) {
        nextTick(() => {
            let element
            if (focusCol) {
                element = document.querySelector(`#${props.id} [data-field="${focusCol}"] .form-control`)
            }
            if (!element) {
                element = document.querySelector(`#${props.id} .form-control`)
            }
            if (element) {
                element.focus()
            }
        })
    }

    let insertedRows = []
    let updatedRows = []
    let deletedRows = []

    function removeRowByUid(row) {
        insertedRows = insertedRows.filter(r => r.__uuid !== row.__uuid)
        updatedRows = updatedRows.filter(r => r.__uuid !== row.__uuid)
    }

    function appendRow(row) {
        if (!row.__uuid) {
            row.__uuid = uuidv4();
        }
        row.__isNew = true;
        rows.push(row);
        insertedRows.push(row);
    }

    async function validate(row) {
        invalidColumn.value = ''
        const invalidColumns = $.validateRow(props.columns, row)
        if (Object.keys(invalidColumns).length) {
            const messages = []
            Object.keys(invalidColumns).forEach(k => {
                const iCol = invalidColumns[k]
                messages.push(`${iCol.title} - ${iCol.message}`)
            })
            const vColumn = Object.keys(invalidColumns)[0]
            invalidColumn.value = vColumn
            await $.alert(messages.join('<br>'), 'danger')
            focusInput(vColumn)
            return false
        }
        else {
            return true
        }
    }

    async function endEdit() {
        if (editIndex.value >= 0) {
            const row = toRaw(editRow.value);
            if (await validate(row)) {
                removeRowByUid(row)
                //validate
                if (isNew(row)) {
                    insertedRows.push(row)
                }
                else {
                    updatedRows.push(row)
                }
                Object.keys(row).forEach(k => {
                    rows[editIndex.value][k] = row[k]
                })
                lastRow = row
                if (props.autoApply) {
                    if (!await submit()) {
                        return false
                    }
                }
                resetEdit()
                return true

            }
        }
        else {
            return true
        }
    }

    function cancelEdit() {
        if (editIndex.value >= 0) {
            select(-1)
            const row = editRow.value;
            if (isNew(row)) {
                rows.splice(editIndex.value, 1)
            }
        }
        resetEdit()
    }

    function resetEdit() {
        editRow.value = {}
        editIndex.value = -1
        invalidColumn.value = ''
    }

    async function submit() {
        const { updateData } = dataUtils(props.remoteName);
        try {
            const datas = getChangedDatas()
            await updateData(datas, props.duplicateCheck)
            acceptChanges()
            return true
        }
        catch (e) {
            const errorText = $.getErrorText(e)
            if (errorText.indexOf('duplicate:') == 0) {
                const duplicateValue = errorText.replace('duplicate:', '');
                const msg = $.getMessage('validateDuplicate', duplicateValue)
                $.showError(msg)
            }
            else {
                $.showError(e)
            }
            return false
        }
    }

    async function delete_row(index) {
        const row = { ...rows[index] }
        if (props.onDelete && $.invoke(props.onDelete, row, index) === false) {
            return
        }
        if (await endEdit()) {
            const flowRow = await onFlowDelete(row)
            if (flowRow) {
                openForm(row, 'view', flowRow)
                return
            }
            else if (flowRow === false) {
                return
            }
            if (props.confirmDelete) {
                const r = await $.confirmMessage('confirm remove ?')
                if (!r) {
                    return
                }
            }

            removeRowByUid(row)
            deletedRows.push(row)
            select(-1)
            if (props.autoApply) {
                if (await submit()) {
                    rows.splice(index, 1)
                }
            }
            else {
                rows.splice(index, 1)
            }
        }
    }

    async function onFlowDelete(row) {
        if (isFlow.value && isFlowMode(flowParam, 'Prepare')) {
            if (!await checkFlowFlag(row)) {
                return false
            }
            else {
                const pInstanceID = isFlowFlag(row, 'Pause')
                if (pInstanceID) {
                    const qRow = await getPauseRow(pInstanceID)
                    if (qRow) {
                        return {
                            openStatus: 'Reject',
                            ...qRow
                        }
                    }
                    else {
                        return false
                    }
                }
                else {
                    const eInstanceID = isFlowFlag(row, 'End')
                    if (eInstanceID) {
                        return {
                            ...flowParam,
                            TextSuffix: $.getMessage('reject'),
                            EndStatus: 'Reject',
                            InstanceID: eInstanceID,
                            openStatus: 'Submit'
                        }
                    }
                }
            }
        }
    }

    async function exportWord(options: any = {}) {
        const index = selectedIndex.value
        if (index >= 0) {
            if (typeof options === 'string') {
                options = { name: options }
            }
            
            const masterRow = toRaw(rows[index])            
            const param = {
                remoteName: props.remoteName,
                masterRow: masterRow,
                fileType: options.fileType,
                wordName: options.wordName || options.fileName,
                downloadName: options.downloadName || '',
                directOpen: options.directOpen || false,
                password: options.password,
                watermark: options.watermark,
                titleName: options.titleName
            }

            const loadingMsg = $.localeMessages?.value?.exporting || 'Exporting...'
            if ($.loading) $.loading(document.body, loadingMsg)

            const paths = window.location.pathname.split('/')
            const name = options.name || decodeURI(paths[paths.length - 1])

            const { exportFile } = dataUtils(props.remoteName);
        

            try {
                const { exportFile } = dataUtils(props.remoteName);
                const file = await exportFile('word', name, param);

                if (!file) {
                    $.showError($.localeMessages?.value?.error || "Export failed");
                    return;
                }

                const newName = param.downloadName !== '' ? encodeURIComponent(param.downloadName) : encodeURIComponent(name);
                
                const baseUrl = (import.meta.env.VITE_APP_API_URL || '').replace(/\/+$/, '');

                const downloadUrl = `${baseUrl}/file?q=${file}&n=${newName}`;

                if (options.fileType === 'pdf' && param.directOpen) {
                    window.open(downloadUrl + '&t=inline');
                } else {
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.setAttribute('download', '');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } catch (error) {
                $.showError(error);
            } finally {
                if ($.loaded) $.loaded(document.body);
            }
        } else {
            const warningMsg = $.localeMessages?.value?.selectData || 'Please select data'
            $.alert(warningMsg, 'warning')
        }
    }

    function getDefaultValues() {
        const dParam = {
            parent: getParentValues(),
            autoseq: toRaw(rows)
        }
        return $.getDefaultValues(props.columns || [], dParam)
    }

    function getCarryOnValues() {
        const values = {}
        if (props.columns) {
            props.columns.forEach(c => {
                if (lastRow && c.carryOn && lastRow[c.field] !== undefined) {
                    values[c.field] = lastRow[c.field]
                }
            })
        }
        return values
    }

    function getParentValues() {
        if (props.parentObject) {
            var form = $['$' + props.parentObject]
            const {
                parentRow
            } = form.value.getParentObj()
            return parentRow
        }
        return {}
    }

    function openQuery() {
        queryValues.value = {}
        const id = 'queryModal'
        const el = document.getElementById(id)
        if (!el) return console.warn(`[DataGrid] Cannot find #${id}`)

        const GlobalBsModal = window?.bootstrap?.Modal
        if (GlobalBsModal) {
            try {
                let inst = GlobalBsModal.getInstance(el)
                if (!inst) inst = new GlobalBsModal(el, { backdrop: true, focus: true, keyboard: true })
                inst.show()
                return
            } catch (e) { /* ignore */ }
        }

        try {
            let m = Modal.getInstance(el)
            if (!m) m = new Modal(el, { backdrop: true, focus: true, keyboard: true })
            m.show()
            return
        } catch (e) { /* ignore */ }

        const btn = document.createElement('button')
        btn.type = 'button'
        btn.style.display = 'none'
        btn.setAttribute('data-bs-toggle', 'modal')
        btn.setAttribute('data-bs-target', `#${id}`)
        document.body.appendChild(btn)
        btn.click()
        btn.remove()
    }

    function getChangedDatas() {
        const datas = [];
        if (insertedRows.length + updatedRows.length + deletedRows.length) {
            var remoteName = props.remoteName;
            var rows = {
                table: remoteName.split('.')[1],
                inserted: insertedRows,
                updated: updatedRows,
                deleted: deletedRows,
                duplicateCheck: props.duplicateCheck
            };
            datas.push(rows);
        }
        return datas;
    }

    function acceptChanges() {
        insertedRows = []
        updatedRows = []
        deletedRows = []
    }

    function openMove() {
        if ($) {
            const keys = Object.keys($);
            let found = false;
            for (let i = 0; i < keys.length; i++) {
                const comp = $[keys[i]];
                if (comp && comp.value && typeof comp.value.openMove === 'function') {            
                    const targetGrid = comp.value.targetDataGrid || (comp.value.$props && comp.value.$props.targetDataGrid);
                    
                    if (targetGrid === props.id) {
                        comp.value.openMove();
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                console.warn(`[DataGrid] Cannot find ClientMove component with targetDataGrid="${props.id}"`);
                if ($.showError) {
                    $.showError($.localeMessages?.value?.dataNotFound?.replace('{0}', 'ClientMove') || 'ClientMove not found');
                } else {
                    alert($.localeMessages?.value?.dataNotFound?.replace('{0}', 'ClientMove') || 'ClientMove not found');
                }
            }
        }
    }

    function toolItemClick(item) {
        const me = TOOL_METHODS[item.onclick]
        if (me) {
            me.call()
        }
        else {
            $.invoke(item.onclick)
        }
    }

    function setOrder(sortField, orderBy) {
        if (sort.value == sortField) {
            order.value = orderBy || (order.value == 'asc' ? 'desc' : 'asc')
        }
        else {
            sort.value = sortField
            order.value = orderBy || 'asc'
        }
    }

    const TOOL_METHODS = {
        insert_row,
        edit_row,
        delete_row,
        copy_row,
        openQuery,
        cancelEdit,
        endEdit,
        load,
        submit,
        openMove,
        exportWord
    }

    const EXPOSE_METHODS = {
        ...TOOL_METHODS,
        acceptChanges,
        getChangedDatas,
        appendRow, 
        getDefaultValues
    }

    defineExpose({
        totalRow: footRow,
        currentRow: editRow,
        viewCommandVisible,
        editCommandVisible,
        deleteCommandVisible,
        rows,

        title: props.title,
        queryTitle: props.queryTitle,
        parentObject: props.parentObject,
        autoApply: props.autoApply,
        showLoading,
        hideLoading,
        ...EXPOSE_METHODS
    })

</script>

<style>


    .table-responsive {
        overflow-x: auto;
    }

    .datagrid-title {
        font-weight: 600;
    }

    .bootstrap-datagrid {
        width: 100%;
    }

    .nowrap {
        white-space: nowrap;
    }

    .valign-top {
        vertical-align: top;
    }

    .command-cell {
        white-space: nowrap;
    }

    .sort-btn {
        cursor: pointer;
    }


    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ccc;
        margin-bottom: 1rem;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .custom-modal {
        max-width: min(900px, 90vw);
    }

        .custom-modal .modal-content {
            max-height: none;
        }

        .custom-modal .modal-body {
            overflow: auto;
            max-height: calc(100vh - 6rem);
        }


    .bootstrap-datagrid th,
    .bootstrap-datagrid td {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }


    .datagrid-command .text-info {
        color: var(--bs-info) !important;
    }

    .datagrid-command .text-warning {
        color: var(--bs-warning) !important;
    }

    .datagrid-command .text-danger {
        color: var(--bs-danger) !important;
    }

    .datagrid-command .text-success {
        color: var(--bs-success) !important;
    }

    .datagrid-command .text-secondary {
        color: var(--bs-secondary) !important;
    }

    /* td.error .form-control {
        border: 1px solid red
    }*/

    .dg-pager {
        position: sticky;
        bottom: 0;
        padding: .5rem .75rem;
        background: #fff;
        border-top: 1px solid #eee;
        z-index: 1;
    }

    .custom-modal {
        max-width: 700px;
    }

    .query-form-wrap {
        max-width: 600px;
        margin: 0 auto;
    }

    #queryModal .col-form-label {
        margin-bottom: 0;
    }

    #queryModal .row.mb-2 {
        margin-bottom: .5rem !important;
    }

    .pull-right {
        float: right;
    }
</style>