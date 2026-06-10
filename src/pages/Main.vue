<template>
    <div class="d-flex flex-column vh-100 main" :class="{ 'sidebar-collapsed': !isSideShow }">
        <!-- Navbar -->
        <nav class="navbar navbar-dark px-3 topbar">
            <a class="navbar-brand d-flex align-items-center">
                <img :src="currentLogo" height="40" class="me-2" />
            </a>
            <div class="ms-auto dropdown">
                <a class="user-name dropdown-toggle" href="javascript:void(0)" role="button" @click="toggleContextmenu">
                    {{ $.clientInfo.value.userName }}
                </a>
                <ul :class="contextmenuCls">
                    <li>
                        <a class="dropdown-item" href="javascript:void(0)" @click="changePassword">
                            <i class="bi bi-key me-2"></i>修改密碼
                        </a>
                    </li>

                    <li>
                        <a class="dropdown-item" href="javascript:void(0)" @click="viewSignature">
                            <i class="glyphicon glyphicon-pencil me-2"></i>查看簽名
                        </a>
                    </li>

                    <li>
                        <a class="dropdown-item" href="javascript:void(0)" @click="agentSetting">
                            <i class="glyphicon glyphicon-user me-2"></i>代理設定
                        </a>
                    </li>

                    <li>
                        <a class="dropdown-item" href="javascript:void(0)" @click="myFavorites">
                            <i class="bi bi-star me-2"></i>我的最愛
                        </a>
                    </li>

                    <li class="position-relative">
                        <a class="dropdown-item d-flex align-items-center"
                           href="javascript:void(0)"
                           @click.stop="toggleThemeMenu">
                            <i class="bi bi-chevron-left me-2" style="font-size: 12px;"></i>
                            <span><i class="bi bi-palette me-2"></i>主題</span>
                        </a>

                        <ul class="dropdown-menu"
                            :class="{ show: isShowThemeMenu }"
                            style="position: absolute; top: 0; right: 100%; margin-top: -5px; min-width: 100px;">
                            <li v-for="item in themeList" :key="item">
                                <a class="dropdown-item" href="javascript:void(0)" @click="changeTheme(item)">
                                    {{ item }}
                                </a>
                            </li>
                        </ul>
                    </li>

                    <li class="position-relative">
                        <a class="dropdown-item d-flex align-items-center"
                           href="javascript:void(0)"
                           @click.stop="toggleLanguageMenu">
                            <i class="bi bi-chevron-left me-2" style="font-size: 12px;"></i>
                            <span><i class="fa fa-language me-2"></i>語言</span>
                        </a>

                        <ul class="dropdown-menu"
                            :class="{ show: isShowLanguageMenu }"
                            style="position: absolute; top: 0; right: 100%; margin-top: -5px; min-width: 120px;">
                            <li v-for="lang in languageList" :key="lang.value">
                                <a class="dropdown-item" href="javascript:void(0)" @click="changeLanguage(lang.value)">
                                    {{ lang.name }}
                                </a>
                            </li>
                        </ul>
                    </li>

                    <li><hr class="dropdown-divider"></li>

                    <li>
                        <a class="dropdown-item" href="javascript:void(0)" @click="logoutUser">
                            <i class="bi bi-box-arrow-right me-2"></i>登出
                        </a>
                    </li>
                </ul>
            </div>
        </nav>

        <div class="flex-grow-1 d-flex overflow-hidden">
            <!-- Sidebar -->
            <aside :class="siderCls">
                <div class="divToggle">
                    <span :class="toggleSideCls" @click="toggleSide"></span>
                </div>
                <div v-show="isSideShow" class="menu-search-wrap">
                    <div class="input-group input-group-sm">
                        <span class="input-group-text menu-search-icon">
                            <i class="bi bi-search"></i>
                        </span>
                        <input v-model="menuSearch"
                               type="search"
                               class="form-control menu-search-input"
                               placeholder="搜尋選單..." />
                    </div>
                    <div v-if="menuSearch && !hasAnyMatch" class="menu-search-empty">找不到符合的項目</div>
                </div>
                <div v-show="isSideShow" class="panel-group accordion" id="menu" role="tablist" aria-multiselectable="true">
                    <MenuItem v-for="(menu, index) in menus"
                              :key="menu.id || index"
                              parentMenu="menu"
                              :item="menu"
                              :active="index == 0"
                              :activeTabId="activeTabId"
                              :searchQuery="menuSearch" />
                </div>
            </aside>

            <!-- Main Content -->
            <main class="flex-grow-1 overflow-auto d-flex flex-column main-container">
                <ul class="nav nav-pills">
                    <NavItem v-for="tab in openedTabs" :item="tab" :key="tab.id" :root="$this" />
                </ul>
                <div class="tab-content flex-grow-1 position-relative">
                    <template v-for="tab in openedTabs" :key="tab.id">

                        <div v-if="tab.component"
                             v-show="tab.active"
                             class="h-100 w-100 bg-white"
                             style="position: absolute; top: 0; left: 0; z-index: 10;">
                            <component :is="tab.component" :theme="currentTheme" />
                        </div>

                        <TabPaneIframe v-else
                                       v-show="tab.active"
                                       :item="tab"
                                       :root="$this" />

                    </template>
                </div>
            </main>
        </div>
    </div>
    <MyFavorites ref="myFavoritesRef" :menus="menus" :theme="currentTheme" />
    <SignatureModal ref="signatureModalRef" :theme="currentTheme" />
