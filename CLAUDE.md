# CLAUDE.md — vue-frontend 上線前測試 工作日誌

> **這份檔是給每一次新對話的 Claude 看的進度日誌與工作守則。**
> 每次對話開始先讀這裡；對話結束（或完成一個段落）前，必須更新「進度日誌」「待辦」「測試現況」。

---

## 0. 給未來的 Claude — 工作守則

### 每次對話開始
1. 讀 memory `session_log.md`（高層摘要、目前焦點、下次接手指引）
2. 讀本檔（詳細狀態、待辦、實測數據）
3. 跑 `git status` + `git log --oneline -10`（磁碟現況）
4. **特別注意**：本專案有大量未 commit 的工作成果。git 看不出真實進度，請以本檔為準。

### 每次對話結束前（或完成一個明確段落）
**A. 更新本檔（CLAUDE.md）**
- `## 4. 進度日誌` 最上方加新條目（日期、做了什麼、決策）
- `## 3. 待辦清單` 勾完成項、補新發現的項目
- 若改了測試/設定，更新 `## 2. 當前測試現況` 的數字

**B. 更新 memory `session_log.md`**
- 最上方加一筆新摘要：做了什麼、目前焦點、下次接手要先看哪幾段
- 保留最近 5–8 筆，太舊的刪除
- **只寫高層指針，不重複 CLAUDE.md 的細節**

### 規則
- **誠實標示不確定的狀態** — 沒實際跑過的測試別寫「通過」，寫「未驗證」。
- 進度日誌只記重點與決策，不逐字記對話。常駐知識放 `## 1. 專案速覽`。
- 短回答（純解釋、不動程式碼、不跑測試）不需更新進度日誌。
- **「自動」的限制**：本檔與 session_log 仰賴模型每次主動更新，並非 hook 強制。若要強制，見 `## 6. 自動化選項`。

---

## 1. 專案速覽

- **專案**：vue-frontend（RWD Vue 表單組件庫，搭配 EEP 後端）
- **目標**：上線 release 前完成測試覆蓋與穩定性驗證
- **技術棧**：Vue 3.2、Vite 4、Vitest 2、Playwright 1.59、TypeScript 5.8、Bootstrap 5.3、ECharts 6
- **重點目錄**
  - `src/components/controls/` — 控制元件（DataGrid、DataForm、Schedule…）
  - `src/components/editors/` — 編輯元件（Datebox、Combobox、Refval…）
  - `src/composables/` — useFieldFromDom、useValidator
  - `src/pages/bootstrap/2/` — 4 張 demo 頁面（客戶、出貨、員工、應徵人員）
  - `tests/pages/` — Page-level vitest（jsdom + auto-import stubs）
  - `tests/e2e/` — Playwright E2E（mock 預設，`E2E_REAL=1` 打真實後端）
  - `tests/spec-gen/` — 由 `RWD_Vue_表單組件屬性.md` 產生 API 契約測試
  - `tests/stubs/` — wangeditor / leaflet / fullcalendar / missing-css 替身
  - `diagnostic/` — 4 個業務頁面 spec JSON / 截圖

### 常用指令
| 指令 | 用途 |
|---|---|
| `npm run dev` | Vite dev server (5173) |
| `npm run test` | Vitest 一次（unit + page + contract） |
| `npm run test:watch` | 監看 |
| `npm run test:ci` | JUnit 輸出（CI 用） |
| `npm run test:coverage` | v8 coverage → `./coverage/` |
| `npm run test:e2e` | Playwright（mock） |
| `npm run test:e2e:real` | Playwright 打真實 EEP 後端 |
| `npm run test:e2e:ui` | Playwright UI 互動 |
| `npm run build` | 產 dist |

### 測試體系（4 層）
- **L1 Component unit（~481 案）**：30 元件 + 5 composable + 個別 editor
- **L2 Page-level vitest（33 案）**：客戶 7 / 出貨 10 / 應徵 7 / 員工 9
- **L3 Spec-driven contract（141 = 110✅ + 23 todo + 8 skip）**：`.md` 改完自動跟
- **L4 E2E real backend strict（33 specs）**：dev server + 001/empty 登入、storageState 共享

---

## 2. 當前測試現況

> 報告數據來源：使用者於 2026-05-07 提供的 `vue release測試記錄(claude).docx`
> 本機實測：2026-05-13 — **build + preview + 全測試（含 E2E 真 backend）通過**

