<template>
  <div>
    <div class="modal fade bootstrap-logon" :class="{ in: isVisible, show: isVisible }" :style="{ display: isVisible ? 'block' : 'none' }" tabindex="-1" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content shadow">
          <div class="modal-header">
            <button type="button" class="close btn-close" @click="cancel" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">{{ title || localeMessages.logon }}</h4>
          </div>
          
          <div class="modal-body">
            <div v-if="errorMessage" class="alert alert-danger" style="margin-bottom: 15px;">
              <button type="button" class="close" @click="errorMessage = ''" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              {{ errorMessage }}
            </div>

            <form role="form" class="form-horizontal" @submit.prevent="doLogon">
              <div class="form-group row mb-3">
                <label class="col-sm-3 col-form-label control-label text-end">{{ userText || localeMessages.user }}</label>
                <div class="col-sm-8">
                  <input type="text" class="form-control" name="user" v-model="user" @keydown.enter.prevent="doLogon" required>
                </div>
              </div>

              <div class="form-group row mb-3">
                <label class="col-sm-3 col-form-label control-label text-end">{{ passwordText || localeMessages.pwd }}</label>
                <div class="col-sm-8">
                  <input type="password" class="form-control" name="password" v-model="password" @keydown.enter.prevent="doLogon" required>
                </div>
              </div>

              <div v-if="forgetPassword || registered" class="form-group row mt-2">
                <div class="col-sm-8 offset-sm-3 forget clearfix">
                  <a v-if="registered" @click.prevent="goToAccount('registerU')" href="#" style="display: inline-block;">
                    {{ localeMessages.register }}{{ localeMessages.account}}
                  </a> 
                  <a v-if="forgetPassword" @click.prevent="goToAccount('resetP')" href="#" style="display: block; float: right;">
                    {{ localeMessages.forget }}{{ localeMessages.pcaption }}
                  </a>
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-primary form-logon" @click="doLogon">{{ localeMessages.logon }}</button>
            <button type="button" class="btn btn-default form-cancel" @click="cancel">{{ localeMessages.cancel }}</button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isVisible" class="modal-backdrop fade in"></div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router'; 

import messageUtils from '@/utils/messageApi';
import logonUtils from '@/utils/logonApi';


const props = defineProps({
  title: { type: String, default: '' },
  userText: { type: String, default: 'user' },
  passwordText: { type: String, default: 'password' },
  captcha: { type: Boolean, default: false },
  forgetPassword: { type: Boolean, default: false },
  registered: { type: Boolean, default: false },
  designer: { type: String, default: '' },
  onSuccess: { type: Function, default: null } 
});

const emit = defineEmits(['success']);

const router = useRouter(); 


const { localeMessages } = messageUtils();

const {
  logon,
  user,
  password,
  database,
  solution,
  errorMessage,
  databases,
  solutions
} = logonUtils(localeMessages);

const isVisible = ref(false);

const show = (callback) => {
  user.value = '';
  password.value = '';
  errorMessage.value = '';
  isVisible.value = true;
};

const cancel = () => {
  isVisible.value = false;
};

const doLogon = async () => {
  if (!user.value || !password.value) {
    errorMessage.value = '請輸入帳號與密碼';
    return;
  }

  var result = await logon();
  
  if (result) {
    window.sessionStorage.setItem('clientInfo', JSON.stringify(result));
    
    if (props.onSuccess) {
      props.onSuccess(result);
    }
    emit('success', result);

    isVisible.value = false;
  }
};

const goToAccount = (type) => {
  cancel();
  
  router.push({
    path: '/account', 
    query: {
      type: type,
      designer: props.designer,
      database: database.value,
      solution: solution.value
    }
  });
};

defineExpose({
  show,
  cancel
});
</script>

<style scoped>
.bootstrap-logon {
  z-index: 1050;
}
.modal-backdrop {
  opacity: 0.5;
  display: none !important; 
}
#Logon1 .modal {
  background-color: rgba(0, 0, 0, 0.5) !important;
}
</style>