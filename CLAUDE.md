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
> 本機實測：2026-05-07（**發現 2 支 page test 出現回歸，需驗證**）

### 累積成果（vs 起點）
| 指標 | 起點 | 報告現在 | 本機實測 |
|---|---|---|---|
| 測試檔案 | 26 | 57+ | 54（含 node_modules 之外） |
| 單元/頁面/契約 案例 | 210 | 600 passed + 23 todo + 8 skip | 569 passed / 27 skipped |
| E2E specs | 0 | 33 passed（real backend strict） | 未跑 |
| 覆蓋率 | n/a | 56.53% statements | 未跑 |
| Production deps 漏 | 7 | 0 | — |
| Spec ↔ code 不一致 | 28 | 23（KNOWN_GAPS） | — |
| 會 crash 的 release blocker | 4 | 0 | — |

### ⚠️ 本機跑 `npm run test` 的回歸
- `tests/pages/出貨單.test.ts` — `beforeEach` 30s timeout，10/10 全 skip
- `tests/pages/員工資料表.test.ts` — `beforeEach` 30s timeout，9/9 全 skip
- 3 筆 `UNKNOWN: open ...AppData\Local\Temp\C42_...`（Windows tmp 鎖檔，疑似防毒或 vite cache 競爭）
- 干擾 stderr：Refval `pageApi.ts:52` jsdom navigation；Signature canvas getContext；Label onClick 字串

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
- [ ] **驗證 page test 回歸** — 釐清 `tests/pages/出貨單.test.ts` 與 `員工資料表.test.ts` 的 `beforeEach` timeout 是真的回歸，還是 Windows tmp 鎖檔造成。看 `_helpers.ts mountPage` 卡在哪、是哪個 child auto-import 卡住。
- [ ] **處理 3 筆 `UNKNOWN: open` unhandled error**（Windows tmp 鎖檔）— 檢查防毒排除、考慮 `pool: 'forks'` 或調整 cache.dir。
- [ ] **刪 `src/pages/bootstrap/SOLUTION1/111.vue`** — release 前殘留檔，`npm run build` 必須通。
- [ ] **commit 散落的 40+ 個 .vue 修改 + vitest.config.ts + package.json/lock + components.d.ts + typed-router.d.ts + RWD_Vue_表單組件屬性.md** — 目前 working tree 混亂，分組 commit 才能對應到 release blocker 修復。
- [ ] **處理 untracked**：`src/components/controls/AutoSeq.vue`（疑似 AutoSeq 修復）、`playwright.config.ts`、`diagnostic/`、`.claude/`。

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
