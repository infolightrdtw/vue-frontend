<template>
  <div class="main-layout">
    <!-- 隐藏 ClientInfo -->
    <input type="hidden" :value="viewData.clientInfo" />

    <!-- 顶栏 -->
    <div class="d-flex justify-content-between align-items-center top-bar px-3">
      <el-dropdown @command="onSystemCommand">
        <span class="el-dropdown-link">
          <i class="fa fa-cog"></i>
          {{ viewData.systemLabel }}
          <i class="fa fa-caret-down ml-1"></i>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="changePwd">
              {{ viewData.changePwd }}
            </el-dropdown-item>
            <el-dropdown-item command="logoff">
              {{ viewData.logoff }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="d-flex align-items-center">
        <span>{{ viewData.userLabel }}: {{ viewData.userName }}</span>
        <span class="mx-3">{{ viewData.themeLabel }}:</span>
        <el-select
          v-model="currentTheme"
          @change="onThemeChange"
          size="small"
          :placeholder="viewData.themeLabel"
          style="width: 120px;"
        >
          <el-option
            v-for="t in viewData.themes"
            :key="t.value"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 主体布局 -->
    <el-container style="flex: 1;">
      <el-aside width="200px" class="menu-panel">
        <el-tree
          :data="viewData.menuTree"
          :props="treeProps"
          node-key="id"
          @node-click="onMenuClick"
          accordion
        />
      </el-aside>

      <el-main class="content-panel p-0">
        <el-tabs v-model="activeTab" type="card" stretch>
          <el-tab-pane
            v-for="tab in tabs"
            :key="tab.name"
            :label="tab.label"
            :name="tab.name"
          >
            <iframe
              :src="tab.url"
              frameborder="0"
              style="width:100%;height:100%;"
            />
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  ElContainer,
  ElAside,
  ElMain,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElSelect,
  ElOption,
  ElTree,
  ElTabs,
  ElTabPane
} from 'element-plus'
import '@fortawesome/fontawesome-free/css/all.css'

// 响应式状态
const viewData = ref({
  clientInfo: '',
  systemLabel: '系統',
  changePwd: '變更密碼',
  logoff: '登出',
  userLabel: '使用者',
  userName: '',
  themeLabel: '主題',
  themes: [],     // { value, label }
  menuTree: []    // 左侧菜单
})
const currentTheme = ref('')
const activeTab = ref('')
const tabs = ref([])
const treeProps = { children: 'children', label: 'label' }

onMounted(async () => {
  try {
    // 1) 读取静态 view.json
    const json = await fetch('/json/jquery.infolight.view.json').then(r => r.json())
    // 映射配置
    viewData.value.clientInfo = json.clientInfo
    viewData.value.systemLabel = json.system
    viewData.value.changePwd = json.changePwd
    viewData.value.logoff = json.logoff
    viewData.value.userLabel = json.userLabel || '使用者'
    viewData.value.userName = json.user
    viewData.value.themeLabel = json.theme
    viewData.value.themes = json.themes.map(t => ({ value: t, label: t }))
    currentTheme.value = json.themeID

    // 初始化 tabs: 首頁
    tabs.value = [{
      name: 'home',
      label: json.homepage,
      url: json._startPage
    }]
    activeTab.value = 'home'

    // 动态菜单接口
    const menus = await fetch('/main', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'getMenus' })
    }).then(r => r.json())
    viewData.value.menuTree = Array.isArray(menus) ? menus : (menus.children || [])

    // 主题链接
    const link = document.getElementById('theme-css')
    if (link && currentTheme.value) {
      link.href = `/js/bootstrap-3.3.7/dist/themes/bootstrap_${currentTheme.value}.css`
    }
  } catch (e) {
    console.error('初始化主頁失敗', e)
  }
})

function onSystemCommand(cmd) {
  if (cmd === 'changePwd') window.location.href = '/account?type=changePwd'
  if (cmd === 'logoff') window.location.href = '/logout'
}

function onThemeChange(val) {
  const link = document.getElementById('theme-css')
  if (link) link.href = `/js/bootstrap-3.3.7/dist/themes/bootstrap_${val}.css`
}

function onMenuClick(node) {
  const id = node.id
  if (!tabs.value.find(t => t.name === id)) {
    tabs.value.push({ name: id, label: node.label, url: `/main?mode=open&id=${id}` })
  }
  activeTab.value = id
}
</script>

<style scoped>
.main-layout { display: flex; flex-direction: column; height: 100vh; }
.top-bar { height: 40px; background: #fff; border-bottom: 1px solid #ddd; }
.menu-panel { background: #f5f7fa; padding: 10px; }
.content-panel { background: #fff; }
</style>
