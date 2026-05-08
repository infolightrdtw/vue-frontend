## Logon

登入交談框組件：彈出帳號／密碼輸入視窗，提供登入流程。登入成功後透過 `onSuccess` prop 或 `@success` 事件接收結果（`clientInfo` 會自動寫入 `sessionStorage`）。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| Title | string | 視窗標題（未設定時使用 i18n `logon`） |
| UserText | string | 帳號欄位的標籤文字（預設 `user`） |
| PasswordText | string | 密碼欄位的標籤文字（預設 `password`） |
| ForgetPassword | bool | 是否顯示「忘記密碼」連結（連到 `/account?type=resetP`） |
| Registered | bool | 是否顯示「註冊帳號」連結（連到 `/account?type=registerU`） |
| Designer | string | 帶入 `/account` 路由的 `designer` query 參數 |
| onSuccess | Function | 登入成功時呼叫，參數為後端回傳的 `clientInfo`；亦可改用 `@success` event 接收 |

### 方法

格式為：`$Logon1.value.methodName(parameters..)`（其中 `$Logon1` 是該元件的 template ref，請依頁面中 `const $Logon1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$Logon1.value.show()` | 打開 Logon 交談框讓用戶登入。**登入成功後要執行的程式請寫在 `onSuccess` prop 或 `@success` event handler**，不是傳給 `show()` |
| `$Logon1.value.cancel()` | 關閉 Logon 交談框（不觸發登入） |
| `$Logon1.value.logout()` | 讓目前登入的用戶登出（呼叫後端登出 API、清除 `sessionStorage.clientInfo`、跳轉至 `/logon`） |
| `$Logon1.value.changePwd()` | 讓目前登入的用戶變更密碼（跳轉至 `/account?type=changePwd`） |

### 範例：登入／登出切換按鈕

點擊連結時，未登入則開啟登入交談框，已登入則詢問是否登出。登入成功後重新載入主頁；登出後由 `logout()` 內部跳轉至 `/logon`。

```vue
<template>
  <Logon ref="$Logon1" :onSuccess="onLoginSuccess" />
  <a id="loginLink" href="#" @click.prevent="login">{{ loginText }}</a>
</template>

<script setup>
import { ref } from 'vue';

const $Logon1 = ref(null);
const loginText = ref($this.getVariableValue('user') || '未登入');

function login() {
    const user = $this.getVariableValue('user'); // 取得目前登入的帳號
    if (!user) {
        // 沒有登入 → 以 Logon 組件對 EEP 進行登入
        $Logon1.value.show();
    } else {
        // 已登入 → 確認後登出
        confirmLogout();
    }
}

// 登入成功的 callback，由 Logon 元件透過 onSuccess prop 觸發
function onLoginSuccess(clientInfo) {
    loginText.value = $this.getVariableValue('user'); // 顯示目前登入的帳號
    window.location.reload();                          // 重新載入主頁
}

async function confirmLogout() {
    const ok = await $this.confirm('確認登出?');
    if (ok) {
        loginText.value = '未登入';
        await $Logon1.value.logout(); // 內部會清 sessionStorage 並跳轉至 /logon
    }
}
</script>
```
