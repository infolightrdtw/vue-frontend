<template>
    <div class="container-fluid p-3">
        <div class="row">
            <div class="col-12">
                <div class="card mb-3">
                    <div class="card-header text-white d-flex justify-content-between align-items-center"
                         :style="{ backgroundColor: activeColor }">
                        <h5 class="mb-0">{{ lm.agent }}{{ lm.setting }}</h5>
                        <button class="btn btn-link text-white p-0" type="button" data-bs-toggle="collapse" data-bs-target="#agentSettingPanel">
                            <i class="bi bi-chevron-down"></i>
                        </button>
                    </div>
                    
                    <div id="agentSettingPanel" class="collapse show">
                        <div class="card-body bg-light">
                            <form class="form-horizontal">
                                <div class="row mb-3 align-items-center">
                                    <label class="col-sm-2 col-form-label text-end fw-bold">{{ lm.agent }}{{ lm.type }}</label>
                                    <div class="col-sm-4">
                                        <div class="btn-group" role="group">
                                            <input type="radio" class="btn-check" id="typeUser" 
                                                :value="false" v-model="isRoleMode" @change="handleAgentTypeChange">
                                            <label class="btn" for="typeUser"
                                                   :style="!isRoleMode ? 
                                                       { backgroundColor: activeColor, color: 'white', borderColor: activeColor } : 
                                                       { color: activeColor, borderColor: activeColor }">
                                                {{ lm.user }}
                                            </label>

                                            <input type="radio" class="btn-check" id="typeRole" 
                                                :value="true" v-model="isRoleMode" @change="handleAgentTypeChange">
                                            <label class="btn" for="typeRole"
                                                   :style="isRoleMode ? 
                                                       { backgroundColor: activeColor, color: 'white', borderColor: activeColor } : 
                                                       { color: activeColor, borderColor: activeColor }">
                                                {{ lm.role }}
                                            </label>
                                        </div>
                                    </div>

                                    <label class="col-sm-2 col-form-label text-end fw-bold">{{ lm.parallel }}{{ lm.agent }}</label>
                                    <div class="col-sm-4 d-flex align-items-center">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="parAgentSwitch" 
                                                   v-model="form.PAR_AGENT" true-value="Y" false-value="N">
                                            <label class="form-check-label" for="parAgentSwitch">
                                                {{ form.PAR_AGENT === 'Y' ? lm.yes : lm.no }}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row mb-3 align-items-center">
                                    <label class="col-sm-2 col-form-label text-end fw-bold">{{ lm.user }}{{ lm.id }}</label>
                                    <div class="col-sm-4">
                                        <input type="text" class="form-control" v-model="form.USERID" readonly disabled>
                                    </div>

                                    <template v-if="isRoleMode">
                                        <label class="col-sm-2 col-form-label text-end fw-bold text-danger">{{ lm.user }}{{ lm.role }}</label>
                                        <div class="col-sm-4">
                                            <div class="input-group">
                                                <input type="text" class="form-control" v-model="form.USERROLE" :placeholder="lm.pleaseSelect + lm.role" readonly>
                                                <button class="btn text-white" type="button" @click="openSelectModal('role')"
                                                        :style="{ backgroundColor: activeColor, borderColor: activeColor }">
                                                    <i class="bi bi-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </template>
                                </div>

                                <div class="row mb-3 align-items-center">
                                    <label class="col-sm-2 col-form-label text-end fw-bold text-danger">{{ lm.agent }}{{ lm.user }}</label>
                                    <div class="col-sm-4">
                                        <div class="input-group">
                                            <input type="text" class="form-control" v-model="form.AGENTID" :placeholder="lm.pleaseSelect + lm.agent" readonly>
                                            <button class="btn text-white" type="button" @click="openSelectModal('user')"
                                                    :style="{ backgroundColor: activeColor, borderColor: activeColor }">
                                                <i class="bi bi-search"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <label class="col-sm-2 col-form-label text-end fw-bold text-danger">{{ lm.flow }}</label>
                                    <div class="col-sm-4">
                                        <select class="form-select" v-model="form.FLOW_DESC">
                                            <option value="*">* ({{ lm.all }}{{ lm.flow }})</option>
                                            <option v-for="flow in flowList" :key="flow.value" :value="flow.value">
                                                {{ flow.text }}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div class="row mb-3 align-items-center">
                                    <label class="col-sm-2 col-form-label text-end fw-bold">{{ lm.date }}{{ lm.greater }}</label>
                                    <div class="col-sm-4 d-flex gap-2">
                                        <input type="date" class="form-control" v-model="form.DATE_START">
                                        <input type="time" class="form-control" v-model="form.TIME_START" step="1">
                                    </div>

                                    <label class="col-sm-2 col-form-label text-end fw-bold">{{ lm.date }}{{ lm.less }}</label>
                                    <div class="col-sm-4 d-flex gap-2">
                                        <input type="date" class="form-control" v-model="form.DATE_END">
                                        <input type="time" class="form-control" v-model="form.TIME_END" step="1">
                                    </div>
                                </div>

                                <div class="d-flex justify-content-end border-top pt-3">
                                    <button type="button" class="btn text-white px-4" @click="submitAgent"
                                            :style="{ backgroundColor: activeColor, borderColor: activeColor }">
                                        <i class="bi bi-save me-1"></i> {{ lm.save }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <ul class="nav nav-tabs" id="agentTabs" role="tablist">
                    <li class="nav-item">
                        <button class="nav-link active" id="user-tab" data-bs-toggle="tab" data-bs-target="#user-pane" type="button"
                                :style="{ color: activeColor }">
                            {{ lm.user }}{{ lm.agent }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="role-tab" data-bs-toggle="tab" data-bs-target="#role-pane" type="button"
                                :style="{ color: 'inherit' }">
                            {{ lm.role }}{{ lm.agent }}
                        </button>
                    </li>
                </ul>

                <div class="tab-content border border-top-0 p-3 bg-white">
                    <div class="tab-pane fade show active" id="user-pane">
                        <div class="table-responsive">
                            <table class="table table-bordered table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>{{ lm.agent }}</th>
                                        <th>{{ lm.start }}{{ lm.date }}</th>
                                        <th>{{ lm.start }}{{ lm.time }}</th>
                                        <th>{{ lm.end }}{{ lm.date }}</th>
                                        <th>{{ lm.end }}{{ lm.time }}</th>
                                        <th>{{ lm.parallel }}{{ lm.agent }}</th>
                                        <th>{{ lm.flow }}</th>
                                        <th>{{ lm.tools }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(row, index) in userAgentList" :key="index">
                                        <td>{{ row.AGENT }}</td>
                                        <td>{{ row.START_DATE }}</td>
                                        <td>{{ row.START_TIME }}</td>
                                        <td>{{ row.END_DATE }}</td>
                                        <td>{{ row.END_TIME }}</td>
                                        <td>{{ row.PAR_AGENT }}</td>
                                        <td>{{ row.FLOW_DESC }}</td>
                                        <td><button class="btn btn-sm btn-danger" @click="deleteRow('userAgent', row)">{{ lm.remove }}</button></td>
                                    </tr>
                                    <tr v-if="userAgentList.length === 0"><td colspan="8" class="text-center text-muted">{{ (lm.dataNotFound || '').replace(':{0}', '') }}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="role-pane">
                        <div class="table-responsive">
                            <table class="table table-bordered table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>{{ lm.role }}{{ lm.name }}</th>
                                        <th>{{ lm.agent }}</th>
                                        <th>{{ lm.start }}{{ lm.date }}</th>
                                        <th>{{ lm.start }}{{ lm.time }}</th>
                                        <th>{{ lm.end }}{{ lm.date }}</th>
                                        <th>{{ lm.end }}{{ lm.time }}</th>
                                        <th>{{ lm.parallel }}{{ lm.agent }}</th>
                                        <th>{{ lm.flow }}</th>
                                        <th>{{ lm.tools }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(row, index) in roleAgentList" :key="index">
                                        <td>{{ row.ROLE_ID }}</td>
                                        <td>{{ row.AGENT }}</td>
                                        <td>{{ row.START_DATE }}</td>
                                        <td>{{ row.START_TIME }}</td>
                                        <td>{{ row.END_DATE }}</td>
                                        <td>{{ row.END_TIME }}</td>
                                        <td>{{ row.PAR_AGENT }}</td>
                                        <td>{{ row.FLOW_DESC }}</td>
                                        <td><button class="btn btn-sm btn-danger" @click="deleteRow('roleAgent', row)">{{ lm.remove }}</button></td>
                                    </tr>
                                    <tr v-if="roleAgentList.length === 0"><td colspan="9" class="text-center text-muted">{{ (lm.dataNotFound || '').replace(':{0}', '') }}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Teleport to="body">
        <div class="modal fade" id="commonSelectModal" tabindex="-1" ref="commonSelectModalRef" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header text-white py-2"
                         :style="{ backgroundColor: activeColor }">
                        <h5 class="modal-title fs-6">
                            {{ modalMode === 'user' ? (lm.select + lm.agent + lm.user) : (lm.select + lm.user + lm.role) }}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" v-model="searchText" 
                                   :placeholder="modalMode === 'user' ? (lm.input + ' ID ' + lm.or + lm.name + lm.search) : (lm.input + lm.role + ' ID ' + lm.or + lm.name + lm.search)" 
                                   @keyup.enter="performSearch">
                            <button class="btn btn-outline-secondary" type="button" @click="performSearch">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                            <table class="table table-bordered table-hover sticky-header mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>{{ modalMode === 'user' ? 'USERID' : 'GROUPID' }}</th>
                                        <th>{{ modalMode === 'user' ? 'USERNAME' : 'GROUPNAME' }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in selectList" :key="item.ID" 
                                        @click="selectItem(item)" 
                                        style="cursor: pointer;">
                                        <td>{{ item.ID }}</td>
                                        <td>{{ item.NAME }}</td>
                                    </tr>
                                    <tr v-if="selectList.length === 0">
                                        <td colspan="2" class="text-center text-muted">
                                            {{ isLoadingList ? lm.loading : (lm.dataNotFound || '').replace(':{0}', '') }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer py-1">
                        <small class="text-muted me-auto">{{ lm.total }} {{ selectList.length }} {{ lm.item }}</small>
                        <button type="button" class="btn btn-sm btn-light border" data-bs-dismiss="modal">{{ lm.cancel }}</button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
    
    <BAlert ref="$__alert" :root="$this" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue' 
import axios from 'axios'
import { Modal } from 'bootstrap'
import BAlert from '@/components/elements/BAlert.vue'
import pageUtils from '@/utils/pageApi' 

const __functions = {}
const __controls = {}
const $this = pageUtils(__functions, __controls)

// 提取多國語言庫
const lm = computed(() => $this.localeMessages?.value || {})

const $__alert = ref<InstanceType<typeof BAlert> | null>(null)

const props = defineProps({
    theme: {
        type: String,
        default: 'default'
    }
})

const themeColors: Record<string, string> = {
    'default': '#002b93',
    'black': '#333333',
    'violet': '#6f42c1',
    'blue': '#0d6efd',
    'yellow': '#ffc107'
};

const activeColor = computed(() => {
    return themeColors[props.theme] || themeColors['default'];
})

const clientInfoStr = sessionStorage.getItem('clientInfo')
const clientInfo = clientInfoStr ? JSON.parse(clientInfoStr) : { userID: 'guest', userName: 'Guest' }

const isRoleMode = ref(false)
const form = reactive({
    USERID: clientInfo.userID || clientInfo.user,
    USERROLE: '',
    AGENTID: '',
    FLOW_DESC: '*',
    PAR_AGENT: 'N',
    DATE_START: '',
    TIME_START: '',
    DATE_END: '',
    TIME_END: ''
})

const flowList = ref<any[]>([])
const userAgentList = ref<any[]>([])
const roleAgentList = ref<any[]>([])

const commonSelectModalRef = ref<HTMLElement | null>(null)
let modalInstance: Modal | null = null
const modalMode = ref<'user' | 'role'>('user')
const searchText = ref('')
const selectList = ref<any[]>([])
const isLoadingList = ref(false)

const showAlert = async (msg: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    if ($__alert.value && typeof $__alert.value.alert === 'function') {
        await $__alert.value.alert(msg, type);
    } else {
        alert(msg);
    }
}

onMounted(async () => {
    const today = new Date()
    form.DATE_START = formatDate(today)
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const lastDay = new Date(nextMonth.getTime() - 1000)
    form.DATE_END = formatDate(lastDay)

    await loadFlows()
    await loadUserAgents()
    await loadRoleAgents()
})

function formatDate(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

async function loadFlows() {
    try {
        const res = await axios.post('/api/ApiMain/flow', { mode: 'getFlows' })
        if (Array.isArray(res.data)) {
            flowList.value = res.data.map((d: any) => ({ value: d.value, text: d.value }))
        }
    } catch (e) { console.error(e) }
}

async function loadUserAgents() {
    try {
        const res = await axios.post('/api/ApiMain/data', {
            mode: 'getDataset',
            module: 'SystemTable',
            command: 'userAgent'
        })
        if (res.data && res.data.rows) userAgentList.value = res.data.rows
    } catch (e) { console.error(e) }
}

async function loadRoleAgents() {
    try {
        const res = await axios.post('/api/ApiMain/data', {
            mode: 'getDataset',
            module: 'SystemTable',
            command: 'roleAgent'
        })
        if (res.data && res.data.rows) roleAgentList.value = res.data.rows
    } catch (e) { console.error(e) }
}

function handleAgentTypeChange() {
    if (!isRoleMode.value) form.USERROLE = ''
}

function openSelectModal(mode: 'user' | 'role') {
    modalMode.value = mode
    searchText.value = ''
    selectList.value = []
    
    if (commonSelectModalRef.value) {
        if (!modalInstance) {
            modalInstance = new Modal(commonSelectModalRef.value)
        }
        modalInstance.show()
        performSearch()
    }
}

async function performSearch() {
    isLoadingList.value = true
    selectList.value = []
    
    try {
        let command = ''
        let whereStr = ''
        const txt = searchText.value

        if (modalMode.value === 'user') {
            command = 'user'
            if (txt) whereStr = `USERID like '%${txt}%' OR USERNAME like '%${txt}%'`
        } else {
            command = 'currentGroup'
            if (txt) whereStr = `GROUPID like '%${txt}%' OR GROUPNAME like '%${txt}%'`
        }

        const res = await axios.post('/api/ApiMain/data', {
            mode: 'getDataset',
            module: 'SystemTable',
            command: command,
            whereStr: whereStr,
            rows: 50
        })
        
        if (res.data && res.data.rows) {
            selectList.value = res.data.rows.map((r: any) => {
                if (modalMode.value === 'user') {
                    return { ID: r.USERID, NAME: r.USERNAME, raw: r }
                } else {
                    return { ID: r.GROUPID, NAME: r.GROUPNAME, raw: r }
                }
            })
        }
    } catch (e) {
        console.error('Search error', e)
    } finally {
        isLoadingList.value = false
    }
}

function selectItem(item: any) {
    if (modalMode.value === 'user') {
        form.AGENTID = item.ID
    } else {
        form.USERROLE = item.ID
    }
    modalInstance?.hide()
}

async function submitAgent() {
    const t = lm.value; 

    if (!form.AGENTID) { 
        await showAlert(t.pleaseSelect + t.agent, 'warning'); 
        return; 
    }
    if (isRoleMode.value && !form.USERROLE) { 
        await showAlert(t.pleaseSelect + t.role, 'warning'); 
        return; 
    }
    if (!form.DATE_START || !form.DATE_END) { 
        await showAlert(t.date + t.cannot + t.empty, 'warning'); 
        return; 
    }
    
    const start = (form.DATE_START + form.TIME_START).replace(/[-:]/g, '')
    const end = (form.DATE_END + form.TIME_END).replace(/[-:]/g, '')
    if (start >= end) { 
        const msg = (t.validateLess || '').replace('{0}', (t.end || '') + (t.time || ''));
        await showAlert(msg, 'warning'); 
        return; 
    }

    let datas = []
    let command = ''

    if (isRoleMode.value) {
        command = 'roleAgent'
        datas.push({
            table: 'roleAgent',
            inserted: [{
                ROLE_ID: form.USERROLE,
                AGENT: form.AGENTID,
                START_DATE: form.DATE_START,
                START_TIME: form.TIME_START ? form.TIME_START.replace(/:/g, '') : '000000',
                END_DATE: form.DATE_END,
                END_TIME: form.TIME_END ? form.TIME_END.replace(/:/g, '') : '235959',
                PAR_AGENT: form.PAR_AGENT,
                FLOW_DESC: form.FLOW_DESC
            }], updated: [], deleted: []
        })
    } else {
        command = 'userAgent'
        datas.push({
            table: 'userAgent',
            inserted: [{
                USER_ID: form.USERID,
                AGENT: form.AGENTID,
                START_DATE: form.DATE_START,
                START_TIME: form.TIME_START ? form.TIME_START.replace(/:/g, '') : '000000',
                END_DATE: form.DATE_END,
                END_TIME: form.TIME_END ? form.TIME_END.replace(/:/g, '') : '235959',
                PAR_AGENT: form.PAR_AGENT,
                FLOW_DESC: form.FLOW_DESC,
                REMARK: ''
            }], updated: [], deleted: []
        })
    }

    try {
        await axios.post('/api/ApiMain/data', {
            type: 'security',
            mode: 'updateDataset',
            module: 'SystemTable',
            command: command,
            datas: JSON.stringify(datas)
        })
        
        await showAlert(t.save + t.success, 'success');
        
        if (isRoleMode.value) loadRoleAgents(); else loadUserAgents();
    } catch (e) {
        await showAlert(e.response.data.error || (t.save + t.error), 'error');
    }
}

async function deleteRow(tableType: 'userAgent' | 'roleAgent', row: any) {
    const t = lm.value; 

    let isConfirmed = false;
    if ($__alert.value && typeof $__alert.value.confirmMessage === 'function') {
        isConfirmed = await $__alert.value.confirmMessage(t.confirm + t.remove + '?');
    } else if ($__alert.value && typeof $__alert.value.confirm === 'function') {
        isConfirmed = await $__alert.value.confirm(t.confirm + t.remove + '?');
    } else {
        isConfirmed = window.confirm(t.confirm + t.remove + '?');
    }
    
    if (!isConfirmed) return

    const datas = [{
        table: tableType, inserted: [], updated: [], deleted: [row]
    }]
    
    try {
        await axios.post('/api/ApiMain/data', {
            type: 'security',
            mode: 'updateDataset',
            module: 'SystemTable',
            command: tableType,
            datas: JSON.stringify(datas)
        })
        
        //await showAlert(t.remove + t.success, 'success');
        
        if (tableType === 'roleAgent') loadRoleAgents(); else loadUserAgents();
    } catch (e) {
        await showAlert(t.remove + t.error, 'error');
    }
}
</script>

<style scoped>
.sticky-header th {
    position: sticky;
    top: 0;
    background-color: #f8f9fa;
    z-index: 1;
}
</style>