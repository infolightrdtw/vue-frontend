<template>
    <div class="d-flex flex-column vh-100 main">
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
    import { ref, computed, onMounted, onUnmounted } from 'vue'
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
        'violet': violetThemeUrl
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

    onMounted(() => {
        const savedTheme = stateManager.get('theme', 'default');
        changeTheme(savedTheme);

        window.addEventListener('message', handleMessage);
    });

    onUnmounted(() => {
        window.removeEventListener('message', handleMessage);
    });
</script>

<style scoped>
    .main {
        --sidebar-width: clamp(200px, 18vw, 320px);
    }

    .topbar {
        background: linear-gradient( to right, #002b93 0, #002b93 var(--sidebar-width), #ffffff var(--sidebar-width), #ffffff 100% );
    }

    .user-name {
        color: #002b93 !important;
        font-weight: 600;
    }

    .sidebar {
        background-color: #002b93;
        position: relative;
        overflow: hidden;
        width: var(--sidebar-width);
    }

        .sidebar.min {
            width: 18px;
        }

        .sidebar::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            top: 45px;
            background-color: #002b93;
            background-image: url('/src/assets/images/sidebar.png');
            background-repeat: no-repeat;
            background-size: cover;
            background-blend-mode: screen;
            opacity: 0.9;
            pointer-events: none;
            z-index: 0;
        }

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

        .sidebar :deep(.panel-heading) {
            background: #002b93 !important;
        }

        .sidebar :deep(.panel-heading a) {
            color: #ffffff !important;
            font-weight: bold;
        }

        .sidebar :deep(.panel-heading a:hover),
        .sidebar :deep(.panel-heading a[aria-expanded="true"]) {
            color: #00e5ff !important;
        }


        .sidebar :deep(.list-group-item) {
            background: #013b99 !important;
            color: #ffffff !important;
        }

        .sidebar :deep(.list-group-item:hover) {
            background: #014bb5 !important;
            color: #00e5ff !important;
        }

        .sidebar :deep(.list-group-item.active) {
            background: #2678ff !important;
            color: #00e5ff !important;
            font-weight: bold;
        }

    .main-container {
        background-color: #f3f5f9 !important;
        padding: 5px 18px;
    }

        .main-container > .nav {
            border-bottom: 1px solid #ddd;
        }

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

    .dropdown-menu {
        right: 0;
        min-width: 100px;
    }

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
            border-color: #00e5ff;
            box-shadow: 0 0 0 0.15rem rgba(0, 229, 255, 0.25);
        }

    .menu-search-empty {
        margin-top: 6px;
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.65);
        text-align: center;
    }

    .sidebar :deep(.menu-search-hit) {
        background: #ffeb3b;
        color: #002b93;
        padding: 0 2px;
        border-radius: 2px;
        font-weight: bold;
    }
</style>
