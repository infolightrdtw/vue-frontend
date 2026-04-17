<template>
    <Teleport to="body">
        <div class="modal fade" id="modalFavor" tabindex="-1" ref="modalRef" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header text-white py-2"
                         :style="{ backgroundColor: activeColor }">
                        <h5 class="modal-title fs-6">我的最愛</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="row" style="height: 300px;">
                            
                            <div class="col-5 h-100 d-flex flex-column">
                                <div class="fw-bold mb-1 text-center bg-light border py-1">選單列表</div>
                                <div class="border flex-grow-1 overflow-auto custom-scroll-box">
                                    <table class="table table-hover table-sm mb-0 table-striped">
                                        <tbody>
                                            <tr v-for="item in sourceList" :key="item.id" 
                                                @click="selectSource(item)"
                                                :class="{ 'table-active': sourceSelected?.id === item.id }"
                                                style="cursor: pointer;">
                                                <td>{{ item.text }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                           <div class="col-2 h-100 d-flex flex-column justify-content-center align-items-center gap-2">    
                                <button type="button" class="btn text-white" 
                                        :style="{ backgroundColor: activeColor, borderColor: activeColor }"
                                        @click="addToFavor" :disabled="!sourceSelected">
                                    <i class="bi bi-chevron-right"></i>
                                </button>

                                <button type="button" class="btn text-white" 
                                        :style="{ backgroundColor: activeColor, borderColor: activeColor }"
                                        @click="removeFromFavor" :disabled="!targetSelected">
                                    <i class="bi bi-chevron-left"></i>
                                </button>                                
                            </div>

                            <div class="col-5 h-100 d-flex flex-column">
                                <select class="form-select form-select-sm mb-2" v-model="currentGroup" @change="handleGroupChange">
                                    <option value="<--root-->">-- 所有群組 --</option>
                                    <option v-for="group in groupList" :key="group" :value="group">
                                        {{ group }}
                                    </option>
                                </select>
                                
                                <div class="border flex-grow-1 overflow-auto custom-scroll-box">
                                    <table class="table table-hover table-sm mb-0 table-striped">
                                        <thead>
                                            <tr><th class="py-1 ps-2 bg-light sticky-top">選單名稱</th></tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in displayTargetList" :key="item.MENUID" 
                                                @click="selectTarget(item)"
                                                :class="{ 'table-active': targetSelected?.MENUID === item.MENUID }"
                                                style="cursor: pointer;">
                                                <td>{{ item.CAPTION }}</td>
                                            </tr>
                                            <tr v-if="displayTargetList.length === 0">
                                                <td class="text-muted text-center small">無資料</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="modal-footer py-1">
                        <button type="button" class="btn text-white btn-sm" 
                                :style="{ backgroundColor: activeColor, borderColor: activeColor }"
                                @click="save">儲存</button>
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">取消</button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue' 
import dataUtils from '@/utils/dataApi'; 
import { Modal } from 'bootstrap'

const props = defineProps({
    menus: { type: Array, default: () => [] },
    theme: { type: String, default: 'default' }
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

const apiUrl = '/api/ApiMain/data'; 

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: Modal | null = null

const sourceList = ref<any[]>([])     
const groupList = ref<string[]>([])   
const allFavorList = ref<any[]>([])   
const currentGroup = ref('<--root-->') 

const sourceSelected = ref<any>(null) 
const targetSelected = ref<any>(null) 

const insertedList = ref<any[]>([])
const deletedList = ref<any[]>([])

const open = async () => {
    sourceSelected.value = null
    targetSelected.value = null
    insertedList.value = []
    deletedList.value = []
    currentGroup.value = '<--root-->'
    
    if (modalRef.value) {
        modalInstance = new Modal(modalRef.value)
        modalInstance.show()
    }

    await Promise.all([loadMenus(), loadFavors()])
}

const loadMenus = async () => {
    const data = JSON.parse(JSON.stringify(props.menus)); 
    
    const flatSource: any[] = []
    const groups: string[] = []

    const processNode = (node: any) => {
        const children = node.children || node.items;
        if (!node.text && node.caption) node.text = node.caption;

        if (children && children.length > 0) {
            if (node.text && node.id !== 'FROOT') groups.push(node.text);
            children.forEach((child: any) => processNode(child));
        } else {
            if (node.id && String(node.id).startsWith('FGROUP_')) return;
            flatSource.push(node);
        }
    }

    if (Array.isArray(data)) {
        data.forEach(node => {
            if (node.id === 'FROOT') return;
            processNode(node)
        })
    }

    sourceList.value = flatSource
    groupList.value = groups
}

const loadFavors = async () => {
    try {
        const { loadData: apiLoadData } = dataUtils('');

        const r = await apiLoadData({ mode: 'getMenusFavor' });
        
        const data = r && (r.rows || r.items || r.data || r);
        allFavorList.value = Array.isArray(data) ? data : [];
        
    } catch (e) {
        console.error('Load Favors Error', e);
    }
}

const displayTargetList = computed(() => {
    let list = allFavorList.value.filter(item => {
        if (currentGroup.value === '<--root-->') return true; 
        return item.GROUPNAME === currentGroup.value;
    });

    list = list.filter(item => {
        return !deletedList.value.some(d => d.MENUID == item.MENUID)
    })

    const newItems = insertedList.value.filter(item => {
        if (currentGroup.value === '<--root-->') return true;
        return item.GROUPNAME === currentGroup.value
    })

    return [...list, ...newItems]
})

const selectSource = (item: any) => {
    sourceSelected.value = item
}

const selectTarget = (item: any) => {
    targetSelected.value = item
}

const handleGroupChange = () => {
    targetSelected.value = null 
}

const addToFavor = () => {
    if (!sourceSelected.value) return;
    
    const id = sourceSelected.value.id;
    const caption = sourceSelected.value.text;
    const groupName = currentGroup.value;

    const exists = displayTargetList.value.some(item => item.MENUID == id);
    if (exists) {
        alert('該項目已在清單中');
        return;
    }

    const deletedIndex = deletedList.value.findIndex(d => d.MENUID == id);
    if (deletedIndex > -1) {
        deletedList.value.splice(deletedIndex, 1);
    } else {
        insertedList.value.push({
            MENUID: id,
            CAPTION: caption,
            GROUPNAME: groupName === '<--root-->' ? '' : groupName 
        });
    }
}

const removeFromFavor = () => {
    if (!targetSelected.value) return;

    const id = targetSelected.value.MENUID;

    const insertedIndex = insertedList.value.findIndex(i => i.MENUID == id);
    if (insertedIndex > -1) {
        insertedList.value.splice(insertedIndex, 1);
    } else {
        deletedList.value.push({
            MENUID: id
        });
    }

    targetSelected.value = null; 
}

const save = async () => {
    if (insertedList.value.length === 0 && deletedList.value.length === 0) {
        modalInstance?.hide();
        return;
    }

    try {
        const { loadData: apiLoadData } = dataUtils('');
        await apiLoadData({
            mode: 'saveMenusFavor',
            inserted: insertedList.value,
            deleted: deletedList.value
        });

        modalInstance?.hide();
        window.location.reload(); 

    } catch (error: any) {
        console.error('Save Error', error);
        if (error.response && error.response.data) {
            const msg = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
            if (msg.indexOf("duplicate") == 0) {
                try {
                    const errid = msg.split(',')[0].split(':')[1];
                    const item = insertedList.value.find(c => c.MENUID == errid);
                    const caption = item ? item.CAPTION : errid;
                    alert(`項目重複: ${caption}`);
                } catch { alert(msg); }
            } else { alert(msg); }
        } else { alert('儲存失敗'); }
    }
}

defineExpose({ open })
</script>

<style scoped>
.custom-scroll-box {
    box-shadow: inset 2px -2px 2px #4444445c, inset -2px 2px 2px #4444445c;
    background-color: white;
}
thead th {
    font-weight: bold;
    border-bottom: 2px solid #dee2e6;
}
</style>