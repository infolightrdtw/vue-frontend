/* =========================================================================


   SYS 系列畫面（Views/Main 下的 Sysusers / Sysgroups / …）是 Core 後端的
   jQuery Razor view，不是 Vue，所以收不到 Vue 的主題系統（theme-base.css +
   vue_*.css 的 CSS 變數）。但 SYS iframe 與主框架「同源」（dev 都在 5173、
   Core-hosted build 同 Core 源），父視窗可直接存取 iframe.contentDocument，
   於是這裡：
     1) 把該主題的 7 個 --theme-* 變數寫到 iframe 的 <html> inline style；
     2) 注入一段 override CSS（id=vue-theme-bridge），用那些變數對 SYS 頁面實際
        用到的 bootstrap/infolight class（.datagrid-title / .datagrid-btn /
        .modal-header / .btn-primary / .bootstrap-datagrid / .pagination …）著色，
        bs3 與 bs5 兩種結構都涵蓋。
   變數值與 src/assets/stylesheets/themes/vue_*.css 保持一致（單一真相在那邊，
   這裡是給跨 document 的 SYS 頁面用的鏡像）。
   ========================================================================= */

type ThemeVars = Record<string, string>

export const SYS_THEME_VARS: Record<string, ThemeVars> = {
    default: {
        '--theme-title-grad-start': '#368dff', '--theme-title-grad-end': '#000ad3',
        '--theme-primary': '#000ad3', '--theme-primary-hover': '#00079c',
        '--theme-table-bg': '#d6ecff', '--theme-row-selected': '#76b2e0',
        '--theme-focus-ring': 'rgba(0,10,211,.25)'
    },
    black: {
        '--theme-title-grad-start': '#5b6068', '--theme-title-grad-end': '#1f2329',
        '--theme-primary': '#1f2329', '--theme-primary-hover': '#2e333d',
        '--theme-table-bg': '#f5f6f8', '--theme-row-selected': '#aab1bd',
        '--theme-focus-ring': 'rgba(31,35,41,.30)'
    },
    violet: {
        '--theme-title-grad-start': '#a76ac6', '--theme-title-grad-end': '#6400a3',
        '--theme-primary': '#6400a3', '--theme-primary-hover': '#4d007b',
        '--theme-table-bg': '#faeeff', '--theme-row-selected': '#c594de',
        '--theme-focus-ring': 'rgba(100,0,163,.25)'
    },
    green: {
        '--theme-title-grad-start': '#42b883', '--theme-title-grad-end': '#2c8a64',
        '--theme-primary': '#2c8a64', '--theme-primary-hover': '#1f6e4f',
        '--theme-table-bg': '#f3faf6', '--theme-row-selected': '#92d4b3',
        '--theme-focus-ring': 'rgba(44,138,100,.25)'
    },
    indigo: {
        '--theme-title-grad-start': '#7a9bbf', '--theme-title-grad-end': '#4a6580',
        '--theme-primary': '#4a6580', '--theme-primary-hover': '#3a4f64',
        '--theme-table-bg': '#eef3f8', '--theme-row-selected': '#8baecb',
        '--theme-focus-ring': 'rgba(74,101,128,.22)'
    },
    mauve: {
        '--theme-title-grad-start': '#b29ec0', '--theme-title-grad-end': '#6e547d',
        '--theme-primary': '#6e547d', '--theme-primary-hover': '#553f60',
        '--theme-table-bg': '#f5f0f7', '--theme-row-selected': '#b89bcd',
        '--theme-focus-ring': 'rgba(110,84,125,.22)'
    }
}

/* 給 SYS jQuery 頁面的 override CSS。選擇器對齊 Views/Main 下 SYS view 實際
   渲染的 class，bs3（li.active>a）與 bs5（.page-item .page-link）都覆蓋。 */