</template>

<script lang="ts" setup>
    import { ref, computed, onMounted, onUnmounted, watch, provide } from 'vue'
    import axios from 'axios'
    import pageUtils from '@/utils/pageApi'
    import { isMenuItemVisible } from '@/utils/menuSearch'
    import ChangePassword from './ChangePassword.vue'
    import SignatureModal from '@/pages/SignatureModal.vue'
    import MyFavorites from '@/pages/MyfavorModal.vue'
    import AgentSetting from '@/pages/main/AgentSetting.vue'

    import defaultThemeUrl from '@/assets/stylesheets/themes/vue_default.css?url'
    import blackThemeUrl from '@/assets/stylesheets/themes/vue_black.css?url'
    import violetThemeUrl from '@/assets/stylesheets/themes/vue_violet.css?url'
    import greenThemeUrl from '@/assets/stylesheets/themes/vue_green.css?url'
    import indigoThemeUrl from '@/assets/stylesheets/themes/vue_indigo.css?url'
    import mauveThemeUrl from '@/assets/stylesheets/themes/vue_mauve.css?url'

    import defaultLogo from '@/assets/images/logo-infolight.png'
    import defaultBg from '@/assets/images/bg_main.png'

    const __functions = {}
    const __controls = {}
    const $this = pageUtils(__functions, __controls)
    const $ = $this

    const currentLogo = ref(defaultLogo)
    const currentHomeBg = ref(defaultBg)
    const homeBgImage = computed(() => `url(${currentHomeBg.value})`)

    import mainUtils from '@/utils/mainApi'
    const {
        logout,
        toggleContextmenu,
        menus,
        openedTabs,
        isShowContextmenu
    } = mainUtils()

    const isSideShow = ref(true)
    const menuSearch = ref('')
    const hasAnyMatch = computed(() => {
        if (!menuSearch.value) return true
        return menus.some((m: any) => isMenuItemVisible(m, menuSearch.value))
    })

    function toggleSide() {
        isSideShow.value = !isSideShow.value
    }

    const siderCls = computed(() => ['sidebar text-white flex-shrink-0 d-block', isSideShow.value ? '' : 'min'])
    const toggleSideCls = computed(() => ['sidebar-toggle glyphicon', isSideShow.value ? 'glyphicon-arrow-left' : 'glyphicon-arrow-right'])
    const contextmenuCls = computed(() => ['dropdown-menu dropdown-menu-end', isShowContextmenu.value ? 'show' : ''])
    const activeTabId = computed(() => {
        const activeTab = openedTabs.find((t: any) => t.active);
        return activeTab ? activeTab.id : null;
    });

    /* Sidebar accordion state — Vue-managed so a heading can be toggled
       shut by clicking the same heading, and so clicks outside the
       sidebar can collapse every open group at once. */
    const sidebarOpenId = ref<any>(null);
    provide('sidebarAccordion', {
        activeId: sidebarOpenId,
        setActive: (id: any) => { sidebarOpenId.value = id; }
    });

    async function logoutUser() {
        await logout()
        window.sessionStorage.removeItem('clientInfo')
        window.location.href = `/logon${window.location.search}`
        //router.push('/logon')
    }

    function changePassword() {
        const tabId = 'changeP';

        let existingTab = openedTabs.find((t: any) => t.id === tabId);

        if (!existingTab) {
            existingTab = {
                id: tabId,
                name: 'ChangePassword',
                text: '修改密碼',
                active: true,
                canClose: true,
                component: ChangePassword
            };
            openedTabs.push(existingTab);
        }

        for (let i = 0; i < openedTabs.length; i++) {
            openedTabs[i].active = (openedTabs[i].id === tabId);
        }
        isShowContextmenu.value = false;
    }

    const themeMap: Record<string, string> = {
        'default': defaultThemeUrl,
        'black': blackThemeUrl,
        'violet': violetThemeUrl,
        'green': greenThemeUrl,
        'indigo': indigoThemeUrl,
        'mauve': mauveThemeUrl
    };

    const themeList = Object.keys(themeMap);
    const isShowThemeMenu = ref(false);

    function toggleThemeMenu() {
        isShowThemeMenu.value = !isShowThemeMenu.value;
        if (isShowThemeMenu.value) {
            isShowLanguageMenu.value = false;
        }
    }

    const currentTheme = ref('default');
    function changeTheme(themeName: string) {
        applyThemeToDocument(themeName);

        stateManager.set('theme', themeName);
        currentTheme.value = themeName;

        document.querySelectorAll('iframe').forEach(f => {
            f.contentWindow?.postMessage({ type: 'THEME_CHANGE', theme: themeName }, '*');
        });

        isShowThemeMenu.value = false;
        isShowContextmenu.value = false;
    }

    function applyThemeToDocument(themeName: string) {
        const linkId = 'dynamic-theme-style';
        let link = document.getElementById(linkId) as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        const targetUrl = themeMap[themeName];
        if (targetUrl) link.href = targetUrl;
    }

    const languageList = [
        { name: 'English', value: 'en-us' },
        { name: '中文繁體', value: 'zh-tw' },
        { name: '中文简体', value: 'zh-cn' },
        { name: '中文香港', value: 'zh-hk' },
        { name: '日本語', value: 'ja-jp' },
        { name: '한국어', value: 'ko-kr' },
        { name: 'Other1', value: 'it1' },
        { name: 'Other2', value: 'it2' }
    ];
    function toggleLanguageMenu() {
        isShowLanguageMenu.value = !isShowLanguageMenu.value;
        if (isShowLanguageMenu.value && typeof isShowThemeMenu !== 'undefined') {
            isShowThemeMenu.value = false;
        }
    }
    const isShowLanguageMenu = ref(false);

    async function changeLanguage(langValue: string) {
        stateManager.set('language', langValue);

        try {
            await axios.post('/api/ApiMain/data', {
                mode: 'setClientInfo',
                key: 'locale',
                value: langValue
            });
        } catch (e) {
            console.error('API Sync Error', e);
        } finally {
            window.location.reload();
        }
    }

    const signatureModalRef = ref<InstanceType<typeof SignatureModal> | null>(null)

    function viewSignature() {
        signatureModalRef.value?.open()
        isShowContextmenu.value = false;
    }

    function agentSetting() {
        const tabId = 'agentSetting';
        let existingTab = openedTabs.find((t: any) => t.id === tabId);

        if (!existingTab) {
            existingTab = {
                id: tabId,
                name: 'AgentSetting',
                text: '代理設定',
                active: true,
                canClose: true,
                component: AgentSetting
            };
            openedTabs.push(existingTab);
        }

        openedTabs.forEach(t => t.active = (t.id === tabId));
        isShowContextmenu.value = false;
    }

    const myFavoritesRef = ref<InstanceType<typeof MyFavorites> | null>(null)

    function myFavorites() {
        myFavoritesRef.value?.open();

        isShowContextmenu.value = false;
    }


    const stateManager = {
        get: (key, defaultValue) => localStorage.getItem(`user-${key}`) || defaultValue,

        set: (key, value) => {
            localStorage.setItem(`user-${key}`, value);

            const clientInfoStr = sessionStorage.getItem('clientInfo');
            if (clientInfoStr) {
                const info = JSON.parse(clientInfoStr);
                info[key === 'language' ? 'locale' : key] = value;
                sessionStorage.setItem('clientInfo', JSON.stringify(info));
            }

            if (key === 'language') {
                document.cookie = `rwdLanguage=${value};path=/;max-age=31536000`;
            }
        }
    };

    // --- 接收子表單 (Iframe) 的 PostMessage 指令 ---
    function handleMessage(event: MessageEvent) {
        const data = event.data;
        if (!data) return;

        if (data.type === 'THEME_CHANGE' && data.theme) {
            changeTheme(data.theme);
        }
        if (data.method === 'toggleSide' && data.action === 'close') {
            isSideShow.value = false;
        }
        if (data && data.method === 'toggleSide' && data.action === 'close') {
            isSideShow.value = false;
        }

        if (data.type === 'UPDATE_BRANDING') {
            if (data.logo) currentLogo.value = data.logo;
            if (data.bg) currentHomeBg.value = data.bg;
        }

        if (data.method == 'refreshCount') {
            openedTabs.find(t => t.name == 'flowpage').count = data.count;
        }
    }

    // When the parent contextmenu closes, also reset its fly-out submenus so they
    // don't auto-reappear in their previous open state next time.
    watch(isShowContextmenu, (open) => {
        if (!open) {
            isShowThemeMenu.value = false;
            isShowLanguageMenu.value = false;
        }
    });

    // Close any open dropdown / sidebar accordion when clicking outside.
    function handleDocumentClick(e: MouseEvent) {
        const target = e.target as HTMLElement | null;
        const inDropdown = !!(target && target.closest('.dropdown'));
        const inSidebar  = !!(target && target.closest('.sidebar'));

        if (!inDropdown) {
            if (isShowContextmenu.value)  isShowContextmenu.value  = false;
            if (isShowThemeMenu.value)    isShowThemeMenu.value    = false;
            if (isShowLanguageMenu.value) isShowLanguageMenu.value = false;
        }
        if (!inSidebar) {
            if (sidebarOpenId.value !== null) sidebarOpenId.value = null;
            // Also drop browser focus / blue outline left on the last-clicked item
            const ae = document.activeElement as HTMLElement | null;
            if (ae && ae.closest && ae.closest('.sidebar')) ae.blur();
        }
    }

    onMounted(() => {
        const savedTheme = stateManager.get('theme', 'default');
        changeTheme(savedTheme);

        window.addEventListener('message', handleMessage);
        document.addEventListener('click', handleDocumentClick);
    });

    onUnmounted(() => {
        window.removeEventListener('message', handleMessage);
        document.removeEventListener('click', handleDocumentClick);
    });