### 累積成果（vs 起點）
| 指標 | 起點 | 報告現在 | 本機實測 (2026-05-13) |
|---|---|---|---|
| 測試檔案 | 26 | 57+ | 57 passed |
| 單元/頁面/契約 案例 | 210 | 600 passed + 23 todo + 8 skip | **625 passed / 8 skipped** |
| E2E specs | 0 | 33 passed（real backend strict） | **33 passed（preview build + 真 backend）** |
| 覆蓋率 | n/a | 56.53% statements | 未量 |
| Production deps 漏 | 7 | 0 | — |
| Spec ↔ code 不一致 | 28 | 23（KNOWN_GAPS） | — |
| 會 crash 的 release blocker | 4 | 0 | — |
| **Production build** | 失敗 | 未驗 | **✅ 通過、無 error** |
| **Preview + E2E real backend** | — | — | **✅ 33/33 chromium** |

### 本機 `npm run test` 與 build 結果
- 全 57 檔通過，623 passed / 8 skipped。**先前提的「出貨單/員工資料表 beforeEach timeout」回歸已自行恢復**。
- `npm run build` 從失敗 → 通過。修了 SOLUTION1（vite-router exclude）+ main.css `:hover` 空格 + Logon onMount unhandled rejection。
- `vite preview` 起 4173，6 條路由全部 HTTP 200，唯一 console 訊息是無 backend 的 /api 載入失敗（預期）。

### 已修的 4 個 Release Blockers
1. **Mauiscan TDZ** — `src/components/editors/Mauiscan.vue:128`，`defineExpose` 引用 line 146 才宣告的 `const startAndroidScan`。**狀態**：修好（移到底部）
2. **員工資料表 `__slotProps`** — `src/pages/bootstrap/2/員工資料表.vue:89`，DataPanel 在 slot 外用 `v-bind="__slotProps"` → undefined → BTableCell crash。**狀態**：修好（換成明確 `:row="{}" :readonly="false" :panelColumns="[]"`，但這只是不 crash，畫面仍空殼，見待辦）
3. **7 個 production deps 漏在 package.json** — uuid/leaflet/@wangeditor/editor/@fullcalendar/{vue3,daygrid,timegrid,interaction,bootstrap5}/echarts/vue-echarts 移進 dependencies；unplugin-vue-router@0.10.9 進 devDependencies。**狀態**：修好
4. **Pivottable template parse error** — `src/components/controls/Pivottable.vue`。**狀態**：修好，從 coverage exclude 移除

### 元件 API 補齊（9 個元件 / 65 個方法）
| 元件 | 補了 | 內容 |
|---|---|---|
| DataGrid | 14 | getSelected/getSelectedIndex/select/check/uncheck/checkAll/uncheckAll/getChecked/beginEdit/openQuery/getTotal/getToolItem/hideColumn/showColumn |
| DataForm | 4 + 1 prop | status/view_row/openQuery/exportWord + onExportWord prop |
| Tree | 7 + 2 props | load/loadData/setWhere/getSelected/insert_row/delete_row/renderNode + onUpdate/onRenderNode props |
| Signature | 6 | reset/replay/getUrl/getValue/setValue/options |
| Combobox | 5 | getText/getValue/setValue/setWhere/options |
| Fileupload | 5 | getValue/setValue/getUrl/options/editImage |
| Refval | 2 | getText/doColumnMatch |
| LineChart/BarChart/PieChart | 各 5 = 15 | load/loadData/setWhere/resize/options |

### 規格文件 .md 整理
- `const x = (...) => {}` → `function x(...){}`：36 處
- jQuery `$('id').foo('method', args)` → Vue ref `$ref.value.method(args)`：130+ 處
- `$.parseJSON()` → `JSON.parse()`：5 處
- `document.ready()` → `onMounted()`：1 處
- `self.parent.closeCurrentTab()` → `$this.closeCurrentTab()`：1 處
- 補新方法表：DataPanel / Tabs / ReportViewer / PromptDialog 5 個 / DataForm 11 行 / DataGrid 3 行
- 修 typo（optoins → options）：1 處

---

## 3. 待辦清單（上線前測試改善）

