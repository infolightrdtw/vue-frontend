<template>
    <div v-if="visible"
         class="bootstrap-form"
         :class="isDialogMode
            ? 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50'
            : 'df-inline w-100'"
         :style="isDialogMode ? 'z-index: 1050;' : null">
        <div class="card shadow-lg df-modal" :class="[ fit ? 'df-full' : 'df-modal', isDialogMode ? modalWidthClass : 'w-100' ]">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h5 class="mb-0">{{ formTitle }}</h5>
                <div class="d-flex align-items-center gap-2">
                    <span v-if="isReadOnly" class="badge bg-secondary">{{ props.root.localeMessages?.value?.view }}</span>
                    <button type="button" class="btn btn-sm btn-outline-secondary" @click="onClose">✕</button>
                </div>
            </div>

            <div class="card-body">
                <form novalidate>
                    <div v-if="globalError && validateStyleLower === 'hint'"
                         class="alert alert-danger alert-dismissible py-2 px-3 mb-3 d-flex align-items-start">
                        <div class="flex-grow-1" v-html="globalError"></div>
                        <button type="button"
                                class="btn-close ms-2"
                                aria-label="Close"
                                @click="globalError = ''"></button>
                    </div>
                    <div class="row gy-0 gx-4" :data-readonly="isReadOnly ? '1' : '0'">
                        <template v-for="(f, idx) in visibleFields" :key="idx">
                            <div v-if="idx > 0 && (isFullWidth(f) || f.newRow)"
                                 class="w-100 d-none d-md-block"></div>
                            <div :class="[computeColClass(f), columnStyles[f.key] ? 'df-col-styled' : '']"
                                 :style="columnStyles[f.key] || null">

                                <div class="row align-items-center g-2">
                                    <label v-if="f.label !== false" :class="[(isFullWidth(f) ? 'col-12 col-md-2' : 'col-12 col-md-4'), 'col-form-label', 'text-muted', 'fw-semibold']">
                                        <span v-if="isRequired(f)" class="text-danger">
                                            {{ f.label || f.key }}
                                        </span>
                                        <span v-else>
                                            {{ f.label || f.key }}
                                        </span>
                                    </label>

                                    <div :class="((isFullWidth(f) ? (f.inputCol || 'col-12 col-md-10') : (f.inputCol || 'col-12 col-md-8')) + ' df-input form-editor' + (editorCls ? ' ' + editorCls : ''))">
                                        <BEditor :type="editorType(f)"
                                                 :options="editorOptions(f)"
                                                 :row="formState"
                                                 :column="f"
                                                 :model-value="formState[f.key] ?? null"
                                                 @update:modelValue="val => assignValue(f.key, val)"
                                                 @blur="() => handleFieldBlur(f.key)" />
                                        <div v-if="fieldError[f.key] && validateStyleLower === 'timely'"
                                             class="mt-1 error-message df-error-timely">
                                            {{ fieldError[f.key] }}
                                        </div>
                                        <div v-else-if="f.help" class="form-text mt-1">{{ f.help }}</div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </form>
                <slot :row="formState" :readonly="isReadOnly" :panelColumns="panelColumns"></slot>
            </div>

            <div class="card-footer d-flex justify-content-between align-items-center">
                <small v-if="hint" class="text-muted">{{ hint }}</small>

                <div class="ms-auto d-flex">
                    <FlowButtons v-if="flowRow" :root="props.root" :formID="props.id" :autoPause="props.autoPause" :flowRow="flowRow"></FlowButtons>
                    <template v-else>
                        <button type="button" class="btn btn-primary" :disabled="isReadOnly || saving" @click="submit">
                            <span v-if="!saving">{{ props.root.localeMessages?.value?.save }}</span>
                            <span v-else class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        </button>
                        <button type="button" class="btn btn-default" @click="onCancel">{{ props.root.localeMessages?.value?.cancel }}</button>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, reactive, ref, toRaw, watch, getCurrentInstance, provide } from 'vue'
    import axios from 'axios'
    import dataUtils from '@/utils/dataApi'

    function resolveEditorType(column) {
        const t = column?.editorType || column?.editor?.type || column?.type || 'textbox'
        return String(t || 'textbox').toLowerCase()
    }

    function resolveEditorOptions(column, row) {
        // Accept both schemas: new-style `editorProps` and old-style `editor.options`
        // (the design tool currently emits the latter). editorProps wins on conflicts.
        const fromEditor = column?.editor?.options || {}
        const fromEditorProps = column?.editorProps || {}
        const base = { ...fromEditor, ...fromEditorProps }

        if (props.editorCls) {
            const existing = typeof base.cls === 'string' ? base.cls : ''
            base.cls = existing ? `${existing} ${props.editorCls}` : props.editorCls
        }

        const field = column?.key || column?.field
        const title = column?.label || column?.title || field
        const isKeyField = field && Array.isArray(keyFields?.value) && keyFields.value.includes(field)

        if (base.field == null) base.field = field
        if (base.title == null) base.title = title

        const getBool = (v) =>
            typeof v === 'function' ? !!v(row || {}) : !!v

        if (column?.readonly != null && base.readonly == null) {
            base.readonly = getBool(column.readonly)
        }
        if (column?.disabled != null && base.disabled == null) {
            base.disabled = getBool(column.disabled)
        }
        if (column?.required != null && base.required == null) {
            base.required = getBool(column.required)
        }

        if (column?.options != null) {
            if (base.items == null) base.items = column.options
            if (base.options == null) base.options = column.options
        }
        if (resolveEditorType(column) === 'refval') {
            base.onApply = (mapped) => {
                applyMappedToForm(mapped)
            }
        }

        if (!isNewRecord.value && isKeyField) {
            base.readonly = true
        }
        return base
    }


    const editorType = (column) => resolveEditorType(column)
    const editorOptions = (column) => resolveEditorOptions(column, formState)

    function getFieldByKey(key) {
        const list = normalizedFields?.value || []
        return list.find(f => f && f.key === key) || null
    }

    function applyMappedToForm(mapped) {
        if (!mapped) return
        Object.keys(mapped).forEach((field) => {
            formState[field] = mapped[field]
        })
    }

    // --- end dynamic resolver ---

    const props = defineProps({
        title: { type: String, default: '' },
        remoteName: String,
        root: Object,
        modelValue: { type: Object, default: () => ({}) },
        fields: { type: Array, default: () => [] },
        columns: { type: Array, default: () => [] },
        dataformTabs: { type: Array, default: () => [] },
        dataformOptions: { type: Object, default: () => ({}) },
        readonly: { type: Boolean, default: false },
        hint: { type: String, default: '' },
        size: { type: String, default: 'lg' }, // 'sm'|'md'|'lg'|'xl'
        excludeKeys: { type: Array, default: () => ['_rowState', '_index'] },
        horizontalColumnsCount: { type: [Number, String], default: 2 },
        id: { type: String, required: true },
        visible: { type: Boolean, default: false },
        validateStyle: { type: String, default: 'dialog' },
        duplicateCheck: { type: Boolean, default: false },
        isShowFlowIcon: Boolean,
        autoPause: Boolean,
        fit: { type: Boolean, default: false },
        closeProtect: { type: Boolean, default: false },
        editorCls: { type: String, default: '' },
        mode: { type: String, default: 'dialog' },
        recordLock: { type: Boolean, default: false },
        onLoad: String,
        onApply: String,
        onApplied: String,
        onApplyError: String,
        onCancel: String,
        onDelete: String,
        onExportWord: String,
        onShowTitle: String,
        loadAction: String,
        onFlowLoad: String,
        onFlowApply: String,
        onFlowApplied: String,
        onFlowError: String
    })

    const renderMode = computed(() => String(props.mode || 'dialog').toLowerCase())
    const isDialogMode = computed(() => renderMode.value === 'dialog')

    const validateStyleLower = computed(() =>
        String(props.validateStyle || '').toLowerCase()
    )

    const emit = defineEmits([
        'update:modelValue',
        'close',
        'cancel',
        'removeLock'
    ])

    const visible = ref(false)
    let lastSubmittedRow = {}
    const forceReadonly = ref(null)
    const localWhereItems = ref(null)
    const localWhereStr = ref(null)
    const isReadOnly = computed(() => {
        if (forceReadonly.value !== null) return !!forceReadonly.value
        return formStatus.value == 'view' || !!props.readonly
    })
    let originalSnapshot = ''
    function isDirty () {
        try {
            return JSON.stringify(toRaw(formState)) !== originalSnapshot
        } catch { return false }
    }
    const panelColumns = reactive([])
    const columnStyles = reactive({})
    const saving = ref(false)
    const formState = reactive({})
    const fieldError = ref({})
    const parentRowRef = ref(null)
    const globalError = ref('')
    const hasDataGridError = ref(false)
    const isNewRecord = computed(() => formStatus.value == 'inserted')
    const dataKeys = ref([])
    const hiddenFields = ref(new Set())
    const formTitle = computed(() => {
        const base = [props.title, flowRow.value?.TextSuffix].filter(Boolean).join('_')
        if (props.onShowTitle && props.root?.invoke) {
            try {
                const next = props.root.invoke(props.onShowTitle, base, formState)
                if (typeof next === 'string' && next.length) return next
            } catch { /* ignore — fall back to base */ }
        }
        return base
    })

    const keyFields = computed(() => {
        if (Array.isArray(dataKeys.value) && dataKeys.value.length > 0) {
            return dataKeys.value
        }
        return []
    })

    const viewGrids = {}
    const detailGrids = {}

    const formStatus = ref('')
    const flowRow = ref()
    import flowUtils from '@/utils/flowApi'
    const {
        isFlowMode
    } = flowUtils(props.root)
    const flowParam = props.root.getEncryptParameters()

    provide('currentRowData', formState)

    function open(param) {
        const row = param.row
        const status = param.status
        dataKeys.value = param.keys
        formStatus.value = status

        Object.keys(formState).forEach(k => delete formState[k])
        Object.assign(formState, row)
        flowRow.value = param.flowRow

        if (status == 'inserted' && Array.isArray(props.columns)) {
            const ctx = {
                row: formState,
                parentRow: props?.parentRow,
                rows: props?.rows
            }
            for (const f of props.columns) {
                const key = f.key || f.field || f.name
                if (!key) continue
                const cur = formState[key]
                const empty = (cur === undefined || cur === null || cur === '')

                if (empty && f.defaultValue != null && f.defaultValue !== '') {
                    const v = computeDefault(f.defaultValue, ctx)
                    if (v !== undefined) {
                        formState[key] = v
                    }
                }
                const cur2 = formState[key]
                const empty2 = (cur2 === undefined || cur2 === null || cur2 === '')
                if (empty2 && f.carryOn && lastSubmittedRow[key] !== undefined && lastSubmittedRow[key] !== '') {
                    formState[key] = lastSubmittedRow[key]
                }
            }
        }
        visible.value = true

        if (props.onLoad) {
            props.root.invoke(props.onLoad, formState)
        }
        if (props.loadAction) {
            nextTick(() => {
                try {
                    if (props.loadAction === 'insert_row') insert_row()
                    else if (props.loadAction === 'edit_row') edit_row(toRaw(formState))
                    else if (props.loadAction === 'delete_row') delete_row()
                } catch (e) { console.warn('[DataForm] loadAction failed', e) }
            })
        }
        if (flowRow.value && props.onFlowLoad) {
            try { props.root.invoke(props.onFlowLoad, toRaw(flowRow.value)) } catch { /* user code */ }
        }
        try { originalSnapshot = JSON.stringify(toRaw(formState)) } catch { originalSnapshot = '' }
    }

    function computeDefault(def, ctx = {}) {
        if (def == null) return undefined

        var rule = 'constant'
        var params = []

        if (typeof def === 'object' && def.rule) {
            rule = String(def.rule).toLowerCase()
            params = Array.isArray(def.params) ? def.params : []
        } else {
            const s = String(def).trim()
            var m = s.match(/^([a-zA-Z_]\w*)\s*\((.*)\)\s*$/)
            if (!m) m = s.match(/^([a-zA-Z_]\w*)\s*\[(.*)\]\s*$/)
            if (m) {
                rule = m[1].toLowerCase()
                params = splitParams(m[2])
            } else {
                rule = 'constant'
                params = [s]
            }
        }

        const fmt = (d, pattern) => {
            if (typeof Date.prototype.Format === 'function') return d.Format(pattern)
            const pad2 = n => (n < 10 ? '0' : '') + n
            const y = d.getFullYear(), M = d.getMonth() + 1, dd = d.getDate()
            const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds()
            if (pattern === 'yyyy/MM/dd') return `${y}/${pad2(M)}/${pad2(dd)}`
            if (pattern === 'yyyyMMdd') return `${y}${pad2(M)}${pad2(dd)}`
            if (pattern === 'yyyy/MM/dd hh:mm:ss') return `${y}/${pad2(M)}/${pad2(dd)} ${pad2(h)}:${pad2(m)}:${pad2(s)}`
            return d.toISOString()
        }
        const getDateByKey = (type) => {
            const t = new Date(), y = t.getFullYear(), m = t.getMonth()
            switch (type) {
                case 'firstday': return new Date(y, m, 1)
                case 'lastday': return new Date(y, m + 1, 0)
                case 'firstdaylm': return new Date(y, m - 1, 1)
                case 'lastdaylm': return new Date(y, m, 0)
                case 'firstdayty': return new Date(y, 0, 1)
                case 'lastdayty': return new Date(y + 1, 0, 0)
                case 'firstdayly': return new Date(y - 1, 0, 1)
                case 'lastdayly': return new Date(y, 0, 0)
                default: return new Date()
            }
        }

        switch (rule) {
            case 'constant': {
                return params[0]
            }

            case 'varaible': {
                const key = params[0]
                switch (key) {
                    case 'today': return fmt(new Date(), 'yyyy/MM/dd')
                    case 'todayc8': return fmt(new Date(), 'yyyyMMdd')
                    case 'firstday':
                    case 'lastday':
                    case 'firstdaylm':
                    case 'lastdaylm':
                    case 'firstdayty':
                    case 'lastdayty':
                    case 'firstdayly':
                    case 'lastdayly':
                        return fmt(getDateByKey(key), 'yyyy/MM/dd')
                    case 'now': return fmt(new Date(), 'yyyy/MM/dd hh:mm:ss')
                }
                try {
                    const s = sessionStorage.getItem('clientInfo')
                    if (s) {
                        const clientInfo = JSON.parse(s)
                        return clientInfo[key] ?? ''
                    }
                } catch (_) { }
                return ''
            }

            case 'function': {
                const fnName = params[0]
                const arg = params[1] ?? ctx.fParam
                const fn = (typeof window !== 'undefined') ? window?.[fnName] : null
                try { return (typeof fn === 'function') ? fn(arg, null) : '' } catch (_) { return '' }
            }

            case 'row': {
                const field = params[0]
                const row = ctx.row
                if (row && field) return row[field]
                return undefined
            }

            // autoseq[field, numDig, startValue, step, prefix?]
            case 'autoseq': {
                const field = params[0]
                const len = parseInt(params[1] ?? 0, 10) || 0
                const start = parseInt(params[2] ?? 1, 10) || 1
                const step = parseInt(params[3] ?? 1, 10) || 1
                const prefix = params[4] != null ? String(params[4]) : ''
                const rows = Array.isArray(ctx.rows) ? ctx.rows : null
                if (!rows || !field) return undefined

                var maxVal = -1
                for (var i = 0; i < rows.length; i++) {
                    const raw = rows[i]?.[field]
                    if (raw === null || raw === undefined || raw === '') continue
                    var s = String(raw)
                    if (prefix && s.startsWith(prefix)) {
                        s = s.slice(prefix.length)
                    } else {
                        const mm = s.match(/(\d+)\s*$/)
                        s = mm ? mm[1] : s
                    }
                    const v = parseInt(s, 10)
                    if (!isNaN(v)) maxVal = Math.max(maxVal, v)
                }
                var value = (maxVal < 0 ? start : (maxVal + step)).toString()
                if (len > 0 && value.length < len) value = value.padStart(len, '0')
                return prefix + value
            }

            case 'parent': {
                const field = params[0]
                const parentRow = ctx.parentRow
                if (parentRow && field) return parentRow[field]
                return undefined
            }

            default:
                return undefined
        }

        function splitParams(s) {
            if (!s.trim()) return []
            const raw = s.split(',').map(x => x.trim())
            return raw.map(v => {
                if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                    return v.slice(1, -1)
                }
                return v
            })
        }
    }

    function close(force = false) {
        if (!force && props.closeProtect && isDirty()) {
            const msg = props.root.localeMessages?.value?.confirmClose
                || 'Discard unsaved changes?'
            if (!window.confirm(msg)) return
        }
        if (props.recordLock && formStatus.value === 'updated' && dataKeys.value?.length) {
            try {
                const { removeLock: apiRemoveLock } = dataUtils(props.remoteName)
                apiRemoveLock(dataKeys.value.join(','), [toRaw(formState)])
                    .catch(err => console.warn('[DataForm] removeLock failed', err))
            } catch (err) { /* ignore */ }
        }
        visible.value = false
        Object.keys(fieldError.value).forEach(k => {
            fieldError.value[k] = null
        })
        globalError.value = ''

        emit('close')
        fireClose()
        if (flowRow.value) {
            if (isFlowMode(flowParam, 'View')) {

            }
            else if (isFlowMode(flowParam, 'Prepare')) {
                Object.keys(viewGrids).forEach(k => {
                    viewGrids[k].value.load()
                })
            }
            else {
                window.top.postMessage({ method: 'closeCurrentTab' })
            }
        }
    }

    function onClose() { close() }
    function onCancel() {
        emit('cancel')
        if (props.onCancel) {
            try { props.root.invoke(props.onCancel, formState) } catch { /* user code */ }
        }
        close()
    }

    async function submit(closeModal = true) {
        const status = formStatus.value
        if (status == 'view') {
            return true
        }
        if (props.onApply && props.root.invoke(props.onApply) === false) {
            return false
        }
        if (flowRow.value && props.onFlowApply) {
            try { props.root.invoke(props.onFlowApply, toRaw(formState)) } catch { /* user code */ }
        }
        if (!validate()) {
            return false
        }

        const rowData = toRaw(formState)
        const command = props.remoteName.split('.')[1]
        const rows = { table: command, inserted: [], updated: [], deleted: [] }
        if (status == 'inserted') {
            rows.inserted.push({ ...rowData })
        } else {
            rows.updated.push({ ...rowData })
        }

        //merge detail change
        const datas = [rows]
        const dKeys = Object.keys(detailGrids)
        if (dKeys.length > 0) {
            const detailGrid = detailGrids[dKeys[0]]
            if (await detailGrid.value.endEdit()) {
                const detailDatas = detailGrid.value.getChangedDatas()
                datas.push(...detailDatas)
            }
            else {
                return false
            }
        }

        const { updateData } = dataUtils(props.remoteName);
        saving.value = true
        try {
            var result = await updateData(datas, props.duplicateCheck || false)
            formStatus.value = 'view'
            Object.keys(viewGrids).forEach(k => {
                viewGrids[k].value.load()
            })

            if (!closeModal) {
                let row = {};
                if (result[0].updated.length > 0) {
                    row = result[0].updated[0];
                } else if (result[0].inserted.length > 0) {
                    row = result[0].inserted[0];
                }
                Object.keys(formState).forEach(k => delete formState[k])
                Object.assign(formState, row)

                const dKeys = Object.keys(detailGrids)
                if (dKeys.length > 0) {
                    const detailGrid = detailGrids[dKeys[0]]
                    detailGrid.value.load()
                }
            }
            else {
                close(true)
            }
            try { originalSnapshot = JSON.stringify(toRaw(formState)) } catch { /* noop */ }
            try { lastSubmittedRow = { ...toRaw(formState) } } catch { /* noop */ }
            if (props.onApplied) {
                try { props.root.invoke(props.onApplied, formState, result) } catch { /* user code */ }
            }
            if (flowRow.value && props.onFlowApplied) {
                try { props.root.invoke(props.onFlowApplied, result) } catch { /* user code */ }
            }
            if (props.recordLock && status === 'updated') {
                try {
                    const { removeLock: apiRemoveLock } = dataUtils(props.remoteName)
                    await apiRemoveLock(dataKeys.value.join(','), [toRaw(formState)])
                } catch (lockErr) { /* non-fatal — log and continue */ console.warn('[DataForm] removeLock failed', lockErr) }
            }
            return true
        }
        catch (e) {
            let err = e.response?.data?.error
            if (err && err.startsWith('duplicate:')) {
                const duplicateValue = err.replace('duplicate:', '').trim()
                const text = props.root.localeMessages?.value?.validateDuplicate
                if (typeof text === 'string') {
                    if (text.indexOf('{0}') >= 0) {
                        err = text.replace('{0}', duplicateValue)
                    }
                }
                props.root.showError(err)
            }
            else if (props.onApplyError && props.root?.invoke) {
                try {
                    props.root.invoke(props.onApplyError, e)
                } catch (ex) {
                    props.root.showError(ex.message || ex)
                }
            }
            else if (props.dataformOptions?.onApplyError) {
                try {
                    props.dataformOptions.onApplyError(e)
                } catch (ex) {
                    props.root.showError(ex.message || ex)
                }

            }
            else {
                props.root.showError(e)
            }
            if (flowRow.value && props.onFlowError) {
                try { props.root.invoke(props.onFlowError, e) } catch { /* user code */ }
            }
            return false
        }
        finally {

            saving.value = false
        }
    }

    const validateRules = {
        email: {
            validator(value) {
                return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value)
            },
            message: computed(() => props.root.localeMessages.value['validateEmail'])
        },
        url: {
            validator(value) {
                return /^((https|http|ftp|rtsp|mms)?:\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value)
            },
            message: computed(() => props.root.localeMessages.value['validateUrl'])
        },
        length: {
            validator(value, param = []) {
                const len = String(value ?? '').trim().length
                const min = Number(param[0] ?? 0)
                const max = Number(param[1] ?? Number.MAX_SAFE_INTEGER)
                return len >= min && len <= max
            },
            message: computed(() => props.root.localeMessages.value['validateLength'])
        },
        minLength: {
            validator(value, param = []) {
                const len = String(value ?? '').length
                const min = Number(param[0] ?? 0)
                return len >= min
            },
            message: computed(() => props.root.localeMessages.value['validateMinLength'])
        },
        maxLength: {
            validator(value, param = []) {
                const len = String(value ?? '').length
                const max = Number(param[0] ?? Number.MAX_SAFE_INTEGER)
                return len <= max
            },
            message: computed(() => props.root.localeMessages.value['validateMaxLength'])
        },
        greater: {
            validator(value, param = []) {
                const v = parseFloat(value)
                const p = parseFloat(param[0])
                if (!isNaN(v) && !isNaN(p)) return v >= p
                return value >= param[0]
            },
            message: computed(() => props.root.localeMessages.value['validateGreater'])
        },
        less: {
            validator(value, param = []) {
                const v = parseFloat(value)
                const p = parseFloat(param[0])
                if (!isNaN(v) && !isNaN(p)) return v <= p
                return value <= param[0]
            },
            message: computed(() => props.root.localeMessages.value['validateLess'])
        },
        range: {
            validator(value, param = []) {
                const v = parseFloat(value)
                const p0 = parseFloat(param[0])
                const p1 = parseFloat(param[1])
                if (!isNaN(v) && !isNaN(p0) && !isNaN(p1)) {
                    return v >= p0 && v <= p1
                }
                if (!param[0]) return true
                return value >= param[0] && value <= param[1]
            },
            message: computed(() => props.root.localeMessages.value['validateRange'])
        },
        cid: {
            validator(value) {
                const regIdNo = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/
                return regIdNo.test(value)
            },
            message: computed(() => props.root.localeMessages.value['validateID'])
        },
        tid: {
            validator(value) {
                const tab = 'ABCDEFGHJKLMNPQRSTUVXYWZIO'
                const A1 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3]
                const A2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5]
                const Mx = [9, 8, 7, 6, 5, 4, 3, 2, 1, 1]

                if (value.length !== 10) return false
                var i = tab.indexOf(value.charAt(0))
                if (i === -1) return false
                var sum = A1[i] + A2[i] * 9

                for (i = 1; i < 10; i++) {
                    const v = parseInt(value.charAt(i), 10)
                    if (isNaN(v)) return false
                    sum += v * Mx[i]
                }
                return sum % 10 === 0
            },
            message: computed(() => props.root.localeMessages.value['validateID'])
        },
        uid: {
            validator(value) {
                const invalidList = '00000000,11111111'
                if (!/^\d{8}$/.test(value) || invalidList.indexOf(value) !== -1) {
                    return false
                }
                const multiplier = [1, 2, 1, 2, 1, 2, 4, 1]
                var sum = 0
                const calc = (digital) => {
                    const one = digital % 10
                    const ten = (digital - one) / 10
                    return one + ten
                }
                for (var i = 0; i < multiplier.length; i++) {
                    sum += calc(value[i] * multiplier[i])
                }
                return sum % 5 === 0 || (value[6] === '7' && (sum + 1) % 5 === 0)
            },
            message: computed(() => props.root.localeMessages.value['validateID'])
        },
        function: {
            validator(value, param = []) {
                const name = param[0]
                if (!name) return true
                const fn = (typeof name === 'function')
                    ? name
                    : (typeof window !== 'undefined' ? window[name] : null)
                if (typeof fn === 'function') {
                    return !!fn(value)
                }
                return true
            },
            message: ' '
        },
        unique: {
            validator: async (value, param = [], fieldKey) => {
                if (!value) return true
                const remote = props.remoteName || (props.dataformOptions?.remoteName)
                if (!remote || !remote.includes('.')) {
                    console.warn('[unique rule] remoteName 未設定:', remote)
                    return true
                }

                const [module, command] = remote.split('.')

                const keys = Array.isArray(dataKeys.value) ? dataKeys.value : []
                const keyvalues = []

                keys.forEach(k => keyvalues.push(formState[k]))

                let whereKey = ''
                keys.forEach((k, i) => {
                    whereKey += `${k}=N'${keyvalues[i] ?? ''}' and `
                })
                whereKey = whereKey.substring(0, whereKey.length - 4)
                const whereStr = `${fieldKey}=N'${value}' and not (${whereKey})`

                try {
                    const body = {
                        mode: 'getDataset',
                        module,
                        command,
                        pageSize: -1,
                        total: true,
                        whereStr
                    }

                    const { data } = await axios.post('/api/ApiMain/Data', body, {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
                    })
                    const total = data?.total ?? data?.[0]?.total ?? (Array.isArray(data) ? data.length : 0)

                    return total === 0
                } catch (e) {
                    console.error('[unique rule] API error:', e)
                    return true
                }
            },
            message: computed(() => props.root.localeMessages.value['validateUnique'])
        }
    }

    function validateByRule(ruleStr, value, fieldKey) {
        if (!ruleStr) return ''
        const m = /([a-zA-Z_]+)(.*)/.exec(ruleStr.trim())
        if (!m) return ''
        const name = m[1]
        const tail = (m[2] || '').trim()
        const rule = validateRules[name]
        if (!rule) return ''

        if ((value === undefined || value === null || value === '') && name !== 'function') {
            return ''
        }

        var param = null
        if (tail) {
            try {
                if (tail.startsWith('[')) {
                    // 將 ['a','b'] 轉成 ["a","b"]
                    const jsonLike = tail.replace(/'/g, '"')
                    param = JSON.parse(jsonLike)
                } else {
                    param = [tail]
                }
            } catch (e) {
                console.error('parse validType 參數失敗:', ruleStr, e)
                param = [tail]
            }
        }

        const ok = rule.validator(value, param || [], fieldKey)
        if (typeof ok === 'string') {
            return ok;
        }
        if (ok) {
            return ''
        }

        var msg = rule.message.value || props.root.localeMessages.value?.error|| '欄位格式不正確'
        if (Array.isArray(param)) {
            param.forEach((p, idx) => {
                msg = msg.replace(new RegExp('\\{' + idx + '\\}', 'g'), String(p))
            })
        }
        return msg
    }

    function validate() {
        var valid = true
        const messages = []

        Object.keys(fieldError.value).forEach(k => { fieldError.value[k] = null })
        globalError.value = ''

        for (const f of normalizedFields.value) {
            const key = f.key
            const label = f.label || key
            const value = formState[key]
            var message = ''

            if (isRequired(f) && (value === undefined || value === null || value === '')) {
                message = props.root.localeMessages.value?.validateNull || '此欄位為必填'
            }

            if (!message && f.validType) {
                const vType = f.validType
                if (Array.isArray(vType)) {
                    for (const ruleStr of vType) {
                        const msg2 = validateByRule(ruleStr, value, key)
                        if (msg2) {
                            message = msg2
                            break
                        }
                    }
                } else if (typeof vType === 'string') {
                    const parts = vType.split(/[;|]/).map(s => s.trim()).filter(Boolean)
                    for (const ruleStr of parts) {
                        const msg2 = validateByRule(ruleStr, value, key)
                        if (msg2) {
                            message = msg2
                            break
                        }
                    }
                }
            }

            if (message) {
                valid = false
                fieldError.value[key] = message
                messages.push(label + ' - ' + message)
            }
        }

        if (!valid && messages.length) {
            const style = String(props.validateStyle || '').toLowerCase()

            if (style === 'dialog') {
                props.root.alert(messages.join('<br>'))
            } else if (style === 'hint') {
                globalError.value = messages.join('<br>')
                nextTick(() => {
                    const modalBody = document.querySelector('.df-modal .card-body')
                    if (modalBody instanceof HTMLElement) {
                        modalBody.scrollTo({ top: 0, behavior: 'smooth' })
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                })
            }
            else if (style === 'timely') {
                nextTick(() => {
                    const firstError = document.querySelector('.df-modal .df-error-timely') || document.querySelector('.df-error-timely')

                    if (firstError instanceof HTMLElement) {
                        const fieldBlock = firstError.closest('.df-input') || firstError.closest('.row') || firstError

                        const container = firstError.closest('.card-body') || document.scrollingElement || document.documentElement

                        if (container instanceof HTMLElement) {
                            const fieldRect = fieldBlock.getBoundingClientRect()
                            const containerRect = container.getBoundingClientRect()
                            const offset = container.scrollTop + (fieldRect.top - containerRect.top) - 12

                            container.scrollTo({ top: offset, behavior: 'smooth' })
                        } else {
                            firstError.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            })
                        }
                    }
                })
            }
        }
        return valid
    }

    function handleFieldBlur(fieldKey) {
        const style = String(props.validateStyle || '').toLowerCase()
        if (style !== 'timely') return

        const f = getFieldByKey(fieldKey)
        if (!f) return

        const value = formState[fieldKey]
        var message = ''

        if (isRequired(f) && (value === undefined || value === null || value === '')) {
            message = props.root.localeMessages.value?.validateNull || '此欄位為必填'
        }

        fieldError.value[fieldKey] = message || null
    }

    const normalizedFields = computed(() => {
        if (props.fields && props.fields.length) {
            return props.fields.map(f => ({ type: 'text', col: 'col-12 col-md-6', ...f }))
        }
        if (props.columns && props.columns.length) {
            return props.columns
                .filter(c => !c.hidden)
                .map(c => {
                    const key = c.field || c.key
                    const label = c.title || c.caption || c.label || key
                    const editor = c.editor || {}
                    const editorType = (editor.type || c.type || 'textbox').toString().toLowerCase()
                    const editorProps = editor.options || {}
                    return {
                        key,
                        field: key,
                        label,
                        span: c.span || 1,
                        editorType,
                        editorProps,
                        type: mapEditorToType({ editor: editorType, ...c }),
                        col: c.grid || c.col,
                        options: c.options || c.items || editorProps.items,
                        required: !!c.required,
                        readonly: !!c.readonly,
                        disabled: !!c.disabled,
                        validType: c.validType || editorProps.validType || '',
                        newRow: c.newRow || false
                    }
                })
        }
        return []
    })

    const visibleFields = computed(() =>
        normalizedFields.value.filter(f => !hiddenFields.value.has(f.key))
    )

    function isFullWidth(f) {
        if (f && f.fullWidth) return true

        const span = (f && f.span != null) ? Number(f.span) : 1
        if (span >= 2) return true

        const userCol = (f && (f.col || f.grid)) ? (f.col || f.grid) : ''
        if (userCol && /col-(?:md|lg|xl)-12/.test(userCol)) return true

        return false
    }

    function computeColClass(f) {
        const span = Number(f?.span ?? 1)
        const cols = Math.max(1, Math.min(12, Number(props.horizontalColumnsCount) || 2))
        const slot = Math.floor(12 / cols)

        if (span >= cols) {
            // Full-row field
            return 'col-12 col-md-12'
        }
        if (span > 1) {
            return `col-12 col-md-${Math.min(12, slot * span)}`
        }

        var userCol = (f && (f.col || f.grid)) ? (f.col || f.grid) : ''
        if (userCol && /col-(?:md|lg|xl)-12/.test(userCol)) return 'col-12 col-md-12'
        return `col-12 col-md-${slot}`
    }


    function isRequired(f) { return typeof f.required === 'function' ? !!f.required(formState) : !!f.required }

    const modalWidthClass = computed(() => {
        switch (props.size) {
            case 'sm': return 'w-100 mw-sm'
            case 'md': return 'w-100 mw-md'
            case 'lg': return 'w-100 mw-lg'
            case 'xl': return 'w-100 mw-xl'
            default: return 'w-100 mw-lg'
        }
    })

    watch(() => props.modelValue, v => {
        const incoming = deepClone(v || {})
        Object.keys(formState).forEach(k => delete formState[k])
        Object.assign(formState, incoming)
    }, { deep: true, immediate: true })

    function mapEditorToType(c) {
        const raw = (c.editor && c.editor.type) ? c.editor.type : (c.editor || c.type || '')
        const editor = raw.toString().toLowerCase()
        if (editor.includes('textarea')) return 'textarea'
        if (editor.includes('combobox') || c.options || c.items) return 'select'
        if (editor.includes('checkbox')) return 'checkbox'
        if (editor.includes('switch')) return 'switch'
        if (editor.includes('date') || editor.includes('datebox')) return 'date'
        if (editor.includes('password')) return 'password'
        if (editor.includes('number') || c.datatype === 'number') return 'number'
        if (editor.includes('timebox')) return 'timebox'
        return 'text'
    }

    function deepClone(obj) { return JSON.parse(JSON.stringify(obj)) }

    function normalizeEvt(v) {
        if (v && typeof v === 'object') {
            if ('target' in v && v.target) return v.target.value
            if ('value' in v) return v.value
        }
        return v
    }
    function assignValue(key, val) {
        formState[key] = val
    }

    function fireOpen() {
        window.dispatchEvent(new CustomEvent('df:open', {
            detail: {
                formId: (props.id || '').toLowerCase(),
                hostId: `${(props.id || '').toLowerCase()}-children`,
                parentRow: props.modelValue || {},
                withParent: true
            }
        }))
    }
    function fireClose() {
        window.dispatchEvent(new CustomEvent('df:close', {
            detail: { formId: (props.id || '').toLowerCase(), hostId: `${(props.id || '').toLowerCase()}-children` }
        }))
    }

    watch(() => props.visible, async v => {
        if (v) {
            await nextTick()
            fireOpen()
        } else {
            fireClose()
        }
    })

    onMounted(async () => {
        const instance = getCurrentInstance()

        if (props.visible) {
            await nextTick()
            fireOpen()
        }
        window.addEventListener('datagrid:error', () => {
            hasDataGridError.value = true
        })
    })

    onUnmounted(() => {
        window.removeEventListener('datagrid:error', () => { })
    })

    onBeforeUnmount(() => {
        fireClose()
    })

    function getParentObj() {
        var parentTable = props.remoteName.split('.').pop()
        return {
            parentTable,
            parentRow: toRaw(formState),
            parentReadOnly: isReadOnly.value,
            parentStatus: formStatus.value
        }
    }

    function showColumn(columnName) {
        hiddenFields.value.delete(columnName)
    }

    function hideColumn(columnName) {
        hiddenFields.value.add(columnName)
    }

    function getFlowRow() {
        const row = toRaw(formState)
        return Object.fromEntries(Object.entries(row).filter(([key, value]) => {
            let column = props.columns.find(c => c.field == key)
            if (!column) {
                column = panelColumns.find(c => c.field == key)
            }
            if (column && column.editor && ['signature', 'htmleditor', 'fileupload'].indexOf(column.editor.type) >= 0) {
                return false
            }
            else {
                return true
            }
        }))
    }

    function getFlowParameter(flowRow) {
        const titles = {}
        props.columns.forEach(c => {
            titles[c.field] = (c.title || c.field).replace(/^\*/, '')
        })
        const row = getFlowRow()
        if (flowRow.Parameter) {
            const pRow = JSON.parse(flowRow.Parameter)
            for (var column in row) {
                pRow[column] = row[column];
            }
            if (pRow.FORM_FIELDS) {
                const ctValues = []
                const fields = pRow.FORM_FIELDS.split(',').filter(Boolean)
                fields.forEach(f => {
                    ctValues.push(`${titles[f]}:${row[f] || ''}`)
                })
                pRow.FORM_PRESENTATION_CT = ctValues.join(';')
            }
            return JSON.stringify(pRow)
        }
        else {
            const pRow = row
            const keys = dataKeys.value
            const pFields = (flowRow.ParameterField || '').split(',').filter(Boolean)
            const values = []
            const ctValues = []
            keys.forEach(k => {
                values.push(`${k}='${row[k]}'`)
                ctValues.push(`${titles[k]}:${row[k]}`)
            })
            pFields.forEach(f => {
                ctValues.push(`${titles[f]}:${row[f] || ''}`)
            })
            pRow.WEBFORM_NAME = flowRow.WEBFORM_NAME
            pRow.tabTitle = flowRow.tabTitle
            pRow.FORM_KEYS = keys.join(';')
            pRow.FORM_FIELDS = [...keys, ...pFields].join(',')
            pRow.FORM_PRESENTATION = values.join(';')
            pRow.FORM_PRESENTATION_CT = ctValues.join(';')
            pRow.PROVIDER_NAME = props.remoteName
            return JSON.stringify(pRow)
        }
    }

    //function insert_row() {
    //    open({}, toRaw(dataKeys), 'inserted')
    //}

    function clear() {
        Object.keys(formState).forEach(k => delete formState[k])
        Object.keys(fieldError.value).forEach(k => { fieldError.value[k] = null })
        globalError.value = ''
        try { originalSnapshot = JSON.stringify(toRaw(formState)) } catch { originalSnapshot = '' }
    }

    function getRow(excludeTypes = []) {
        const raw = JSON.parse(JSON.stringify(toRaw(formState)))
        if (!Array.isArray(excludeTypes) || !excludeTypes.length) return raw
        const cols = props.columns || []
        const drop = new Set()
        cols.forEach(c => {
            const t = (c?.editor?.type || c?.editorType || '').toLowerCase()
            if (excludeTypes.includes(t)) drop.add(c?.field || c?.key)
        })
        drop.forEach(k => { if (k) delete raw[k] })
        return raw
    }

    function loadRow(row) {
        Object.keys(formState).forEach(k => delete formState[k])
        Object.assign(formState, row || {})
        try { originalSnapshot = JSON.stringify(toRaw(formState)) } catch { originalSnapshot = '' }
    }

    async function removeLock(row) {
        if (!props.recordLock || formStatus.value !== 'updated') return
        if (!dataKeys.value?.length) return
        const target = row != null ? row : toRaw(formState)
        try {
            const { removeLock: apiRemoveLock } = dataUtils(props.remoteName)
            await apiRemoveLock(dataKeys.value.join(','), [target])
        } catch (err) {
            console.warn('[DataForm] removeLock failed', err)
        }
        emit('removeLock', target)
    }

    function reloadViewObj() {
        Object.keys(viewGrids).forEach(k => {
            const g = viewGrids[k]
            if (g?.value?.load) g.value.load()
        })
    }

    function loadDetail() {
        Object.keys(detailGrids).forEach(k => {
            const g = detailGrids[k]
            if (g?.value?.load) g.value.load()
        })
    }

    function insert_row(row) {
        open({ row: row || {}, status: 'inserted', keys: dataKeys.value || [], flowRow: null })
    }

    function edit_row(row) {
        const target = row != null ? { ...row } : { ...toRaw(formState) }
        open({ row: target, status: 'updated', keys: dataKeys.value || [], flowRow: null })
    }

    function view_row(row) {
        const target = row != null ? { ...row } : { ...toRaw(formState) }
        open({ row: target, status: 'view', keys: dataKeys.value || [], flowRow: null })
    }

    function status() {
        return formStatus.value
    }

    function openQuery() {
        const grids = viewGrids
        const ids = grids ? Object.keys(grids) : []
        for (const gid of ids) {
            const g = grids[gid]
            if (g?.value && typeof g.value.openQuery === 'function') {
                g.value.openQuery()
                return true
            }
        }
        return false
    }

    function exportWord(param) {
        if (props.onExportWord && props.root?.invoke) {
            return props.root.invoke(props.onExportWord, param || {}, toRaw(formState))
        }
        return null
    }

    async function delete_row() {
        const row = toRaw(formState)
        if (props.onDelete && props.root?.invoke) {
            try {
                const r = props.root.invoke(props.onDelete, row)
                if (r === false) return false
            } catch (e) { /* user code */ }
        }
        const msg = props.root?.localeMessages?.value?.confirmDelete
            || props.root?.getMessage?.('confirm remove')
            || 'Confirm remove?'
        if (typeof props.root?.confirmMessage === 'function') {
            const ok = await props.root.confirmMessage(msg)
            if (!ok) return false
        }
        try {
            const command = props.remoteName.split('.')[1]
            const payload = [{ table: command, inserted: [], updated: [], deleted: [{ ...row }] }]
            const { updateData } = dataUtils(props.remoteName)
            await updateData(payload, props.duplicateCheck || false)
            close(true)
            reloadViewObj()
            return true
        } catch (e) {
            props.root?.showError?.(e)
            return false
        }
    }

    function cancel() {
        emit('cancel')
        close()
    }

    async function reload() {
        if (!props.remoteName || !Array.isArray(dataKeys.value) || !dataKeys.value.length) {
            reloadViewObj()
            return
        }
        const row = toRaw(formState)
        const whereItems = dataKeys.value
            .filter(k => row[k] !== undefined && row[k] !== null && row[k] !== '')
            .map(k => ({ field: k, operator: '=', value: row[k] }))
        if (!whereItems.length) { reloadViewObj(); return }
        try {
            const { loadData } = dataUtils(props.remoteName)
            const data = await loadData({ page: 1, rows: 1, whereItems })
            const rows = Array.isArray(data) ? data : (data?.rows || [])
            if (rows[0]) {
                Object.keys(formState).forEach(k => delete formState[k])
                Object.assign(formState, rows[0])
                try { originalSnapshot = JSON.stringify(toRaw(formState)) } catch { originalSnapshot = '' }
            }
        } catch (e) {
            props.root?.showError?.(e)
        }
    }

    function setReadonly(val) {
        forceReadonly.value = val == null ? null : !!val
    }


    function setColumnReadonly(field, readonly) {
        if (!field) return false
        const ro = readonly == null ? false : !!readonly
        let found = false
        const applyTo = (c) => {
            if (!c || (c.field !== field && c.key !== field)) return
            c.editor = c.editor || {}
            c.editor.options = c.editor.options || {}
            c.editor.options.readonly = ro
            c.readonly = ro
            found = true
        }
        for (const c of (props.columns || [])) applyTo(c)
        for (const c of panelColumns) applyTo(c)
        return found
    }

    // 設定（或清除）某欄位的容器樣式（例如背景色），走 reactive，立即重繪
    function setColumnStyle(field, style) {
        if (!field) return false
        if (style == null || style === '') delete columnStyles[field]
        else columnStyles[field] = style
        return true
    }

    function setWhere(where) {
        if (Array.isArray(where)) {
            localWhereItems.value = where
            localWhereStr.value = null
        } else if (typeof where === 'string') {
            localWhereStr.value = where
            localWhereItems.value = null
        } else {
            localWhereItems.value = null
            localWhereStr.value = null
        }
    }


    function getDefaultValues() {
        const values = {}
        const ctx = { row: formState, parentRow: props?.parentRow, rows: props?.rows }
        for (const f of (props.columns || [])) {
            const key = f.key || f.field || f.name
            if (!key) continue
            if (f.defaultValue != null && f.defaultValue !== '') {
                const v = computeDefault(f.defaultValue, ctx)
                if (v !== undefined) values[key] = v
            }
            if ((values[key] == null || values[key] === '') && f.carryOn && lastSubmittedRow[key] !== undefined && lastSubmittedRow[key] !== '') {
                values[key] = lastSubmittedRow[key]
            }
        }
        return values
    }

    defineExpose({
        open,
        close,
        validate,
        submit,
        clear,
        getRow,
        loadRow,
        removeLock,
        reloadViewObj,
        loadDetail,
        insert_row,
        edit_row,
        delete_row,
        view_row,
        cancel,
        reload,
        setReadonly,
        setColumnReadonly,
        setColumnStyle,
        setWhere,
        getDefaultValues,
        getParentObj,
        getFlowParameter,
        status,
        openQuery,
        exportWord,
        exportReport: (param) =>
            (props.onApplied && props.root?.invoke)
                ? props.root.invoke(props.onApplied, param || {}, toRaw(formState))
                : null,
        
        options: () => ({
            id: props.id,
            remoteName: props.remoteName,
            mode: props.mode,
            readonly: props.readonly,
            duplicateCheck: props.duplicateCheck,
            recordLock: props.recordLock,
            validateStyle: props.validateStyle,
            isShowFlowIcon: props.isShowFlowIcon,
            autoPause: props.autoPause,
            fit: props.fit,
            closeProtect: props.closeProtect
        }),
        hide: () => { visible.value = false },
        currentRow: formState,
        columns: props.columns,
        panelColumns,
        isShowFlowIcon: props.isShowFlowIcon,
        viewGrids,
        detailGrids,
        showColumn,
        hideColumn
    })
