<template>
  <div class="change-password-container d-flex align-items-center justify-content-center">
    <div class="card shadow-sm" style="width: 500px;">
      <div class="card-header border-0 text-center py-4 position-relative overflow-hidden">
        <div class="header-bg"></div>
        <h2 class="position-relative text-white fw-bold mb-0" style="z-index: 2; letter-spacing: 2px;">
          INFOLIGHT
        </h2>
      </div>

      <div class="card-body p-5 bg-white">
        <form @submit.prevent="submitForm">
          <div class="row mb-3 align-items-center">
            <label for="oldPassword" class="col-sm-4 col-form-label text-end">
              {{ (getMessage('old') || '').trim() }}{{ (getMessage('password')).trim() }}：
            </label>
            <div class="col-sm-8">
              <input 
                type="password" 
                class="form-control" 
                id="oldPassword" 
                v-model="form.oldPassword"
              >
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <label for="newPassword" class="col-sm-4 col-form-label text-end">
              {{ (getMessage('password')).trim() }}：
            </label>
            <div class="col-sm-8">
              <input 
                type="password" 
                class="form-control" 
                id="newPassword" 
                v-model="form.newPassword"
                required
              >
            </div>
          </div>

          <div class="row mb-3 align-items-center">
            <label for="confirmPassword" class="col-sm-4 col-form-label text-end">
              {{ (getMessage('confirm') || '').trim() }}{{ (getMessage('password')).trim() }}：
            </label>
            <div class="col-sm-8">
              <input 
                type="password" 
                class="form-control" 
                id="confirmPassword" 
                v-model="form.confirmPassword"
                :class="{'is-invalid': passwordError}"
                required
              >
              <div class="invalid-feedback" v-if="passwordError">
                {{ passwordError }}
              </div>
            </div>
          </div>

          <div class="row mb-3" v-if="apiError">
            <div class="col-sm-8 offset-sm-4 text-danger">
              {{ apiError }}
            </div>
          </div>

          <div class="row mt-4">
            <div class="col-12 text-center">
              <button type="submit" class="btn btn-primary px-5 rounded-pill custom-btn">
                {{ (getMessage('ok')).trim() }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    
    <BAlert ref="$__alert" :root="$this" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import axios from 'axios'
import pageUtils from '@/utils/pageApi' 
import BAlert from '@/components/elements/BAlert.vue'

const accountApiUrl = '/api/ApiMain/account';

const __functions = {}
const __controls = {}
const $this = pageUtils(__functions, __controls)
const { getMessage } = $this

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const apiError = ref('')

const $__alert = ref<InstanceType<typeof BAlert> | null>(null)

const passwordError = computed(() => {
  if (form.confirmPassword && form.newPassword !== form.confirmPassword) {
    return getMessage('passwordNotMatch')
  }
  return ''
})

const submitForm = async () => {
  if (passwordError.value) return;
  apiError.value = '';

  try {
    const clientInfoStr = sessionStorage.getItem('clientInfo') || '{}';

    const param = {
        mode: 'changeP',
        opassword: form.oldPassword,
        password: form.newPassword,
        clientInfo: clientInfoStr
    };

    const { data: result } = await axios.post(accountApiUrl, param);

    if (result && typeof result === 'object') {
        if (result.error) {
            throw new Error(getMessage(result.error));
        }
        if (result.message && 
            result.message !== '成功' && 
            result.message !== 'success' && 
            result.message !== 'Success') {
            
            const translatedMsg = getMessage(result.message);
            throw new Error(translatedMsg);
        }
    }
    
    if (result === false || result === 'false') {
        throw new Error(getMessage('UpdateFailed')); 
    }
    
    form.oldPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';

    const successMsg = (getMessage('password') || '').trim() + (getMessage('modify')).trim() + (getMessage('success')).trim();

    if ($__alert.value) {
        await $__alert.value.alert(successMsg, 'success');
    } else {
        alert(successMsg); 
    }
    
    window.postMessage({ method: 'closeCurrentTab' }, '*');

  } catch (error: any) {
    console.error('error:', error);
    
    let msg = error.message;

    if (error.response?.data) {
        let errorData = error.response.data;
        if (typeof errorData === 'string') {
             msg = getMessage(errorData);
        } 
        else if (errorData.error) {
             msg = getMessage(errorData.error);
        }
    }
    
    apiError.value = msg || getMessage('UpdateFailed');
  }
}
</script>

<style scoped>
.change-password-container {
  height: 100%;
  background-color: #70aadd; 
  min-height: 500px; 
}

.card-header {
  background-color: #0044cc;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #003399 0%, #0055ff 100%);
  opacity: 0.9;
  z-index: 1;
}

.header-bg::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 20%),
                    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 20%);
  background-size: 50px 50px;
}

.col-form-label {
  font-weight: bold;
  color: #333;
}

.btn-primary {
  background-color: #2196f3;
  border-color: #2196f3;
  min-width: 120px;
}

.btn-primary:hover {
  background-color: #0d8aee;
}

.custom-btn {
    background-color: #2196f3 !important; 
    border: none !important;
    background-image: none !important; 
    box-shadow: none !important;
    color: #ffffff !important;
    min-width: 120px;
}

.custom-btn:hover, 
.custom-btn:active, 
.custom-btn:focus {
    background-color: #0d8aee !important;
    background-image: none !important;
    border: none !important;
    box-shadow: none !important;
    opacity: 0.9; 
}
</style>