### 🔴 必修（會擋上線或影響可信度）
- [x] ~~驗證 page test 回歸~~ — 2026-05-08 重跑 `npm run test` 已 623 passed，先前 timeout 為一次性。
- [x] ~~處理 SOLUTION1 build 失敗~~ — 2026-05-08 在 `vite.config.js` 用 `VueRouter({ exclude: ['**/SOLUTION1/**'] })` 排除整個資料夾，檔案保留作為參考。
- [x] ~~commit 散落工作~~ — 已全部 commit（git working tree clean）。
- [x] ~~發佈環境（dist + preview）E2E 真 backend~~ — 2026-05-13 33/33 chromium 全綠。修了 `.env` baseURL bug（見 4./2026-05-13）。
- [ ] **release 前手動驗 4 張 demo 頁面**（CLAUDE.md `## 6. 上線最短路徑` 步驟 4）— 自動化測試已覆蓋 read + UI 互動，差實機 CRUD。
- [ ] **取消 `.gitignore` 對 `tests/` 與 `*.config.ts` 的排除** — 否則 playwright.config.ts / e2e specs 永遠是 local-only，CI 與其他協作者沒得用。改前確認沒有敏感資訊在這些檔案。

### 🟡 不致命但建議 release 前清掉
- [ ] **Page generator 型別 warnings（~20 條）** — 4 張頁面都有 `queryColumnsCount="2"` 應為 `:queryColumnsCount="2"`，pageSize/pageList/horizontalColumnsCount 同樣問題。生產 Vue 不印 warning，但 generator 該修。
- [ ] **AutoSeq resolve warning** — 應徵人員 page template 還寫 `<AutoSeq>` 但已改用其他方式實作。要徹底乾淨需改 page template。
- [ ] **員工資料表 DataPanel1 移進正確 slot** — 目前 `:row="{}"` fallback 不 crash 但 DataPanel 永遠空白。正確修法是 generator 把 DataPanel 移進 dfMaster 的 slot。

### 🟠 缺項（release 後可補）
- [ ] **Cross-browser**（Firefox / Safari）— 目前只跑 Chromium
- [ ] **真實 CRUD 寫入測試** — 怕髒 test data，目前只測讀取 + UI 互動
- [ ] **Visual regression baseline** — 未建立
- [ ] **CI 設定**（GitHub Actions）— 跑 `npm run test:ci` + Playwright，產 JUnit + coverage artefact
- [ ] **coverage thresholds** — vitest.config.ts 有 reporter 但無 thresholds

### 🟢 持續縮減 KNOWN_GAPS（23 → 0）
allow-list 在 `tests/spec-gen/contract.test.ts`，每移一行 = 該方法已實作 + contract test 自動驗證。
- **DataGrid (15)**：getRows、setWhere、viewRow、updateRow、getEditorValue、setEditorValue、getColumnOption、setColumnTitle、importExcel、importExcelNotApply、export、exportWordPdf、exportExcel、exportReport、hide
- **DataForm (3)**：exportReport、options、hide
- **Tree (1)**：options（已 expose 為 props 物件，型別不對）
- **Refval (2)**：load、getWhereItems
- **Switch (2)**：options、getValue

---

## 4. 進度日誌

> 新條目放最上方。格式：`### YYYY-MM-DD — 摘要`，內容用條列。

### 2026-05-13 — 發佈環境 E2E 全綠：找到並修了 `.env` 把 baseURL 寫死導致繞過 vite proxy 的問題

**結論**：vitest 57 檔 / 625 passed / 8 skipped、`npm run build` 通過、`vite preview (4173) + E2E_REAL=1 + 真實 backend` 33 specs 全綠（chromium）。

**根因**：`.env` 是 `VITE_APP_API_URL=http://localhost:35506/`，所以 build 後 axios 直接打 `http://localhost:35506`、**繞過 preview 的 `/api` proxy**。後端 35506 不回 CORS 標頭 → 跨來源請求 response 拿不到 → `loadClientInfo()` 永遠是空 → 任何 protected page 都被 pageApi.ts:52 踢回 `/logon`、再被 404 fall-through 接住。dev mode 看不出來是因為 axios 用相對路徑時 dev server 自動代理。
- **修法**：`.env` 改成 `VITE_APP_API_URL=`（空字串）。axios baseURL 為空 → 走相對路徑 → dev / preview 都走 `vite.config.js` 的 `/api → https://localhost:44368` proxy。
- 修完前後對比：preview build 對真 backend，**16 失敗 → 33 全綠**。

