# vue-frontend

EEP 後端搭配的 RWD Vue 表單組件庫 + 4 張 demo 業務頁面。

## Quick Start

```bash
npm install
npm run dev          # http://localhost:5173
```

`/api/*` 會自動 proxy 到 `vite.config.js` 設定的 EEP 後端（預設 `https://localhost:44368`）。

## 常用指令

| 指令 | 用途 |
|---|---|
| `npm run dev` | dev server (5173)，含 HMR |
| `npm run build` | 產 production dist |
| `npm run preview` | 起 dist preview (4173)，驗證發佈版本 |
| `npm run test` | vitest 一次（unit + page + contract，~625 cases） |
| `npm run test:e2e` | Playwright（mock backend） |
| `npm run test:e2e:real` | Playwright 打真實 EEP 後端 |
| `npm run test:e2e:preview` | Playwright 對 preview build + 真實後端，**release 前驗證用** |

## 發佈與驗證

完整流程、`.env` 注意事項、E2E real backend 起法、發佈前檢查清單見 [DEPLOY.md](./DEPLOY.md)。

⚠️ **常踩的坑**：`.env` 的 `VITE_APP_API_URL` 必須留空，**不要寫死後端 URL**。寫死會讓 build 後 axios 繞過 vite proxy → 跨來源 → 後端不回 CORS → 登入閃一下又被踢回 logon。詳見 [DEPLOY.md §2 .env 設定](./DEPLOY.md#2-env-設定)。

## 專案結構

```
src/
├── components/
│   ├── controls/      # DataGrid / DataForm / Schedule / Tree ...
│   ├── editors/       # Datebox / Combobox / Refval / Signature ...
│   ├── elements/      # BButton / BEditor / BField / BTableCell
│   └── html/          # NavItem / MenuItem / TabPane ...
├── composables/       # useFieldFromDom / useValidator
├── pages/
│   ├── Logon.vue      # /logon
│   ├── Main.vue       # /main (主框架 + sidebar)
│   ├── bootstrap/2/   # 4 張 demo 業務頁面（客戶 / 出貨 / 員工 / 應徵）
│   └── ...
├── utils/             # pageApi / dataApi / logonApi / messageApi / mainApi
├── router/            # 用 unplugin-vue-router auto-routes
└── main.js
```

## 測試體系（4 層）

| 層 | 框架 | 範圍 |
|---|---|---|
| L1 Component unit | vitest + jsdom | 30 個元件 + 5 個 composable |
| L2 Page-level | vitest + auto-import stubs | 4 張 demo 頁面 |
| L3 Spec-driven contract | vitest | 由 `RWD_Vue_表單組件屬性.md` 產生的 API 契約測試 |
| L4 E2E | Playwright | 33 specs，dev / preview 都能跑 |

## 規格文件

`RWD_Vue_表單組件屬性.md` — 元件屬性與方法表，是 L3 contract test 的來源。改 .md 後 contract test 會自動跟著驗證實作有沒有對齊規格。
