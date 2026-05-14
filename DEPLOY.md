# 發佈與驗證流程

> 給接手 release 工作的人。

## 目錄

1. [TL;DR — 最短上線路徑](#1-tldr--最短上線路徑)
2. [.env 設定](#2-env-設定)
3. [Build / Preview 流程](#3-build--preview-流程)
4. [自動化驗證](#4-自動化驗證)
5. [真實 backend E2E（release 前必跑）](#5-真實-backend-e2erelease-前必跑)
6. [手動驗證清單](#6-手動驗證清單)
7. [常見問題排查](#7-常見問題排查)

---

## 1. TL;DR — 最短上線路徑

```bash
# 1. 確認 .env 的 baseURL 是空的（見 §2）
cat .env                    # VITE_APP_API_URL=

# 2. 全測試
npm run test                # 57 檔 / 625 passed / 8 skipped

# 3. Build production dist
npm run build               # 應通過、無 error

# 4. 確保 EEP backend 起著（https://localhost:44368），跑 preview + E2E real backend
npm run test:e2e:preview    # 應 33/33 chromium passed

# 5. 手動驗 4 張 demo 頁面（見 §6）

# 6. 發 tag
git tag v0.1.0-rc1
```

任何一步失敗都別繼續，看 §7 或 [CLAUDE.md `## 4` 進度日誌](./CLAUDE.md) 找之前的 root cause。

---

## 2. .env 設定

**`.env` 的 `VITE_APP_API_URL` 必須留空**：

```bash
VITE_APP_API_URL=
```

### 為什麼

`src/utils/dataApi.ts` 與 `src/utils/logonApi.ts` 都做：

```ts
axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL
```

- **留空**（推薦）：axios baseURL 為空字串 → 所有 `axios.post('/api/...')` 走相對路徑 → 同源請求 → dev 走 vite dev server 的 `/api` proxy、preview 走 vite preview 的 `/api` proxy（皆在 [vite.config.js](./vite.config.js) 設定）。
- **寫死成 `http://localhost:35506/`**（❌ 不要）：axios 把它接到 URL 前面 → 跨來源 (`localhost:5173 → localhost:35506`) → 後端不回 CORS 標頭 → response 拿不到 → `loadClientInfo()` 永遠空 → `pageApi.ts:52` 把使用者踢回 `/logon` → F12 看到 `logon 304 Not Modified`、誤以為是 cache 問題。

### 改了之後

必須重 `npm run build`。`VITE_APP_*` 變數在 build 時被替換成字串常數，dist 裡是寫死的。

### Production 部署

若 release 時前後端**同源**（後端也在 `eepcloud.infolight.com`），`.env` 留空就對了 — 走相對路徑、由 reverse proxy（nginx / IIS）轉到後端。
若**跨來源**，後端必須回 CORS 標頭 (`Access-Control-Allow-Origin` + `Access-Control-Allow-Credentials: true`)、cookie 必須是 `SameSite=None; Secure`、`.env.production` 才能寫成後端 URL。沒搞定 CORS 前不要走跨來源。

---

## 3. Build / Preview 流程

### Build

```bash
npm run build
```

通過後 `dist/` 內含：
- `index.html`
- `assets/index-<hash>.js`（主 bundle）
- 每張頁面 lazy chunk（`assets/客戶資料表-<hash>.js` 等）
- 其他 CSS / 字型 / 圖

**已知 warning**：`Some chunks are larger than 500 kBs` — `BEditor`、`出貨單eng`、`Schedule` 等。不擋上線；未來要優化用 `manualChunks` 切。

**已知排除**：`src/pages/bootstrap/SOLUTION1/**` 被 `vite.config.js` 的 `VueRouter({ exclude })` 跳過。裡面是早期 demo 檔，要動的話得先修檔內亂掉的 identifier（如 `半成品.vue` 有 `$dpgroup_Shipping Details` 帶空格）。

### Preview

```bash
npm run preview            # 4173
# 或
npx vite preview --port 4173
```

Preview 是 static file server 模式 + 同樣的 `/api` proxy（[vite.config.js](./vite.config.js) 的 `preview` 段），用來在 release 前模擬 production 行為。

⚠️ 常見地雷：若 4173 已有舊 preview 跑著（甚至是別資料夾的 dist），新 build 不會生效。檢查 + 清掉：

```powershell
Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

---

## 4. 自動化驗證

### 單元 / 頁面 / 契約測試

```bash
npm run test               # 全跑一次，~1 分鐘
npm run test:watch         # 監看模式
npm run test:coverage      # 產 coverage/，~56% statements
```

### E2E（mock backend）

```bash
npm run test:e2e           # 不需要 backend 起來，用 page.route 攔 /api/*
npm run test:e2e:ui        # 互動 UI 模式
```

跑完看：
- `playwright-report/index.html` — 互動式 HTML 報告（每支 test 的 step trace / network / console）
- `test-results/<spec>/` — 失敗的截圖、影片、trace.zip、error-context.md

兩個目錄都已被 `.gitignore` 排除。重看舊報告：

```bash
npx playwright show-report
```

---

## 5. 真實 backend E2E（release 前必跑）

這是上線前最重要的一關 — 不跑這個無法保證發佈版本能登入 + 載資料 + 互動。

### 前置

1. EEP backend 起在 `https://localhost:44368`（HTTPS，看 [vite.config.js](./vite.config.js) 的 proxy target）。
2. 後端有 `001` 帳號、密碼為空。如需改帳密：

   ```bash
   E2E_USER=mytestuser E2E_PASSWORD=secret npm run test:e2e:preview
   ```

### 對 dev server 跑

```bash
npm run test:e2e:real      # vite dev (5173) + 真 backend
```

### 對 preview build 跑（release 模式，**推薦**）

```bash
npm run test:e2e:preview   # npm run preview + 真 backend
```

差別：preview 模式測的是 `dist/` 出來的 bundle，跟 production 一樣；dev 模式測的是 HMR 模組，是 release 前的 sanity 但**不能取代** preview 驗證。

預期結果：**33 passed (chromium)**。任何失敗都看 [CLAUDE.md `## 4` 進度日誌](./CLAUDE.md) 對照之前的 root cause。

### 機制

`tests/e2e/_global-setup.ts` 在跑 spec 前用真實 `/logon` 頁面登入一次，把 cookies 存到 `tests/e2e/.auth/<browser>.json`。每支 spec 透過 [playwright.config.ts](./playwright.config.ts) 的 `storageState` 套用 — 共享 session，不必每支重登。

`tests/e2e/_mocks.ts` 內有 `waitForHealthy(page)` 與 `expectPageHealthy(page)` 兩個 helper：
- `waitForHealthy` — 等到 `sessionStorage.clientInfo.user` 被寫入（25s timeout），證明 `pageApi.onMounted` 跑完了。
- `expectPageHealthy` — 額外檢查 toolbar 沒有殘留 i18n key（如 `'add'` 沒被翻成 `'新增'`），證明 `localeMessages` 已 populate。

---

## 6. 手動驗證清單

自動化測試覆蓋讀取 + UI 互動。**寫入測 / CRUD smoke** 還沒自動化（怕髒 test data），release 前必須人工跑一次：

### 客戶資料表（`/bootstrap/2/客戶資料表`）

- [ ] DataGrid 出現至少 1 筆資料
- [ ] 點 `Add` → DataForm modal 出現
- [ ] 必填欄位（`*` 前綴）未填 → submit 跳警告
- [ ] 填齊後 submit → 成功訊息 + grid 多一筆
- [ ] 點 `Query` → query dialog 出現 + 各 fuzzy 欄位可輸入

### 出貨單（`/bootstrap/2/出貨單`）

- [ ] master-detail 結構：上方出貨單列表、下方明細
- [ ] 點 master 列 → 下方明細跟著切
- [ ] 整批新增明細 → 自動加總顯示正確
- [ ] 改一行明細的數量 → 自動加總跟著變
- [ ] submit 整單 → master 與所有明細一起進 backend

### 員工資料表（`/bootstrap/2/員工資料表`）

- [ ] DataGrid 載入
- [ ] PromptDialog 工具列項目可點 → modal 出現
- [ ] Schedule (FullCalendar) 渲染週日/週一... 表頭
- [ ] Creator / Updater 欄位顯示登入者帳號

### 應徵人員基本資料表（`/bootstrap/2/應徵人員基本資料表`）

- [ ] Tabs（應徵人員 / 家庭資料）可切換
- [ ] `家庭資料` tab 顯示 editgrid
- [ ] 基本資料 tab 的 DataPanel 顯示 `中文姓名 / 身分證號` 欄位
- [ ] 經歷資料 / 受訓記錄 兩個 detail grid 顯示

任一項失敗 → 不出 release tag。

---

## 7. 常見問題排查

### Q：登入後又被踢回 `/logon`，F12 Network 看到 `logon 304 Not Modified`

99% 是 `.env` 把 `VITE_APP_API_URL` 寫死了，見 §2。次要可能：cookie 被 `SameSite` / `Secure` 擋。先看 F12 Application → Cookies。

### Q：`npm run preview` 起不來，port 4173 已被占用

舊的 preview 沒關。用 §3 的 PowerShell 指令清掉、或：

```powershell
Get-Process node | Where-Object { $_.CommandLine -like "*vite preview*" } | Stop-Process -Force
```

### Q：E2E `realLogin` 卡在 `waitForURL(/main/)` 永遠等不到

backend 沒回 `LogonSuccess`、或 database 載入失敗。F12 看 `/api/ApiMain/account` 的 response body。常見：

- `{"error":"Can not find Database:''"}` → `loadDatabases()` 沒成功 → 通常是 CORS（見 §2）
- `{"message":"PasswordWrong"}` → 帳密錯，改 `E2E_USER` / `E2E_PASSWORD`

### Q：頁面 404 + `vue-router` 的 NotFound 觸發

route 沒註冊到 router。可能原因：

1. `unplugin-vue-router` 沒把該 page 算進來。檢查 `typed-router.d.ts` 有沒有對應條目。
2. SOLUTION1 資料夾的檔案 — 已被 `vite.config.js` 的 `VueRouter({ exclude })` 排除。
3. preview 在用舊 build。對照 `dist/index.html` 與 `curl http://localhost:4173/` 的 `index-<hash>.js` 是否一致。

### Q：build 通過但 preview 跑空白頁

通常是 console 有 uncaught error。F12 看一下，最常見：

- `onMounted` 裡有未 catch 的 axios reject（過去修過 `loadDatabases / loadSolutions / loadMessage` 三個）
- 子組件 lazy import 失敗（chunk hash 對不上）

### Q：vitest 全綠但 E2E 全紅

通常是 preview 在跑舊 build。先 §3 清 port 4173、`rm -rf dist`、重 build、再跑。
若是 dev server (5173) 上失敗，看 [CLAUDE.md `## 4`](./CLAUDE.md) 之前的 case。

---

## 相關文件

- [CLAUDE.md](./CLAUDE.md) — 內部工作日誌，含每次測試與修復的歷史 root cause 紀錄。
- [RWD_Vue_表單組件屬性.md](./RWD_Vue_表單組件屬性.md) — 元件 API 規格，contract test 的依據。
- [vite.config.js](./vite.config.js) — proxy 設定（dev / preview 都在這）。
- [playwright.config.ts](./playwright.config.ts) — E2E 設定（被 `.gitignore` 排除，local-only；要分享改動需先動 `.gitignore`）。