**順手修的測試/設定**：
- `playwright.config.ts`：新增 `E2E_PREVIEW=1` 環境變數切換 baseURL/webServer (`http://localhost:4173` + `npm run preview`)，保留原本 dev 模式。
- `package.json`：加 `"preview": "vite preview --port 4173"` 與 `"test:e2e:preview"` script。
- `tests/e2e/07-員工資料表-flows.spec.ts` 第一個 spec：`waitForTimeout(2000)` → `waitForHealthy(page)`，跟其他頁面一致（2 秒在 real backend 不夠）。
- `tests/e2e/_mocks.ts` 的 `expectPageHealthy`：i18n 鍵檢查改成 polling 20 次 × 250ms，因為 BButton 的 `title` computed 對 `localeMessages.value` 重新指派的反應有 ~tick 延遲，固定一次性檢查會 race。
- ⚠️ `playwright.config.ts`、`tests/` 整個目錄、所有 `*.config.ts` 都被 `.gitignore` 排除 → 上面這幾個檔的改動**不會被 commit**，只有 `.env` 與 `package.json` 進得了 git。若要分享測試改動，需要先動 `.gitignore`（待辦項）。

**過程中除錯彎路**（給後續閱讀者參考，避免重蹈覆轍）：
1. 一開始失敗看到 BEditor 取 `row['電話']` undefined → 以為是 DataForm 把 row 傳成空，追了半天才發現是更上層的 clientInfo 沒設、整個 pageApi 流程沒走完。
2. 接著看到 `/bootstrap/2/客戶資料表` 跑 404、route 居然變成 `/bootstrap/2/111` → 用 `router.getRoutes()` 對印 dist bundle 才發現 **5/8 起就有一個舊 vite preview 行程還掛在 port 4173**（不同資料夾的 dist），playwright `reuseExistingServer: !CI` 直接撿那個用，所以 build 結果根本沒被測到。`Get-NetTCPConnection -LocalPort 4173 | Stop-Process` 清掉就好。
3. 重跑後又遇 `clientInfo null` → 用 diag 腳本攔 axios，看見全部請求打到 `localhost:35506`、無 CORS，才回到根因。

**已知待辦（這次沒動）**：
- 後端 35506 拿不到 `客戶資料表` 模組（`{"error":"Module:'客戶資料表' not found."}`）— 測試 backend 缺資料，不影響 frontend 行為，但跑真 CRUD 寫入測試前要先補。
- Firefox / WebKit 沒跑，只跑 chromium。

### 2026-05-08 — Pivottable.vue 修 `<tr>` 直接位於 `<table>` 的 HTML 規範警告
- 原始狀況：Vite 跑 `vue-frontend` 時警告 `<tr> cannot be child of <table>`，位置在 `src/components/controls/Pivottable.vue` 外層的 `<table class="pvtUi">`（line 3-110），3 個 `<tr>`（控制列 / Cols 列 / Rows + 內容列）直接是 table 的子元素。內層真正的 pivot table（line 59）已正確使用 `<thead>/<tbody>`。
- 修法：在外層 table 加 `<tbody>` 包覆三個 tr，改動只 2 行（line 4 加 `<tbody>`、line 110 加 `</tbody>`），不動樣式邏輯。
- 全測試重跑：57 檔 / 625 passed / 8 skipped — 比前次 623 多 2 passed，無回歸。
- ⚠️ 警告訊息的檔案路徑是 `C:/Work/Core_N/EEPWebClient.Core/vue-frontend/src/...`，與目前工作目錄 `C:\Work\Claude_workspace\vue-frontend_c` 不同。我只修了後者，前者需另外同步或釐清是否為鏡像副本。

### 2026-05-08 — 5 個 ANDY 區塊全數轉 Vue 寫法
- 規格 `.md` 被另一人重新整理過（屬性表大幅 reformat、檔案被設成唯讀）；先解除唯讀（`Set-ItemProperty -IsReadOnly $false`）。
- 5 個 `ANDY` 標記區塊全部修完：
  1. **DataGrid GridColumn 取值/設值**（line ~165）— 三種狀態（onShowEditor / onSelect / 瀏覽）全部改成 `$dgMaster.value.getRows()/getEditorValue/setEditorValue/updateRow`，readonly 改用 `getColumnOption().disabled` 而非 DOM `.setReadonly()`。
  2. **FormColumn 欄位存取**（line ~625）— 改用 `$dfMaster.value.getRow().fieldName` 讀寫，反推 `loadRow` 與 `setReadonly` 用法。
  3. **DataPanel 欄位存取**（line ~671）— 修正觀念：DataPanel 的 row 是父 DataForm slot 傳入，存取走 `$dfMaster.value.getRow()`，DataPanel 自身只暴露 show/hide/toggle。
  4. **附錄 6 的 21 個範例**（line ~2923-3168）— 21 個 jQuery 範例全轉 Vue（`$dgMaster.value.xxx`、`$this.callMethod/alert/getVariableValue/getEncryptParameters`、template slot、scoped CSS、`editCommandVisible` callback 等）。Edit 的多行替換對這個區塊一直失敗（檔案 LF 但很長），改用 PowerShell 寫暫存檔再 splice，一次性換掉。