</script>

<style scoped>
    /* ============================================================
       Outer framework — theme-aware via CSS variables defined in
       the active theme file (themes/vue_*.css). Falls back to
       sensible defaults if no theme is loaded.
       ============================================================ */
    .main {
        --sidebar-width: clamp(200px, 18vw, 320px);
        /* fallbacks for when theme not yet loaded */
        --fw-grad-start: var(--theme-title-grad-start, #368dff);
        --fw-grad-end:   var(--theme-title-grad-end,   #000ad3);
        --fw-primary:    var(--theme-primary,          #000ad3);
        --fw-hover-bg:   var(--theme-table-bg,         #d6ecff);
        --fw-chrome:     var(--theme-primary,          #000ad3);
    }
    .main.sidebar-collapsed {
        --sidebar-width: 18px;
    }

    /* ===== Topbar =====
       Right portion is plain white. The left "chrome" portion is a real
       absolutely-positioned ::before whose `width` resolves the var — so
       it transitions smoothly together with .sidebar's width. */
    .topbar {
        position: relative;
        background: #ffffff;
        border-bottom: 1px solid rgba(0, 0, 0, .06);
        padding-top: .35rem;
        padding-bottom: .35rem;
    }
    .topbar::before {
        content: "";
        position: absolute;
        top: 0; left: 0; bottom: 0;
        width: var(--sidebar-width);
        background-color: var(--fw-chrome);
        transition: width .25s ease, background-color .35s ease;
        z-index: 0;
    }
    .topbar > * { position: relative; z-index: 1; }
    .topbar :deep(.navbar-brand) {
        transition: opacity .2s ease, transform .25s ease;
        transform-origin: left center;
    }
    .main.sidebar-collapsed .topbar :deep(.navbar-brand) {
        opacity: 0;
        transform: scaleX(.4);
        pointer-events: none;
    }

    .user-name {
        color: var(--fw-primary) !important;
        font-weight: 600;
        padding: .35rem .85rem;
        border-radius: .375rem;
        text-decoration: none;
        transition: background-color .15s ease, color .15s ease;
    }
    .user-name:hover,
    .user-name:focus {
        background-color: rgba(0, 0, 0, .05);
    }
    .user-name.dropdown-toggle::after {
        margin-left: .4em;
        vertical-align: .15em;
    }

    /* ===== Dropdown (contextmenu + theme/language fly-outs) ===== */
    .dropdown-menu {
        right: 0;
        min-width: 180px;
        border: 1px solid rgba(0, 0, 0, .08);
        border-radius: .5rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, .12);
        padding: .35rem;
        margin-top: .35rem;
    }
    .dropdown-item {
        border-radius: .375rem;
        padding: .5rem .75rem;
        color: #333;
        transition: background-color .15s ease, color .15s ease;
    }
    .dropdown-item:hover,
    .dropdown-item:focus {
        background-color: var(--fw-hover-bg);
        color: var(--fw-primary);
    }
    .dropdown-item:active,
    .dropdown-item.active {
        background-color: var(--fw-primary);
        color: #fff;
    }
    .dropdown-divider {
        margin: .35rem 0;
        border-top-color: rgba(0, 0, 0, .08);
    }

    /* ===== Sidebar =====
       Width resolves the same var as topbar::before, so both transition
       together. Background image uses mix-blend-mode so it tints with the
       theme colour automatically. Outer overflow stays hidden (keeps the
       artwork in place) but the menu list inside scrolls when it overflows.
       !important on display/flex-direction beats Bootstrap's .d-block utility
       class that's also on the same element via siderCls. */
    .sidebar {
        background-color: var(--fw-chrome);
        position: relative;
        overflow: hidden;
        width: var(--sidebar-width);
        transition: width .25s ease, background-color .35s ease;
        display: flex !important;
        flex-direction: column !important;
    }
    /* Menu list scrolls; toggle bar + search bar stay pinned at the top. */
    .sidebar .panel-group {
        flex: 1 1 auto !important;
        min-height: 0 !important;     /* required for flex item to shrink */
        overflow-y: auto !important;
        overflow-x: hidden !important;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, .35) transparent;
    }
    .sidebar .panel-group::-webkit-scrollbar { width: 8px; }
    .sidebar .panel-group::-webkit-scrollbar-track { background: transparent; }
    .sidebar .panel-group::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, .35);
        border-radius: 4px;
    }
    .sidebar .panel-group::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, .55);
    }
    /* Decorative artwork — fills the whole sidebar then uses a soft mask
       gradient so the artwork fades in from the top instead of starting
       on a hard horizontal edge. mix-blend-mode lets the silhouette pick
       up whatever the current theme colour is. */
    .sidebar::after {
        content: "";
        position: absolute;
        inset: 0;
        background-image: url('/src/assets/images/sidebar.png');
        background-repeat: no-repeat;
        background-position: center bottom;
        background-size: cover;
        mix-blend-mode: screen;
        opacity: 0.6;
        pointer-events: none;
        z-index: 0;
        -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,.6) 60%, #000 85%);
                mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,.6) 60%, #000 85%);
        transition: opacity .25s ease;
    }
    .main.sidebar-collapsed .sidebar::after { opacity: 0; }
    .sidebar > * {
        position: relative;
        z-index: 1;
    }

    .sidebar :deep(.panel),
    .sidebar :deep(.panel-heading),
    .sidebar :deep(.panel-body),
    .sidebar :deep(.list-group-item) {
        background: transparent !important;
        border: none !important;
    }
    .sidebar :deep(.panel-body) {
        padding: 0 !important;
    }

    /* ----- Shared chip geometry -----
       All clickable rows (group heading + items + nested items) share the
       same height, font-size, horizontal inset and corner radius. Only
       the indent and visual weight differ between levels. */
    .sidebar :deep(.panel-heading),
    .sidebar :deep(.list-group-item) {
        margin: .12rem .5rem;
        border-radius: .45rem !important;
        line-height: 1.45;
        transition: background-color .15s ease, color .15s ease;
    }

    /* ----- Level 1 : group heading — always prominent (chip style) ----- */
    .sidebar :deep(.panel-heading) {
        background-color: rgba(255, 255, 255, .08) !important;
        margin-top: .45rem;
        position: relative;
        overflow: hidden;
    }
    .sidebar :deep(.panel-group > :first-child .panel-heading) {
        margin-top: .35rem;
    }
    /* Full-height left accent bar (clipped by the chip's border-radius) */
    .sidebar :deep(.panel-heading)::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: rgba(255, 255, 255, .55);
        transition: background-color .15s ease;
    }
    .sidebar :deep(.panel-heading a) {
        display: block;
        color: #ffffff !important;
        font-weight: 700;
        letter-spacing: .02em;
        text-decoration: none;
        text-shadow: none;
        padding: .55rem 2rem .55rem 1.1rem;
        transition: background-color .15s ease;
        position: relative;
        outline: none;
    }
    /* Right-side chevron */
    .sidebar :deep(.panel-heading a)::after {
        content: "\203A";
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-55%) rotate(0);
        transition: transform .25s ease, opacity .15s ease;
        opacity: .7;
        font-weight: 600;
        line-height: 1;
    }
    .sidebar :deep(.panel-heading a[aria-expanded="true"])::after {
        transform: translateY(-55%) rotate(90deg);
        opacity: 1;
    }
    .sidebar :deep(.panel-heading:hover) {
        background-color: rgba(255, 255, 255, .14) !important;
    }
    .sidebar :deep(.panel-heading:has(a[aria-expanded="true"])) {
        background-color: rgba(255, 255, 255, .16) !important;
    }
    .sidebar :deep(.panel-heading:has(a[aria-expanded="true"]))::before {
        background-color: #ffffff;
    }

    /* ----- Level 2 : first-level items ----- */
    .sidebar :deep(.list-group-item) {
        color: rgba(255, 255, 255, .88) !important;
        padding: .55rem 1rem .55rem 1.55rem !important;
        text-shadow: none !important;
        border: 0 !important;
        box-shadow: none !important;
    }
    .sidebar :deep(.list-group-item i),
    .sidebar :deep(.list-group-item .menu-toggle) {
        margin-right: .55rem;
        color: rgba(255, 255, 255, .85);
        text-shadow: none;
        opacity: .82;
    }
    .sidebar :deep(.list-group-item:hover) {
        background-color: rgba(255, 255, 255, .12) !important;
        color: #ffffff !important;
    }
    /* Active item — themed-filled rounded chip (matches heading geometry) */
    .sidebar :deep(.list-group-item.active) {
        background-color: rgba(255, 255, 255, .96) !important;
        color: var(--fw-primary) !important;
        font-weight: 600;
    }
    /* Icons / glyphicons inside the active chip must switch to the theme
       colour as well — otherwise white icon on white chip is invisible. */
    .sidebar :deep(.list-group-item.active i),
    .sidebar :deep(.list-group-item.active .menu-toggle),
    .sidebar :deep(.list-group-item.active .glyphicon) {
        color: var(--fw-primary) !important;
        opacity: 1;
    }

    /* ----- Level 3 : nested submenu items ----- */
    .sidebar :deep(.panel-child .list-group-item) {
        padding-left: 2.5rem !important;
        color: rgba(255, 255, 255, .78) !important;
    }
    .sidebar :deep(.panel-child .list-group-item.active) {
        color: var(--fw-primary) !important;
    }

    /* ===== Main content area ===== */
    .main-container {
        background-color: #f3f5f9 !important;
        padding: 5px 18px;
    }
    .main-container > .nav {
        border-bottom: 1px solid #ddd;
    }

    /* Tabs (NavItem) */
    .main-container :deep(.nav-pills .nav-link) {
        color: #333;
        border-radius: .375rem .375rem 0 0;
        padding: .45rem .9rem;
        margin-right: 2px;
        transition: background-color .15s ease, color .15s ease;
    }
    .main-container :deep(.nav-pills .nav-link:hover) {
        background-color: var(--fw-hover-bg);
        color: var(--fw-primary);
    }
    .main-container :deep(.nav-pills .nav-link.active) {
        background-color: var(--fw-primary);
        color: #fff;
    }

    /* ===== Misc ===== */
    :deep(.table td),
    :deep(.table th) {
        color: #475569 !important;
    }
    .divToggle {
        text-align: right;
        padding: 5px;
    }
    .sidebar-toggle {
        cursor: pointer;
        color: #ffffff;
        opacity: 0.85;
        transition: opacity .15s ease;
    }
    .sidebar-toggle:hover {
        opacity: 1;
    }
    .sidebar-title {
        font-size: 0.9rem;
        opacity: 0.8;
    }
    * {
        font-size: 16px !important;
    }
    .tab-pane {
        height: 100%;
    }
    :deep(#tab-pane-home) {
        background-image: v-bind(homeBgImage);
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
    }

    /* ===== Menu search (sidebar-internal) ===== */
    .menu-search-wrap {
        padding: 0 10px 8px;
    }

    .menu-search-icon {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-right: none;
    }

    .menu-search-input {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.25);
    }

        .menu-search-input::placeholder {
            color: rgba(255, 255, 255, 0.55);
        }

        .menu-search-input:focus {
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 0 0 0.15rem rgba(255, 255, 255, 0.2);
        }

    .menu-search-empty {
        margin-top: 6px;
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.65);
        text-align: center;
    }

    .sidebar :deep(.menu-search-hit) {
        background: #ffeb3b;
        color: var(--fw-primary);
        padding: 0 2px;
        border-radius: 2px;
        font-weight: bold;
    }
</style>
