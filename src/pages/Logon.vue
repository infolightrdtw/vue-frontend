<template>
    <div class="container-fluid logon d-flex justify-content-center align-items-center logon-page">
        <div class="logon-card">
            <div class="logon-header">
                <img class="logon-header-image" src="../assets/images/eep_vue.png" alt="EEP Vue" />
            </div>

            <div class="logon-body">
                <!-- 使用者帳號 -->
                <div class="input-group mb-3 logon-input">
                    <span class="input-group-text logon-icon">
                        <img src="../assets/images/login_user.svg" alt="user" class="logon-icon-img" />
                    </span>
                    <input type="text"
                           class="form-control"
                           ref="refUser"
                           v-model="user"
                           :placeholder="localeMessages.user"
                           autocomplete="off"
                           @keydown.enter.prevent="logonUser" />
                </div>

                <!-- 密碼 -->
                <div class="input-group mb-3 logon-input">
                    <span class="input-group-text logon-icon">
                        <img src="../assets/images/login_pwd.svg" alt="password" class="logon-icon-img" />
                    </span>
                    <input type="password"
                           class="form-control"
                           v-model="password"
                           :placeholder="localeMessages.pwd"
                           autocomplete="off"
                           @keydown.enter.prevent="logonUser" />
                </div>

                <!-- 資料庫選擇 -->
                <div class="input-group mb-3 logon-input">
                    <span class="input-group-text logon-icon">
                        <img src="../assets/images/login_db.svg" alt="database" class="logon-icon-img" />
                    </span>
                    <select class="form-select"
                            v-model="database"
                            @keydown.enter.prevent="logonUser">
                        <option v-for="db in databases" :key="db.value" :value="db.value">
                            {{ db.text }}
                        </option>
                    </select>
                </div>

                <!-- 解決方案選擇 -->
                <div class="input-group mb-3 logon-input">
                    <span class="input-group-text logon-icon">
                        <img src="../assets/images/login_slt.svg" alt="solution" class="logon-icon-img" />
                    </span>
                    <select class="form-select"
                            v-model="solution"
                            @keydown.enter.prevent="logonUser">
                        <option v-for="slt in solutions" :key="slt.value" :value="slt.value">
                            {{ slt.text }}
                        </option>
                    </select>
                </div>

                <!-- 忘記密碼 -->
                <div class="d-flex justify-content-start mb-3">
                    <span class="logon-forgot">忘記密碼？</span>
                </div>

                <!-- 錯誤訊息 -->
                <p v-if="errorMessage" class="text-danger mb-3">{{ errorMessage }}</p>

                <!-- 登入按鈕 -->
                <button class="btn btn-logon btn-lg w-100" @click="logonUser">
                    {{ localeMessages.logon }}
                </button>
            </div>

            <div class="logon-footer text-center">
                <small>
                    2025 © InfoLight System<br />
                    訊光科技系統股份有限公司
                </small>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import '@/assets/stylesheets/logon.css'
    import { ref, watch } from 'vue'
    import { useRouter } from 'vue-router'
    const router = useRouter()

    import messageUtils from '@/utils/messageApi'
    const {
        localeMessages
    } = messageUtils()
    import logonUtils from '@/utils/logonApi'
    const {
        logon,
        user,
        password,
        database,
        solution,
        errorMessage,
        databases,
        solutions
    } = logonUtils(localeMessages)

    const refUser = ref()
    watch(refUser, () => {
        if (refUser.value) {
            refUser.value.focus()
        }
    })

    async function logonUser() {
        var result = await logon()
        if (result) {
            window.sessionStorage.setItem('clientInfo', JSON.stringify(result));
            window.top.location.href = `/main${window.location.search}`
           //router.push('/main')
        }
    }
</script>

<style scoped>
    .logon-page {
        min-height: 100vh;
    }

    .logon-card {
        width: 380px;
        max-width: 90vw;
        background-color: #ffffff;
        border-radius: 28px;
        overflow: hidden;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    }

    .logon-header-image {
        display: block;
        width: 100%;
        height: auto;
    }

    .logon-body {
        padding: 2rem 2.25rem 1.25rem; 
        background-color: #ffffff;
    }

    .logon-footer {
        padding: 0.6rem 1.5rem 1.2rem; 
        background-color: #ffffff;
        font-size: 0.75rem; 
        color: #6c757d;
    }

    .logon-input {
        --logon-input-height: 44px; 
    }

    .logon-input .form-control,
    .logon-input .form-select {
        border-left: 0;
        box-shadow: none;
        height: var(--logon-input-height);
        font-size: 0.9rem;
    }

    .logon-icon {
        background-color: #ffffff;
        border-right: 0;
        height: var(--logon-input-height);
        display: flex;
        align-items: center;
        padding-top: 0;
        padding-bottom: 0;
    }

    .logon-icon-img {
        width: 18px;
        height: 18px;
    }

    .logon-forgot {
        font-size: 0.8rem;
        color: #4b8cff;
        cursor: default;
    }

    .btn-logon {
        border-radius: 999px;
        font-weight: 600;
        font-size: 0.95rem;
        padding: 0.55rem 1.5rem;
    }

    .text-danger {
        font-size: 0.8rem; 
    }
</style>