- 順便清掉 export 範例附近多餘的「案例:」字樣。
- contract test 仍 133/141 通過。

### 2026-05-08 — DataGrid export 範例補進 .md
- 在 `RWD_Vue_表單組件屬性.md` DataGrid 段的「exportWord / exportWordPdf / exportExcel 的 param 參數」小節後新增範例區塊。
- 把使用者提供的兩個 jQuery 範例（`$(this).datagrid('exportWord','客戶出貨單')` 與帶選項物件的版本）轉成 Vue ref 寫法 `$dgMaster.value.exportWord({...})`，並補一個 `exportExcel` 範例與 `exportWordPdf` 替代寫法。
- 對照 `DataGrid.vue:1339-1395` 的實際 options 解析（`wordName || fileName`、`directOpen`、`password`、`fileType`），key 名稱皆已對齊。
- contract test 仍 133/141 通過。

### 2026-05-08 — Logon 段加進規格 .md + 範例轉 Vue
- 在 `RWD_Vue_表單組件屬性.md` FLcomment 與 LineChart 之間新增 `## Logon` 段（屬性表 8 項、方法表 4 項：show/cancel/logout/changePwd）。
- 把使用者提供的 jQuery 登入／登出範例轉成 Vue 寫法（`$('#Logon1').logon('show',cb)` → `:onSuccess` prop + `$Logon1.value.show()`、`$.confirm` → `await $this.confirm`、`$('#loginLink').html` → reactive ref + template binding）並嵌進 Logon 段的「範例」子節。
- 重跑 contract test：133/141 通過，新增段落不影響其他元件契約。

### 2026-05-08 — Logon 元件擴充 logout / changePwd
- 應使用者要求，把 `logout` 與 `changePwd` 方法加進 `src/components/controls/Logon.vue` 的 `defineExpose`，這樣頁面可直接 `$Logon1.value.logout()` / `$Logon1.value.changePwd()`，與其他控制元件 API 風格一致。
- `logout` 內部走 `mainApi().logout()` → 清 `sessionStorage.clientInfo` → `window.location.href = /logon${search}`（與 `Main.vue` 的 `logoutUser` 對齊）。
- `changePwd` 走 `window.location.href = '/account?type=changePwd'`（與 `BootstrapView.vue:154` 對齊）。
- `Logon.test.ts` 加上 `@/utils/mainApi` mock + `window.location` stub + 兩個新方法的單元測試，11/11 通過。
- 規格 .md（`RWD_Vue_表單組件屬性.md`）目前還沒有 Logon 段落，使用者準備新增；下次新增時 `defineExpose` 已有 4 個方法可寫進方法表（show / cancel / logout / changePwd）。

### 2026-05-08 — Production build 通過 + 消除 warnings + preview 驗證
- **Build 從失敗 → 通過**：原因是 `src/pages/bootstrap/SOLUTION1/半成品.vue` 有 generator 留下的非法識別字（`$dpgroup_Shipping Details` 帶空格）擋住 vue compiler。使用者選擇「排除 build 但保留檔案」→ 在 `vite.config.js` 設 `VueRouter({ exclude: ['**/SOLUTION1/**'] })`，整個 SOLUTION1 不再進 auto-route／不被 bundle。
- **CSS warning**：`src/assets/stylesheets/main.css:74` 的 `.combo-arrow: hover{` 多了空格，esbuild minify 時會 warn `Expected identifier but found whitespace`。改成 `:hover`。
- **Unhandled rejection**：preview 抓到 3 個 `pageerror` name=`AxiosError` msg=`m`（minified 過後的訊息），來源是 `src/utils/logonApi.ts` `loadDatabases()` / `loadSolutions()` 與 `src/utils/messageApi.ts` `loadMessage()` 在 `onMounted` 沒接 `.catch`。三個 callsite 都加上 catch 後 unhandled rejection 全消。
- **Preview smoke 驗證**：寫 `tests/preview-smoke.cjs`，起 `vite preview --port 4173` 用 chromium 載入 `/`、`/Logon`、4 張 demo 頁面，記錄所有 console error / pageerror / warning。filter 掉 /api 相關 noise（preview 沒 backend proxy）後，6/6 HTTP 200 + 0 real errors + 0 warnings。
- **Test suite 全綠**：57 檔 / 623 passed / 8 skipped。先前 CLAUDE.md 提的「出貨單/員工資料表 beforeEach timeout」回歸已恢復，是一次性。
- **無動到 untracked**：working tree 已乾淨，未動 .claude/、diagnostic/。

