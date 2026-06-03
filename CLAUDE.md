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

### 2026-06-03 — 實作 DataGrid `OnTotal` 事件（明細加總帶回主表）+ 修 .md 的 getRow 設值陷阱

**問題**：使用者問「DataForm 內明細 DataGrid 新增資料後，價格欄位要加總 total 回主表 DataForm，這是透過 onTotal 屬性嗎？目前正常嗎？」

**查證**：`.md` 第 69 行確實有 `OnTotal` 事件規格（`onTotal(totalRow, rows)`，加總值變動時觸發），但 **DataGrid.vue 根本沒實作**：props 只宣告 `onBeforeLoad/onLoad/onInsert/onUpdate/onDelete`，**沒有 `onTotal`**，全檔也從沒 `$.invoke(onTotal)`。⇒ 明細加總「帶回主表」這條路在 Vue 是壞的（事件永遠不觸發）。
**第二個坑**：就算事件會觸發，`.md`（舊「DataForm 欄位存取」段 758-761、797-800）教使用者用 `getRow()` 寫回主表——但 [DataForm.vue:1206](src/components/controls/DataForm.vue#L1206) `getRow()` 回傳 `JSON.parse(JSON.stringify(...))` **複本**，寫了不會更新畫面（同 2026-05-21 的 reactivity 通則）。reactive 寫回要走 `currentRow`（expose 的 `currentRow: formState`，[DataForm.vue:1446](src/components/controls/DataForm.vue#L1446)）。

**修法**：
- [DataGrid.vue](src/components/controls/DataGrid.vue)：(1) props 新增 `onTotal: String`；(2) 在既有 watch 群（sort/order/page…旁）加 `watch(footRow, totalRow => { if (props.onTotal && totalRow != null) $.invoke(props.onTotal, totalRow, rows) })`。footRow 是 computed：本機加總每次回傳新物件、totalMode='All' 時 totalRow.value 重新指派，兩者都會讓 watch 觸發；且 computed 只在「有加總的欄位」內容或列數變動時重算，效率 OK。
- [RWD_Vue_表單組件屬性.md](RWD_Vue_表單組件屬性.md)：(1) 「DataForm 欄位存取」「DataPanel 欄位存取」兩段的**設值**範例由 `getRow()` 改成 `currentRow`，並加 ⚠️ 標明 getRow 是複本只能讀；(2) GridColumn 編輯段後新增「明細 DataGrid 加總帶回主表 DataForm（OnTotal）」完整範例（明細欄位 `Total:"sum"` + `OnTotal` → 寫回 `$dfMaster.value.currentRow.合計金額`）。

**驗證**：`npm run build` 通過；contract test 133 passed / 8 skipped；DataGrid 單元測試 **13 passed**（新增 onTotal：加 2 列觸發 totalRow.qty=42、改某列 qty 再次觸發=132，並斷言收到 rows）。**通則**：DataForm 設值一律 `currentRow`（reactive），`getRow()` 只讀；明細→主表加總用明細 DataGrid 的 `OnTotal` 事件寫回主表 `currentRow`。

### 2026-06-03 — 修 DataGrid `export()`：原本誤接套表路徑，改回後端「直接匯出資料集」(exportXlsx)

**問題**：使用者回報 DataGrid 的 `export` 原本是調用 Core_N 後端的 `exportXlsx` 直接把資料匯出，Vue 好像沒支援。

**查證（後端為準）**：`Core_N/EEPGlobal.Core/Provider/FileProvider.cs` 的 `ProcessRequest` 對 `file` 端點有**兩條**獨立 Excel 路徑：
- `mode='exportDataset'` → `ExportXlsx(module, command, columns, title, relation, queryOptions)`（[:41](file:///c:/Work/Core_N/EEPGlobal.Core/Provider/FileProvider.cs)、`DataModule.cs:986`）= **原本的直接匯出**：後端依 module/command + 查詢條件**重新取整份資料集**（不分頁），用欄位 `title` 當表頭。
- `mode='exportFile'` + `type='excel'` → `ExportExcel(id, options)`（ParserHelper）= **套表**，需要範本檔。

**真因**：Vue `DataGrid.export()`（[DataGrid.vue](src/components/controls/DataGrid.vue) 舊 `export:` expose）誤把資料丟去 `exportFile('excel', name, {rows, columns})`，打到套表 handler（不吃 rows+columns，沒範本 → 失敗）。且 `dataApi.ts` **根本沒有** `exportDataset` 函式，這條 mode 從 Vue 無法觸發。

**修法**：
- [dataApi.ts](src/utils/dataApi.ts)：新增 `exportDataset(exportParam)`，POST 到 `file` 端點、`mode='exportDataset'` 帶 `module/command`，物件型別欄位序列化成 JSON（對齊後端 `ToQueryOptions` 與 `JArray.Parse`），回傳 fileName。並加進 return。
- [DataGrid.vue](src/components/controls/DataGrid.vue) `export:` 整段重寫：只送 `columns`（精簡成 `{field,title,width}`）、`title`、`relation`（由 `col.relation.options` 轉成後端期望的 `{field, relation:{valueField,textField,remoteName}}`）+ **目前查詢/排序情境**（whereStr/whereItems/sort/order、或 parentObject 的 parentTable/parentRow；不送 page/rows → 後端匯出全部），改呼叫 `exportDataset`，再用回傳 fileName 組 `/file?q=` 下載。flow 分支用 `isFlow.value ? getFlowWhereItems() : null` 守住（避免非 flow 時呼叫 undefined）。
- [RWD_Vue_表單組件屬性.md](RWD_Vue_表單組件屬性.md)：`export()` 方法說明改寫（標明「整份直接匯出、不需範本，與 exportExcel 套表不同」）+ 新增「export 的 param 參數」小節（name/title/downloadName 皆可選）。

**驗證**：`npm run build` 通過；contract test 133 passed / 8 skipped；DataGrid 單元測試 **12 passed**（新增 `export()` 呼叫 `exportDataset` 且帶 field/title 欄位 + whereStr、不帶 rows 的斷言）。⚠️ 全測試 `npm run test` 有 **7 failed**（`tests/pages/{客戶資料表,員工資料表}.test.ts`）— 已 `git stash` 驗證**與本次無關**（baseline 同樣 7 failed，是 gitignored demo 頁面對不上 page test 的既有問題，見 2026-05-21 條目）。

### 2026-05-21 — 修 .md「預設值是獨立 default 組件」的錯誤（Vue 是寫在 dataform 欄位上）

**問題**：AI 助手依 .md 把「英文姓名預設＝登入者名稱」產成一個獨立 `default` 組件（`組件類別:"default"`, deMaster），Core 報 `'deMaster'的屬性:'columns.defaultValue'不存在`。使用者指出：**Vue 的 default 不是元件，直接寫在 dataform 欄位上**，要我比照原始程式改 .md。

**查證（程式為準）**：`DataForm.vue` 的 `computeDefault()`/`getDefaultValues()` 讀 `column.defaultValue`（[:291](src/components/controls/DataForm.vue#L291),[:1394](src/components/controls/DataForm.vue#L1394)）、`resolveEditorOptions` 讀 `column.required`（[:121](src/components/controls/DataForm.vue#L121)）、驗證讀 `column.validType`（[:867](src/components/controls/DataForm.vue#L867)）。產出的實例 columns 也本來就帶 `defaultValue:'autoseq[...]'`、`required:true`。⇒ defaultValue/required/validType **都是 dataform/datagrid 欄位自身屬性**，根本沒有獨立 default/validate 組件。`computeDefault` 支援的 rule：`constant / varaible / function / row / autoseq / parent`（注意 code 裡 rule 名就是拼錯的 **`varaible`**）。`varaible` 讀 `clientInfo[key]`；附錄 4：`user`=登入者編號、`userName`=登入者名稱 → AI 的值 `varaible['userName']` 其實是對的，錯的只是「做成獨立組件」。

**修法（`RWD_Vue_表單組件屬性.md`）**：
- **C 段（~456）**整段重寫：原本寫「defaultValue 不能寫在 dataform 欄位、必須用獨立 `default`/`validate` 組件」是**舊 RWD/jQuery 的描述、對 Vue 是錯的**。改成：對該 DataForm/DataGrid 本身下 `動作:"更改"`、`組件類別:"dataform"`，於 `屬性設定.columns` 放 `{field, defaultValue}`。範例改成使用者實案（英文姓名＝`varaible['userName']`）。
- `## Default`、`## Validate` 段各加 ⚠️ callout：Vue 沒有獨立組件，是欄位屬性，導向 C 段。
- C 段的 defaultValue 格式補上 `varaible['userName']`（登入者名稱）。

**驗證**：contract test 133 passed / 8 skipped（無回歸；只動文件）。**通則**：Vue 模式要設預設值/必填/驗證 → 對 dataform/datagrid 下 `動作:更改` 把屬性併進 `columns`，**不要**新增 `default`/`validate` 組件（Core 會回「屬性不存在」）。

### 2026-05-21 — 修「性別=女→兵種階級 readonly」無效（真因在 .md 範例 + 缺元件 API，不在實例表單）

**需求**：dataform 編輯，性別=女時「兵種階級」不可輸入、=男時可輸入。AI 助手產到 `應徵人員基本資料表.vue` 的程式無效。

**關鍵認知**：`應徵人員基本資料表.vue` 是 **Core 依 `RWD_Vue_表單組件屬性.md` 自動產生**的實例表單，直接改它沒用（會被重產覆蓋）。**真正要改的是 (A) 規格 .md（讓 Core 產出正確程式）+ (B) 原本的元件 vue 程式（讓機制真的能動）**。我第一輪改實例 .vue 是錯的，已還原。

**AI 產的程式為何無效（4 個錯）**：
1. **`formData` 未定義** → onLoad 一進就 ReferenceError。DataForm onLoad 是 `invoke(onLoad, formState)`（[DataForm.vue:307](src/components/controls/DataForm.vue#L307)），`dfMaster_onLoad(row)` 的 `row` 就是表單資料；AI 捏造了不存在的 `formData`。
2. **`$dfMaster.value.find` 不是函式** → `$dfMaster.value` 是 defineExpose 方法物件，無 find、非欄位陣列。
3. **鎖錯對象** → 兵種階級在 DataPanel `dpgroup_詳細資料`，不歸 dfMaster 直接管。
4. **直接改 raw const 陣列不重繪** → 改原始物件不過 reactive proxy 的 set trap，不觸發更新。
> **根源**：`.md` 本身有 5 處 `setFieldReadonly` 範例就寫著這個壞 pattern（`$dfMaster.value.find(...)` + 直接改 editor.options），AI 只是忠實照抄。

**修法 (A) 元件**（[DataForm.vue](src/components/controls/DataForm.vue)）：新增並 expose `setColumnReadonly(field, readonly)`。它同時掃 `props.columns`（DataForm 直接欄位）與 `panelColumns`（DataPanel 彙整進來的、`reactive([])`，見 [DataForm.vue:228](src/components/controls/DataForm.vue#L228) 與 DataPanel.vue:25 的 `panelColumns.push`）。因為 Vue 對同一原始物件回傳同一 reactive proxy，改 panelColumns 與 DataPanel/BHtmlForm 渲染讀的是同一 proxy → 即時重繪。與既有 `getFlowRow`（[:1137-1139](src/components/controls/DataForm.vue#L1137-L1139)）的 props.columns+panelColumns 查找一致。

**修法 (B) 規格 .md**（`RWD_Vue_表單組件屬性.md`）：
- 5 處壞 `setFieldReadonly` 範例 → 改成委派 `$dfMaster.value.setColumnReadonly(fieldName, isReadonly)`。
- DataForm 方法表新增 `setColumnReadonly(field, readonly)`，並把 `setReadonly` 註記為「整張表」。
- §11 連動範例：釐清 `hideColumn`=整欄隱藏 vs `setColumnReadonly`=保留顯示但不可輸入；新增 D 範例（性別=女→兵種階級不可輸入），用 `nextTick` 處理 DataPanel 欄位首次掛載時序，再 `watch(() => row.性別, apply)`。
- DataPanel 欄位存取段補：切換 panel 內欄位 readonly 走父 `$dfMaster.value.setColumnReadonly(...)`。

**驗證**：`npm run build` 通過；contract test 133 passed / 8 skipped（無回歸）；DataForm 單元測試 18 passed（新增 `setColumnReadonly` 的 expose + toggle + 找不到欄位回 false 測試）。實例 `應徵人員基本資料表.vue` 已還原成原本 AI 產的版本（待 Core 用新 .md 重產即會正確）。

**待辦提醒**：⚠️ `RWD_Vue_表單組件屬性.md` 與 `src/components/controls/DataForm.vue` 改動可進 git，但 `應徵人員基本資料表.vue` 是 gitignored。需請使用者用 Core 依新版 .md **重新產生**該實例表單，新邏輯才會出現在畫面上（且仍要在 port 5173 + Ctrl+Shift+R 驗證，見 memory `runtime_topology.md`）。

**追加（同日，使用者重產後回報）**：切換有效，但**初始預設「女」時沒套唯讀，要切到男再切回女才有效**。根因是 **Switch 編輯器語意**：[Switch.vue:67](src/components/editors/Switch.vue#L67) `isOn = modelValue === onValue`，新增資料時 `row.性別` 是空字串（畫面雖顯示 offValue「女」，但**沒把 '女' 寫進 row**），所以 `row.性別 === '女'` 在初始為 false。修法：判斷改用 **`row.性別 !== '男'`（對 onValue 比較）**，空值/預設才會正確視為女。已更新 .md §11 D 範例（含註解說明），並直接 patch 使用者已重產的實例檔該行供即時驗證。**通則**：switch 連動條件一律對 `onValue` 做反向判斷，不要對 `offValue` 做正向判斷。

### 2026-05-21 — DataGrid rowStyler「無效果」：程式正確，真因是執行/載入來源（多份副本 + 瀏覽器沒重載）

**問題**：使用者在 `客戶資料表.vue` 設 `rowStyler="dgMaster_rowStyler"`（C002 整列改淺紅 `#f8d7da`），畫面無效果，問是設定錯還是載入問題。第一輪我以為是 Bootstrap 把 td 塗白蓋掉 tr 背景，於是把 rowStyle 也套到 td——但**第二輪截圖證明該假設在本 app 不成立**（striped 偶數列的淡紫色是套在 `<tr>` 上、有顯示出來，代表 td 其實透明，tr 背景看得到）。

**真正結論：程式碼是對的，問題在「載入的不是同一份 / 沒重載」。** 查證：
- 寫單元測試（`src/components/controls/__tests__/DataGrid.test.ts` 新增 `rowStyler applies to row cells`）掛載真 DataGrid 餵 C002，斷言渲染出的 `<tr>` 與 `<td>` 都帶 `background-color` → **11/11 通過**。
- `curl http://localhost:5173/src/components/controls/DataGrid.vue` 看 dev server 編譯給瀏覽器的 render function，四個 `rowStyle` 綁定都在 → 伺服器手上是新版。
- `pageApi.ts` `pageFunctions = funcs`，頁面 `__functions` 含 `dgMaster_rowStyler` → `invoke` 找得到、會被呼叫，不會回 undefined。
- ⇒ 唯一可能是**瀏覽器沒重載到新模組**（HMR 對 template 改動偶爾不套用）。解法：5173 分頁 Ctrl+Shift+R；若無效就重跑 `npm run dev`。

**重要環境發現**（已存 memory `runtime_topology.md`）：本機有 **6 份** vue-frontend 副本。使用者從 **port 5173**（vite dev，來源就是本目錄）看畫面；後端 **port 3000**（`Node_N\bin\www_cluster`）服務的靜態建置版在 `Core_N\EEPWebClient.Core\wwwroot\vue-publish\`，**停在 2026-05-07 舊版**（DataGrid 還沒 rowStyler）。要部署版生效需 build 後覆蓋該目錄。

**改動**（仍保留，因為把 rowStyle 套到 td 是更穩健的通用作法）：`DataGrid.vue` 把 `rowStyle(index,row)` 套到 `<tr>` + 三種 `<td>`（checkbox / command / 資料 td 用 `:style="[rowStyle(...), {width}]"`）。`npm run build` 通過。

**測試**：DataGrid 元件測試 11/11 通過。先前提到 `tests/pages/客戶資料表.test.ts` 的 3 案失敗**與本次無關**（stash 後同樣失敗）——磁碟上的 `客戶資料表.vue` 已被改成「只有一個 DataGrid」的 rowStyler 測試版（無 DataForm），但該 page test 仍預期含 DataForm + `htmleditor` 的 master-detail 版本；該頁 gitignored。

### 2026-05-14 — 修側欄子選單無法收合 + 加選單搜尋功能（A 方案：就地過濾 + 自動展開）

**子選單收合 bug 修復**：使用者回報 sidebar 第二層子選單展開後點不動。
- 根因：`src/html/SubMenuItem.vue` 第二層用 Bootstrap `data-bs-toggle="collapse"` 但 `aria-expanded="false"` 寫死、無 `data-bs-parent`、`<SubMenuItem v-for>` 沒 `:key`。Bootstrap collapse plugin 在這種狀態下對同一 trigger 的 toggle 會卡住。
- 修法：移除 Bootstrap data 屬性，改 Vue ref `isExpanded` + 點擊 `toggle()` + `:class="{ show: isExpanded }"`。加 `glyphicon-plus / -minus` 圖示反映狀態。副作用：失去 Bootstrap 展開動畫（直接 show/hide）。

**順便加 sidebar 選單搜尋**（與使用者討論後採 A 方案：就地過濾樹狀結構 + 命中字反白 + 祖先自動展開）：
- 新檔 `src/utils/menuSearch.ts` — 四個純函式 `menuItemMatches` / `hasMatchingDescendant` / `isMenuItemVisible` / `highlightSegments`。
- `src/pages/Main.vue` — sidebar 頂端加 input-group 搜尋框、`menuSearch` ref、`hasAnyMatch` computed（無命中時顯示「找不到符合的項目」）、藍底白字搜尋框樣式 + 黃色 `.menu-search-hit` 高亮（用 `:deep` 穿透 scoped style）。
- `src/html/MenuItem.vue` — 跟著 SubMenuItem 一起改成 Vue-managed collapse（移除 `data-bs-toggle` / `data-bs-parent`），加 `searchQuery` prop、`isVisible` / `effectiveExpanded` / `titleSegments` computed。**副作用**：原本 top-level 用 `data-bs-parent="#menu"` 做 accordion（同時只一個展開），改完後多個 top-level 可同時展開。對搜尋情境合理（多群組有命中就一起開），但跟原本行為不同。
- `src/html/SubMenuItem.vue` — 同模式加 searchQuery、`isVisible`、`effectiveExpanded`、`titleSegments`、把 searchQuery 傳給遞迴子 SubMenuItem。

**搜尋行為設計**：
- 空字串：跟原本一致（第一個 top-level menu 預設展開）。
- 有值：只顯示自身命中或有命中子孫的節點；所有有命中子孫的節點被強制展開（覆蓋使用者手動 `isExpanded`）；命中字段用黃底反白。
- 清空：恢復使用者手動展開狀態。
- 點命中葉節點：照常 `emitter.emit('addTab', item)`。

**Props 寫法注意**：Vue 3.2 不支援 reactive props 解構，所有元件都改用 `const props = defineProps(...)` + `props.x` 存取，避免 searchQuery 不更新。

**驗證**：
- `npm run test` — 57 檔 / 625 passed / 8 skipped，無回歸。
- `npm run build` — 通過、無 error。
- 未做：鍵盤導航（↑↓ Enter）、模糊比對 / ranking、搜尋歷史。視需求再加。

### 2026-05-14 — 統一三個主題下的元件色彩：把寫死藍色全部換成 CSS 變數

**動機**：使用者回報「同一主題下不同元件有色差，比如藍色就有好幾種」。實際盤點 src/ 共有 10+ 種寫死的藍色 hex（#4b8df8、#428bca、#3071a9、#357ebd、#285e8e、#0d6efd、#004ea2、#4a8bd1、#89cdef、#d9edf7、#337ab7、#dfc2f2），分散在「永遠載入」的 `bootstrap_default.css` / `bootstrap-custom.css`，以及五個元件的 scoped style 裡。主題切換器 `vue_*.css` 雖然定義了 `--theme-primary` 等變數、也覆蓋了一部分選擇器，但**沒覆蓋到所有用色點**，所以同一主題下會看到多種藍同時出現。

**修法**：把寫死顏色全改用既有的主題變數，讓三個主題（default / black / violet）各自定義一次顏色就能讓所有元件統一跟著走。
- 主要藍 / 邊框 / hover bg / 圖示色（`#4b8df8` / `#428bca` / `#3071a9` / `#357ebd` / `#285e8e` / `#0d6efd` / `#004ea2` / `#4a8bd1` / `#337ab7`）→ `var(--theme-primary)`
- 淡色 tint 背景（`#89cdef` / `#d9edf7` / `#dfc2f2`）→ `var(--theme-table-bg)`

**異動檔**：
- `src/assets/stylesheets/main.css` — 頂端新增 `:root` 預設值，確保 Logon 等 Main 外頁面也有變數可用（之前主題切換器只在 Main 掛載後才注入）。
- `src/assets/stylesheets/themes/bootstrap_default.css` — 12 處寫死藍色全換成 `var(--theme-*)`。
- `src/assets/stylesheets/bootstrap-custom.css` — `a` 連結色、`.table.info`、`.nav-pills active badge` 三處。
- `src/components/editors/Switch.vue:201` — toggle ON 狀態背景色。
- `src/components/editors/Autocomplete.vue:193` — dropdown hover 字色。
- `src/components/editors/Options.vue:614-615` — checked 按鈕 border/bg（原本是 `var(--bs-primary, #0d6efd)`，與其他元件不同源）。
- `src/components/controls/ChatPanel.vue:426` — user 訊息泡泡背景。
- `src/components/controls/Tree.vue:194` — Tree 標題欄背景（原本寫死成紫色 #dfc2f2，在 default/black 主題下會嚴重突兀）。

**刻意保留不動**：
- `Card.vue:228-234`、`SignatureModal.vue:105`、`MyfavorModal.vue:102`、`AgentSetting.vue:289` — 這些是「使用者選色票」用的調色盤（red/orange/blue/green/yellow/purple/gray），不該被主題覆蓋。
- `Account.vue`、`ChangePassword.vue` — 獨立登入流程頁，非 Main 內元件。
- `bootstrap_blue.css` / `bootstrap_violet.css` / `bootstrap_yellow.css` / `bootstrap_black.css` — Main.vue 的 themeMap 沒有對應，這四個檔目前是 dead code。
- 非藍色語意指標：flow-status 紅/綠、`#0bc7b6` accent、`#fbff52` highlight 等。

**驗證**：
- `npm run test` — 57 檔 / 625 passed / 8 skipped（與基準完全一致，無回歸）。
- `npm run dev` 起 5173 啟動正常無 error log。
- 未做螢幕視覺 diff（沒做 visual regression baseline），但因為改動全是 CSS 變數替換、沒動 JS / DOM 結構，回歸風險低。release 前手動驗 4 張 demo 頁面建議順便切換三個主題各看一次。

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
