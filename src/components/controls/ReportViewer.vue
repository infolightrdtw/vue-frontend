<template>
    <div 
        v-show="isVisible" 
        :id="id" 
        class="bootstrap-reportviewer d-flex flex-column" 
        :style="viewerStyle"
    >
        <div v-if="queryColumns && queryColumns.length > 0" class="report-query-area card mb-2">
            <div class="card-body py-2">
                <BHtmlForm 
                    :row="queryValues" 
                    :columns="queryColumns" 
                    :horizontalColumnsCount="2"
                ></BHtmlForm>
                <div class="mt-2 text-end">
                    <button class="btn btn-primary btn-sm" @click="onQueryClick">
                        <i class="bi bi-search"></i> 查詢
                    </button>
                </div>
            </div>
        </div>

        <div 
            class="report-container flex-grow-1 position-relative" 
            :style="reportStyle" 
        >
            <div v-if="isLoading" class="position-absolute top-50 start-50 translate-middle">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">載入中...</span>
                </div>
            </div>

            <iframe 
                v-if="iframeSrc" 
                :src="iframeSrc" 
                style="width: 100%; height: 100%; border: none;"
            ></iframe>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import dataUtils from '@/utils/dataApi'; 

const props = defineProps({
    id: String,
    root: Object,
    remoteName: { type: String, required: true },
    reportName: { type: String, required: true },
    
    queryColumns: { type: Array, default: () => [] },
    parameters: { type: Array, default: () => [] },
    datasources: { type: Array, default: () => [] },
    
    visible: { type: Boolean, default: false },
    preload: { type: Boolean, default: false },
    
    width: [Number, String],
    height: { type: Number, default: 300 },
    fit: { type: Boolean, default: true },
    
    onQuery: String
});

const $ = props.root;

const isVisible = ref(props.visible);
const isLoading = ref(false);
const iframeSrc = ref('');
const queryValues = ref({});
const queryParams = reactive({
    whereItems: null as any,
    whereStr: null as string | null
});


const viewerStyle = computed(() => {
    let style: any = {};
    if (props.width) {
        style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    }
    return style;
});

const reportStyle = computed(() => {
    let style: any = {};
    if (props.fit) {
        style.height = 'calc(100vh - 160px)'; 
    } else if (props.height) {
        style.height = `${props.height}px`;
    }
    return style;
});


onMounted(() => {
    if ($ && $.getEncryptParameter) {
        const reportID = $.getEncryptParameter('REPORT_ID');
        if (reportID && reportID.split(',').includes(props.id)) {
            isVisible.value = true;
        }
    }

    if (isVisible.value && props.preload) {
        load();
    }
});


function onQueryClick() {
    load();
}


async function load() {
    if (!props.reportName || !props.remoteName) return;

    isLoading.value = true;
    iframeSrc.value = '';

    try {
        const table: any = {
            id: 'Master',
            remoteName: props.remoteName,
            sort: '', 
            order: ''
        };

        if (queryParams.whereStr) table.whereStr = queryParams.whereStr;
        if (queryParams.whereItems) table.whereItems = queryParams.whereItems;

        if (props.queryColumns && props.queryColumns.length > 0) {
            const dynamicWhere: any[] = [];
            props.queryColumns.forEach((qc: any) => {
                const val = (queryValues.value as any)[qc.field];
                if (val !== undefined && val !== null && val !== '') {
                    dynamicWhere.push({
                        field: qc.field,
                        operator: qc.operator || '=',
                        value: val
                    });
                }
            });

            if (dynamicWhere.length > 0) {
                if (table.whereItems) {
                    const existingItems = typeof table.whereItems === 'string' ? JSON.parse(table.whereItems) : table.whereItems;
                    table.whereItems = JSON.stringify(existingItems.concat(dynamicWhere));
                } else {
                    table.whereItems = JSON.stringify(dynamicWhere);
                }
            }
        }

        if (props.onQuery && $) {
            const hookResult = $.invoke(props.onQuery, queryValues.value, table.whereItems);
            if (hookResult === false) {
                isLoading.value = false;
                return; 
            }
        }

        const param = {
            tables: [table],
            parameters: {} as Record<string, any>
        };

        if (props.parameters) {
            props.parameters.forEach((p: any) => {
                param.parameters[p.parameterName] = p.value;
            });
        }

        if (props.datasources) {
            props.datasources.forEach((ds: any) => {
                param.tables.push({
                    id: ds.datasourceName,
                    remoteName: ds.remoteName
                });
            });
        }

        const { exportFile } = dataUtils(props.remoteName);
        const file = await exportFile('report', props.reportName, param);

        if (file) {
            const baseUrl = (import.meta.env.VITE_APP_API_URL || '').replace(/\/+$/, '');
            const downloadName = props.remoteName.split('.')[1] || 'report';

            iframeSrc.value = `${baseUrl}/file?q=${file}&n=${downloadName}&t=inline`;
        }

    } catch (error) {
        if ($ && $.showError) {
            $.showError(error);
        } else {
            console.error('[ReportViewer] Load Error:', error);
        }
    } finally {
        isLoading.value = false;
    }
}

function setWhere(where: any) {
    if (Array.isArray(where)) {
        queryParams.whereStr = null;
        queryParams.whereItems = JSON.stringify(where);
    } else if (typeof where === 'string') {
        queryParams.whereItems = null;
        queryParams.whereStr = where;
    }
    load(); 
}

defineExpose({
    load,
    setWhere
});
</script>

<style scoped>
.bootstrap-reportviewer {
    background: #fff;
}
.report-container {
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #f8f9fa;
    overflow: hidden;
}
</style>