### 2026-05-07 — 整合外部測試報告 + 發現 page test 回歸
- 使用者提供 `vue release測試記錄(claude).docx`，內含 5 張截圖的完整 release 報告。
- 整合報告數據到本檔 `## 2`：4 個 release blocker 已修、65 個方法補齊、E2E 33 specs、覆蓋率 56.53%、KNOWN_GAPS 從 28 降到 23。
- 對照本機 `npm run test` 結果，發現 `出貨單.test.ts` 與 `員工資料表.test.ts` 兩支 page test 全部 skip（`beforeEach` 30s timeout）— 與報告「Page-level tests 全綠 33」不一致，需要釐清是回歸還是 Windows tmp 鎖檔導致。
- 確認大量工作（40+ vue 修改、AutoSeq.vue 新增、playwright.config.ts、deps 修復等）都還在 working tree 未 commit — 這就是先前 session 的成果。
- 把報告中的「上線最短路徑」與待辦對齊到本檔 `## 3`。

### 2026-05-07 — 建立工作日誌、首次盤點測試狀態
- 建立 `CLAUDE.md`，定義工作守則與待辦結構（使用者要求未來每次對話自動更新）。
- 建立 memory 雙寫機制：CLAUDE.md 詳細、`session_log.md` 高層指針。
- 跑 `npm run test` 取得單元測試基準（52/54 檔、569/596 案）。
- 發現 `src/components/controls/AutoSeq.vue` 是 untracked 新檔，疑似對應 04-blockers 的 AutoSeq 警告。
- 尚未實際跑 E2E。

---

## 5. 重要檔案地圖

- **測試設定**：`vitest.config.ts`、`playwright.config.ts`
- **測試共用**：`tests/pages/_helpers.ts`、`tests/e2e/_mocks.ts`、`tests/e2e/_global-setup.ts`
- **契約來源**：`RWD_Vue_表單組件屬性.md` → `tests/spec-gen/parse-md.cjs` → `tests/spec-gen/manifest.json` → `tests/spec-gen/contract.test.ts`
- **Release blockers 紀錄**：`tests/e2e/04-blockers.spec.ts`
- **Diagnostic 工具**：`tests/e2e/00-diagnostic.spec.ts` → 對每張 demo 頁面產出 `diagnostic/<頁面名>.{json,png}`（sessionStorage.clientInfo / 工具列文字 / table headers / row count / 每一條 console error & warning + 整頁截圖）
- **業務頁面**：`src/pages/bootstrap/2/{客戶資料表,出貨單,員工資料表,應徵人員基本資料表}.vue`
- **外部報告**：`C:\Users\User\AppData\Local\Temp\ClaudeCodeVS_Session\3bdbe0af-489a-4e26-a65d-f3fd4834a447\vue release測試記錄(claude).docx`（解出於 `.claude/docx_extract/`）

---

## 6. 上線最短路徑

```bash
# 1. 刪殘留檔
rm src/pages/bootstrap/SOLUTION1/111.vue

# 2. build 驗
npm run build

# 3. 完整測試
npm test                    # 600 unit + page + contract 全綠
npm run test:e2e:real       # 33 e2e 實打 backend
npm run test:coverage       # 看覆蓋率

# 4. 實機驗 4 張 demo 頁面
#    客戶：登入 → grid → Add → 必填驗證 → 送出
#    出貨：master-detail → 整批新增 → 自動加總 → 送出
#    員工：PromptDialog / Schedule / Creator/Updater
#    應徵：Tabs 切換 / autoseq / family editgrid

# 5. 發 tag 留證據
git tag v0.1.0-rc1
```

---

## 7. 自動化選項（可選）

CLAUDE.md 與 session_log.md 的「自動更新」靠模型自覺。若要強制，可在 `.claude/settings.json` 加 Stop hook。要動手用 `update-config` skill 比較安全。