</script>

<style scoped>
    .mw-sm {
        max-width: 480px;
    }

    .mw-md {
        max-width: 720px;
    }

    .mw-lg {
        max-width: 900px;
        max-height: 800px;
    }

    .mw-xl {
        max-width: 1320px;
    }

    .df-input :is(.form-control, .form-select, .form-check, .btn-group, .form-check-input) {
        max-width: 420px;
    }

    @media (max-width: 768px) {
        .df-input :is(.form-control, .form-select, .form-check, .btn-group, .form-check-input) {
            max-width: 100%;
        }
    }

    .df-modal {
        max-height: 92vh;
        display: flex;
        flex-direction: column;
    }

        .df-modal > .card-header,
        .df-modal > .card-footer {
            flex: 0 0 auto;
        }

        .df-modal > .card-body {
            flex: 1 1 auto;
            overflow-y: auto;
            overflow-x: hidden;
        }

    .df-child-grids:empty {
        display: none;
        border-top: 0;
    }

    [data-readonly="1"] .df-input,
    [data-readonly="1"] .df-input * {
        pointer-events: none;
    }

        [data-readonly="1"] .df-input .btn {
            opacity: 0.65;
            cursor: default;
        }

        [data-readonly="1"] .df-input :deep(.form-control),
        [data-readonly="1"] .df-input :deep(input),
        [data-readonly="1"] .df-input :deep(textarea),
        [data-readonly="1"] .df-input :deep(select) {
            background-color: #e9ecef !important;
            border-color: #ced4da !important;
            color: #495057 !important;
        }

        [data-readonly="1"] .df-input :deep(.btn:not(.btn-link)) {
            background-color: #e9ecef !important;
            border-color: #ced4da !important;
            color: #495057 !important;
            opacity: 1;
            cursor: default;
        }

    :deep(.form-control[readonly]),
    :deep(input[readonly]),
    :deep(textarea[readonly]),
    :deep(select[readonly]) {
        background-color: #e9ecef !important;
        border-color: #ced4da !important;
        color: #495057 !important;
        cursor: default;
    }

    :deep(.form-control[readonly]),
    :deep(input[readonly]),
    :deep(textarea[readonly]),
    :deep(select[readonly]) {
        pointer-events: none;
    }

    :deep(.datebox-wrapper input[readonly]) {
        background-color: #ffffff !important;
        pointer-events: auto !important;
    }

    .df-error-timely {
        background-color: #f8d7da;
        color: #842029;
        padding: 5px;
        margin: 5px 0 0;
        border-radius: 4px;
        font-size: 0.875rem;
    }

    .df-input > .form-control {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box;
    }

    .df-input :deep(.input-group) {
        display: flex;
        flex-wrap: nowrap;
        width: 100%;
    }

    .df-input :deep(.input-group .form-control) {
        flex: 1 1 auto;
        width: 1%;
        min-width: 0;
        box-sizing: border-box;
    }

    .df-input :deep(.input-group .btn) {
        flex: 0 0 auto;
        white-space: nowrap;
    }

    .df-input :deep(.has-addon > .form-control),
    .df-input :deep(.form-select),
    .df-input :deep(input),
    .df-input :deep(select),
    .df-input :deep(textarea),
    .df-input :deep(fileupload) {
        flex: 1 1 auto;
        width: auto !important;
        max-width: none !important;
        box-sizing: border-box;
    }

    .df-full {
        width: 99vw !important;
        max-width: 99vw !important;
        height: calc(100vh - 20px);
        max-height: calc(100vh - 20px);
        display: flex;
        flex-direction: column;
    }

        .df-full .card-body {
            flex: 1 1 auto;
            overflow-y: auto;
        }

        /* setColumnStyle 套用背景時，讓內層 input 透明 */
        .df-col-styled {
            border-radius: .375rem;
            padding-top: .25rem;
            padding-bottom: .25rem;
        }
        .df-col-styled :deep(.form-control),
        .df-col-styled :deep(.form-select) {
            background-color: transparent;
        }
</style>