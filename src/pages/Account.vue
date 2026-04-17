<template>
  <div class="container-fluid account-page d-flex justify-content-center align-items-center">
    <div class="account-card shadow">
      
      <div class="account-header text-center">
        <h3 v-if="isRegisterMode">{{ localeMessages.register }}</h3>
        <h3 v-else-if="mode === 'resetP'">{{ localeMessages.forget }}</h3>
      </div>

      <div class="account-body">
        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
          {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
        </div>
        <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
          {{ successMessage }}
          <button type="button" class="btn-close" @click="successMessage = ''" aria-label="Close"></button>
        </div>

        <form v-if="isRegisterMode" @submit.prevent="submitRegister" class="form-horizontal">
          <div class="mb-3">
            <label class="form-label">{{ localeMessages.user }} <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="regData.user" :placeholder="mode === 'registerD' ? '手機號碼或英文名+生日' : ''" required>
          </div>

          <div class="mb-3">
            <label class="form-label">{{ localeMessages.user }}{{ localeMessages.name}}</label>
            <input type="text" class="form-control" v-model="regData.userName" :placeholder="mode === 'registerD' ? '企業名稱或個人姓名' : ''">
          </div>

          <div class="mb-3">
            <label class="form-label">{{ localeMessages.password }} <span class="text-danger">*</span></label>
            <input type="password" class="form-control" v-model="regData.password" autocomplete="new-password" required>
          </div>

          <div class="mb-3">
            <label class="form-label">{{ localeMessages.confirm }}{{ localeMessages.password }} <span class="text-danger">*</span></label>
            <input type="password" class="form-control" v-model="regData.cpassword" autocomplete="new-password" required>
          </div>

          <div class="mb-3">
            <label class="form-label">
              {{ localeMessages.email}} <span class="text-danger">*</span>
              <small class="text-muted">({{ localeMessages.needValidate}})</small>
            </label>
            <input type="email" class="form-control" v-model="regData.email" required>
          </div>

          <div class="mb-4 form-check" v-if="mode !== 'registerU'">
            <input type="checkbox" class="form-check-input" id="ckLicense" v-model="regData.license">
            <label class="form-check-label" for="ckLicense">
              {{ localeMessages.readAndAgree}} 
              <a target="_blank" href="https://www.infolight.com/MVC/Home/ShareDetail/NDY4">Saas {{ localeMessages.license}}</a>
            </label>
          </div>

          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary w-45" @click="goBack">{{ localeMessages.cancel}}</button>
            <button type="submit" class="btn btn-primary w-45" :disabled="!isLicenseValid">{{ localeMessages.ok}}</button>
          </div>
        </form>

        <form v-else-if="mode === 'resetP'" @submit.prevent="submitResetP" class="form-horizontal">
          <div class="mb-3">
            <label class="form-label">{{ localeMessages.user}} <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="resetData.user" required>
          </div>

          <div class="mb-4">
            <label class="form-label">{{ localeMessages.email}} <span class="text-danger">*</span></label>
            <input type="email" class="form-control" v-model="resetData.email" required>
          </div>

          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary w-45" @click="goBack">{{ localeMessages.cancel }}</button>
            <button type="submit" class="btn btn-primary w-45">{{ localeMessages.ok}}</button>
          </div>
        </form>

      </div>
    </div>
    
    <BAlert ref="$__alert" :root="$this" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import messageUtils from '@/utils/messageApi'
import logonUtils from '@/utils/logonApi'
import pageUtils from '@/utils/pageApi'
import BAlert from '@/components/elements/BAlert.vue'

const __functions = {}
const __controls = {}
const $this = pageUtils(__functions, __controls)
const $__alert = ref<InstanceType<typeof BAlert> | null>(null)

const route = useRoute()
const router = useRouter()

const { localeMessages } = messageUtils()

const {
  regData,
  resetData,
  errorMessage,
  successMessage,
  submitAccount
} = logonUtils(localeMessages)

const mode = ref(route.query.type as string || 'register')

const isRegisterMode = computed(() => {
  return mode.value.startsWith('register')
})

const isLicenseValid = computed(() => {
  if (mode.value === 'registerU') return true
  return regData.license
})

const showAlert = async (msg: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    if ($__alert.value && typeof ($__alert.value as any).alert === 'function') {
        await ($__alert.value as any).alert(msg, type);
    } else {
        alert(msg);
    }
}

const submitRegister = async () => {
  if (regData.password !== regData.cpassword) {
    errorMessage.value = localeMessages.value.passwordNotMatch
    return
  }
  
  const isSuccess = await submitAccount('register', mode.value)
  if (isSuccess) {
    await showAlert(localeMessages.value.registerValidate, 'success')
    goBack()
  }
}

const submitResetP = async () => {
  const isSuccess = await submitAccount('resetP', mode.value)
  if (isSuccess) {
    await showAlert(localeMessages.value.resetSuccess, 'success')
    goBack()
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    window.close()
  }
}
</script>

<style scoped>
.account-page {
  min-height: 100vh;
  background-color: #f4f7f6;
  padding: 20px;
}

.account-card {
  width: 100%;
  max-width: 450px;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
}

.account-header {
  background-color: #004EA2; 
  color: white;
  padding: 20px;
  margin-bottom: 20px;
}

.account-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.account-body {
  padding: 0 30px 30px 30px;
}

.w-45 {
  width: 48%;
}
</style>