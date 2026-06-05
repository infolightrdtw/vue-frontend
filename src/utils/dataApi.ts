import axios from 'axios'
import { ref, onMounted } from 'vue'
axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

export default function (rName: string = '') {
    const dataApiUrl = '/api/ApiMain/data';
    const fileApiUrl = '/api/ApiMain/file';
    const messageApiUrl = '/api/ApiMain/message';
    const clientInfoApiUrl = '/api/ApiMain/clientInfo';

    async function loadMessage() {
        const { data: result } = await axios.post(messageApiUrl, {})
        return result
    }

    async function loadClientInfo() {
        const { data: result } = await axios.post(clientInfoApiUrl, {})
        return result
    }

    const remoteName = rName
    let module = ''
    let command = ''
    if (remoteName) {
        const names = remoteName.split('.')
        module = names[0];
        if (names.length > 1) {
            command = names[1]
        }
    }

    async function loadData(loadParam: object) {
        const param = {
            mode: 'getDataset',
            module,
            command
        }
        Object.keys(loadParam).forEach(k => {
            if (typeof (loadParam[k]) == 'object') {
                param[k] = JSON.stringify(loadParam[k])
            }
            else {
                param[k] = loadParam[k]
            }
        })
        const { data: result } = await axios.post(dataApiUrl, param)
        return result
    }

    async function loadDetailData(parentTable: string, parentRow: object, loadParam: object) {
        return await loadData({ parentTable, parentRow, ...loadParam })
    }

    async function updateData(datas: object, duplicateCheck: boolean = false) {
        const param = {
            mode: 'updateDataset',
            module,
            command,
            datas: JSON.stringify(datas),
            duplicateCheck
        }
        const { data: result } = await axios.post(dataApiUrl, param)
        return result
    }

    async function callMethod(method: string, parameters: object) {
        const param = {
            mode: 'callMethod',
            module,
            method,
            parameters: JSON.stringify(parameters)
        }
        const { data: result } = await axios.post(dataApiUrl, param)
        return result
    }

    async function uploadFile(file: File, uploadParam: object) {
        const formData = new FormData();
        formData.append('file', file);
        Object.keys(uploadParam).forEach(k => {
            formData.append(k, uploadParam[k])
        })

        const { data: result } = await axios.post(fileApiUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return result
    }

    async function uploadFiles(files: Array<File>, uploadParam: object) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append(`file${i}`, files[i]);
        }
       
        Object.keys(uploadParam).forEach(k => {
            formData.append(k, uploadParam[k])
        })

        const { data: result } = await axios.post(fileApiUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return result
    }

    async function downloadFile(fileName: string, folder: string) {
        const param = {
            mode: 'download',
            fileName,
            folder
        }
        const { data: result } = await axios.post(fileApiUrl, param)
        return result
    }

    async function removeLock(keys: string, rows: object[]) {
        if (!remoteName || !keys || !Array.isArray(rows) || rows.length === 0) return
        const lockKeys = keys.split(',')
        const lockRows = rows.map((row: any) => {
            const lockRow: Record<string, unknown> = {}
            for (const k of lockKeys) lockRow[k] = row?.[k]
            return lockRow
        })
        const param = {
            mode: 'removeLock',
            module,
            command,
            rows: JSON.stringify(lockRows)
        }
        await axios.post(dataApiUrl, param)
    }

    async function exportFile(type: string, id: string, exportParam: object) {
        const param = {
            mode: 'exportFile',
            type: type,
            id: id,
            param: JSON.stringify(exportParam)
        };

        const { data: result } = await axios.post(fileApiUrl, param, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        });

        return result;
    }

    async function exportDataset(exportParam: object) {
        const param: any = {
            mode: 'exportDataset',
            module,
            command
        }
        Object.keys(exportParam).forEach(k => {
            const v = (exportParam as any)[k]
            if (v === undefined || v === null) return
            param[k] = (typeof v === 'object') ? JSON.stringify(v) : v
        })
        const { data: result } = await axios.post(fileApiUrl, param, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        })
        return result
    }

    return {
        loadMessage,
        loadClientInfo,
        loadData,
        loadDetailData,
        updateData,
        callMethod,
        removeLock,
        uploadFile,
        uploadFiles,
        downloadFile,
        exportFile,
        exportDataset
    }
}