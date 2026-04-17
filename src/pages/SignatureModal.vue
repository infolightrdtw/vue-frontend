<template>
    <div class="modal fade" id="modalSignature" tabindex="-1" ref="modalRef" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header text-white border-0 py-2" 
                     :style="{ backgroundColor: activeColor }">
                    <h5 class="modal-title fs-6 fw-bold">{{ getMessage('signature')}}</h5>
                    <button type="button" class="btn-close btn-close-white" @click="closeModal" aria-label="Close"></button>
                </div>
                
                <div class="modal-body p-3">
                    <div class="signature-container bg-light d-flex justify-content-center align-items-center border rounded position-relative" 
                         :style="{ 
                             minHeight: '180px', 
                             backgroundColor: '#f2f2f2 !important',
                             borderColor: activeColor + ' !important',
                             borderWidth: '1px',
                             borderStyle: 'solid'
                         }">
                        
                        <input type="file" ref="fileInputRef" accept="image/*" class="d-none" @change="handleFileUpload" />

                        <div v-if="mode === 'view'" class="w-100 h-100 d-flex justify-content-center align-items-center">
                            <img v-if="apiImgSrc" :src="apiImgSrc" class="img-fluid" style="max-height: 160px;" />
                            <span v-else class="text-muted small"></span>
                        </div>

                        <div v-if="mode === 'edit'" class="w-100 h-100">
                            <Signature 
                                v-model="signatureData" 
                                :height="178" 
                                :background="'#f2f2f2'"
                                :canReplay="false"
                            />
                        </div>
                        
                        <div v-if="isLoading" class="position-absolute w-100 h-100 top-0 start-0 d-flex justify-content-center align-items-center" 
                             style="background: rgba(255,255,255,0.8); z-index: 10;">
                            <div class="spinner-border" :style="{ color: activeColor }" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer border-0 pt-0 pb-3">
                    <div class="d-flex gap-2">
                        <button v-if="showActionButtons" type="button" class="btn text-white custom-btn" 
                                :style="{ backgroundColor: activeColor, borderColor: activeColor }"
                                @click="switchToEdit">
                            {{ getMessage('edit')}}
                        </button>

                        <button v-if="showActionButtons" type="button" class="btn text-white custom-btn" 
                                :style="{ backgroundColor: activeColor, borderColor: activeColor }"
                                @click="triggerFileUpload">
                            {{ getMessage('upload')}}
                        </button>

                        <button type="button" class="btn text-white custom-btn" 
                                :style="{ backgroundColor: activeColor, borderColor: activeColor }"
                                @click="saveSignature">
                            {{ getMessage('ok')}}
                        </button>

                        <button type="button" class="btn btn-light border custom-btn" @click="closeModal">
                            {{ getMessage('cancel')}}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <BAlert ref="$__alert" :root="$this" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue' 
import axios from 'axios'
import { Modal } from 'bootstrap' 
import Signature from '@/components/editors/Signature.vue'
import pageUtils from '@/utils/pageApi' 
import BAlert from '@/components/elements/BAlert.vue'

const __functions = {}
const __controls = {}
const $this = pageUtils(__functions, __controls)
const { getMessage } = $this

const props = defineProps({
    theme: {
        type: String,
        default: 'default'
    }
})

const emit = defineEmits(['close'])
const signatureApiUrl = '/api/ApiMain/signature'

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

const modalRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null) 
const mode = ref<'view' | 'edit'>('view') 
const apiImgSrc = ref('')     
const signatureData = ref('') 
const isLoading = ref(false)
const showActionButtons = ref(true) 
const $__alert = ref<InstanceType<typeof BAlert> | null>(null) 

let modalInstance: Modal | null = null

const open = async () => {
    mode.value = 'view'
    signatureData.value = ''
    apiImgSrc.value = ''
    showActionButtons.value = true 
    
    if (modalRef.value) {
        modalInstance = new Modal(modalRef.value)
        modalInstance.show()
    }
    await loadSignature()
}

const loadSignature = async () => {
    isLoading.value = true
    try {
        const res = await axios.post(signatureApiUrl, {
            mode: 'download'
        })
        if (res.data) {
            apiImgSrc.value = `data:image/png;base64,${res.data}`
        } else {
            apiImgSrc.value = ''
        }
    } catch (error) {
        console.error('Load signature error:', error)
        apiImgSrc.value = ''
    } finally {
        isLoading.value = false
    }
}

const closeModal = () => {
    if (modalInstance) {
        modalInstance.hide()
    }
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    emit('close')
}

const switchToEdit = () => {
    mode.value = 'edit'
    signatureData.value = ''
    showActionButtons.value = false 
}

const triggerFileUpload = () => {
    if (fileInputRef.value) {
        fileInputRef.value.click()
    }
}

const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        const reader = new FileReader()
        reader.onload = (e) => {
            if (e.target?.result) {
                const base64Result = e.target.result as string
                signatureData.value = base64Result
                apiImgSrc.value = base64Result 
                mode.value = 'view' 
                showActionButtons.value = false 
            }
        }
        reader.readAsDataURL(input.files[0])
    }
    if (input) input.value = ''
}

const saveSignature = async () => {
    if (mode.value === 'view' && !signatureData.value) {
        closeModal()
        return
    }

    if (!signatureData.value) {
        const msg = getMessage('validateNull') || '請先簽名或選擇圖片'
        if ($__alert.value) {
            await $__alert.value.alert(msg, 'warning')
        } else {
            alert(msg)
        }
        return
    }

    const parts = signatureData.value.split(',')
    if (parts.length === 2) {
        const rawBase64 = parts[1]
        
        isLoading.value = true
        try {
            await axios.post(signatureApiUrl, { 
                value: rawBase64
            })
            closeModal()
        } catch (error) {
            console.error('Save signature error:', error)
            const errorMsg = getMessage('error') || '儲存失敗'
            if ($__alert.value) {
                await $__alert.value.alert(errorMsg, 'danger')
            } else {
                alert(errorMsg)
            }
        } finally {
            isLoading.value = false
        }
    }
}

defineExpose({ open })
</script>

<style scoped>
.custom-btn {
    min-width: 70px;
    font-size: 14px;
    padding: 6px 12px;
}
.btn-light {
    background-color: #fff;
    border-color: #ccc;
    color: #333;
}
.btn-light:hover {
    background-color: #e6e6e6;
    border-color: #adadad;
}
.d-none {
    display: none !important;
}
:deep(.signature-wrapper .mt-2) {
    text-align: right; 
    margin-top: 5px !important;
}
:deep(.signature-wrapper canvas) {
    border-radius: 4px;
    border: none !important; 
}
</style>