const BRIDGE_CSS = `
/* 標題列 */
.datagrid-title{
  background: linear-gradient(to bottom, var(--theme-title-grad-start), var(--theme-title-grad-end)) !important;
  color:#fff !important; border:0 !important;
}
/* 工具列按鈕（Insert / Query / 自訂） */
.datagrid-toolitem .datagrid-btn,
.datagrid-toolitem .btn.datagrid-btn{
  background: var(--theme-primary) !important;
  border-color: var(--theme-primary) !important;
  color:#fff !important;
}
/* input-group 內的查詢圖示鈕 */
.input-group-btn > .btn.form-btn,
.input-group .form-btn{
  background: var(--theme-primary) !important;
  border-color: var(--theme-primary) !important;
  color:#fff !important;
}
/* Modal / Dialog header（SYS 用 .modal-header.bg-primary + .text-default 白字） */
.modal-header,
.modal-header.bg-primary{
  background: linear-gradient(to bottom, var(--theme-title-grad-start), var(--theme-title-grad-end)) !important;
  color:#fff !important;
  border-bottom: 1px solid var(--theme-primary) !important;
}
.modal-header .modal-title,
.modal-header .modal-title.text-default,
.modal-header .close,
.modal-header .close span{ color:#fff !important; text-shadow:0 1px 0 rgba(0,0,0,.2); }
/* 主要按鈕 */
.btn-primary, .btn.btn-primary{
  background: var(--theme-primary) !important; background-image:none !important;
  border-color: var(--theme-primary) !important; color:#fff !important;
}
.btn-primary:hover, .btn.btn-primary:hover,
.btn-primary:focus, .btn.btn-primary:focus,
.btn-primary:active, .btn.btn-primary:active,
.btn-primary.active, .btn.btn-primary.active{
  background: var(--theme-primary-hover) !important;
  border-color: var(--theme-primary-hover) !important; color:#fff !important;
}
/* DataGrid 表頭 + 內容 tint */
.bootstrap-datagrid > thead > tr > th{
  background: linear-gradient(to bottom, var(--theme-title-grad-start), var(--theme-title-grad-end)) !important;
  color:#fff !important; border-bottom-color: var(--theme-primary) !important;
}
.bootstrap-datagrid.table-striped > tbody > tr:nth-of-type(odd) > td,
.bootstrap-datagrid.table-striped > tbody > tr:nth-of-type(odd) > th{
  background-color: var(--theme-table-bg) !important;
}
.bootstrap-datagrid.table-hover > tbody > tr:hover > td,
.bootstrap-datagrid.table-hover > tbody > tr:hover > th{
  background-color: var(--theme-table-bg) !important;
}
.bootstrap-datagrid > tbody > tr.info > td,
.bootstrap-datagrid > tbody > tr.info > th,
.bootstrap-datagrid > tbody > tr.selected > td,
.bootstrap-datagrid > tbody > tr.selected > th{
  background-color: var(--theme-row-selected) !important;
}
/* 分頁 active（bs3：li.active>a/span） */
.pagination > li.active > a,
.pagination > li.active > span,
.pagination > li.active > a:hover,
.pagination > li.active > a:focus{
  background-color: var(--theme-primary) !important;
  border-color: var(--theme-primary) !important; color:#fff !important;
}
.pagination > li > a{ color: var(--theme-primary) !important; }
/* 分頁 active（bs5：.page-item .page-link） */
.pagination .page-item.active .page-link{
  background-color: var(--theme-primary) !important;
  border-color: var(--theme-primary) !important; color:#fff !important;
}
.pagination .page-item:not(.active):not(.disabled) .page-link{ color: var(--theme-primary) !important; }
/* 列命令鈕（檢視/編輯/刪除）— jQuery 版是 <button class="btn-link datagrid-btn">
   內含 glyphicon-eye-open / -pencil / -remove；bs5 相容腳本會把部分換成
   fa + .text-primary。藍色來自 .btn-link 連結色與 .text-primary，全部改主題色。 */
.datagrid-command .btn-link,
.datagrid-command .btn-link.datagrid-btn,
.datagrid-command .btn-link .glyphicon,
.datagrid-command .btn-link .fa,
.datagrid-command .btn-link .text-primary,
.datagrid-command .text-primary{
  color: var(--theme-primary) !important;
}
.datagrid-command .btn-link:hover,
.datagrid-command .btn-link.datagrid-btn:hover,
.datagrid-command .btn-link:hover .glyphicon,
.datagrid-command .btn-link:hover .fa{
  color: var(--theme-primary-hover) !important;
}
/* 欄位 focus */
.form-control:focus, .form-select:focus{
  border-color: var(--theme-primary) !important;
  box-shadow: 0 0 0 .15rem var(--theme-focus-ring) !important;
}
/* lc-switch ON 狀態 */
.lcs_switch.lcs_on{ background: var(--theme-primary) !important; }
`

/** 把指定主題套到一個 SYS iframe（同源才有效；跨源/未載入完成會靜默略過）。 */
export function applyThemeToSysFrame(frame: HTMLIFrameElement | null | undefined, themeName: string) {
    try {
        const doc = frame?.contentDocument
        if (!doc || !doc.documentElement) return
        const vars = SYS_THEME_VARS[themeName] || SYS_THEME_VARS.default
        const root = doc.documentElement
        for (const [k, v] of Object.entries(vars)) {
            root.style.setProperty(k, v)
        }
        let style = doc.getElementById('vue-theme-bridge') as HTMLStyleElement | null
        if (!style) {
            style = doc.createElement('style')
            style.id = 'vue-theme-bridge'
            doc.head.appendChild(style)
        }
        if (style.textContent !== BRIDGE_CSS) {
            style.textContent = BRIDGE_CSS
        }
    } catch {
        /* 跨源或 document 尚未就緒，忽略 */
    }
}

/** 目前主題名（與 Main.vue stateManager 的 localStorage key 一致）。 */
export function getCurrentThemeName(): string {
    try {
        return localStorage.getItem('user-theme') || 'default'
    } catch {
        return 'default'
    }
}
