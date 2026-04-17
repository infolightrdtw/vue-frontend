<template>
  <div 
    v-show="visible" 
    :id="id" 
    ref="cardRoot"
    :data-title="title" 
    :class="['card', 'info-card-vue', cardClass]"
    :style="{ width: width + 'px' }"
  >
    <div class="card-header d-flex justify-content-between align-items-center px-2 py-1">
      <div class="header-title-wrapper text-truncate d-flex align-items-center">
        <i v-if="iconCls" :class="[iconCls, 'me-1']" aria-hidden="true"></i>
        <span v-if="title" class="fw-bold" style="font-size: 0.95rem;">{{ title }}</span>
      </div>
      
      <div v-if="parsedCommands.length > 0" class="dropdown card-dropdown ms-2" ref="dropdownRef">
        <a href="#" class="header-icon-link p-1" @click.prevent="toggleDropdown">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </a>
        <ul 
          class="dropdown-menu dropdown-menu-end shadow" 
          :style="{ display: isDropdownOpen ? 'block' : 'none', position: 'absolute', right: 0, top: '100%', zIndex: 1050 }"
        >
          <li v-for="cmd in parsedCommands" :key="cmd">
            <a class="dropdown-item" href="#" @click.prevent="handleCommand(cmd)">
              {{ getCommandLabel(cmd) }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="card-body p-0 d-flex flex-column" :style="{ height: height + 'px' }">
      <iframe v-if="url" :src="url" class="w-100 h-100 border-0 flex-grow-1"></iframe>
      <div v-else class="p-2 w-100 h-100 flex-grow-1" style="overflow-y: auto;">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance, h, defineComponent } from 'vue';

const props = defineProps({
  id: { type: String, default: '' },
  iconCls: { type: String, default: '' },
  title: { type: String, default: '' },
  cardClass: { type: String, default: '' },
  commands: { type: String, default: 'moveTop,moveBottom,hide,open' },
  url: { type: String, default: '' },
  visible: { type: Boolean, default: true },
  height: { type: Number, default: 200 },
  width: { type: [Number, String], default: 320 }
});

const isDropdownOpen = ref(false);
const dropdownRef = ref(null);
const cardRoot = ref(null);
const instance = getCurrentInstance();

const toggleDropdown = () => isDropdownOpen.value = !isDropdownOpen.value;

const closeDropdown = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
  const parent = cardRoot.value?.parentNode;
  if (parent && !parent.dataset.vueManaged) {
    parent.dataset.vueManaged = 'true';
    parent.style.display = 'flex';
    parent.style.flexWrap = 'wrap';
    parent.style.alignContent = 'flex-start';
    parent.style.gap = '15px'; 
    parent.style.paddingTop = '10px'; 
  }
});

onBeforeUnmount(() => document.removeEventListener('click', closeDropdown));

const parsedCommands = computed(() => {
  if (!props.commands) return [];
  return props.commands.split(',').map(cmd => cmd.trim()).filter(cmd => cmd !== '');
});

const getCommandLabel = (cmd) => {
  const labels = { 'hide': '隱藏卡片', 'moveTop': '移至最前', 'moveBottom': '移至最後', 'open': '打開內容' };
  return labels[cmd] || cmd;
};

const updateGlobalToolbar = (container) => {
  if (!container) return;
  const hiddenCards = Array.from(container.querySelectorAll('.info-card-vue[card-hidden="true"]'));
  let toolbar = container.querySelector('.card-toolbar-vue');
  
  if (hiddenCards.length === 0) {
    if (toolbar) toolbar.remove();
    return;
  }
  
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.className = 'card-toolbar-vue dropdown';
    toolbar.style.cssText = 'position: absolute; top: 10px; right: 20px; z-index: 1060;';
    if (window.getComputedStyle(container).position === 'static') container.style.position = 'relative';
    container.appendChild(toolbar);
    
    document.addEventListener('click', (e) => {
      if (toolbar && !toolbar.contains(e.target)) {
        const menu = toolbar.querySelector('.dropdown-menu');
        if (menu) menu.style.display = 'none';
      }
    });
  }
  
  const listHtml = hiddenCards.map(card => {
    const cid = card.id;
    const ctitle = card.getAttribute('data-title') || cid;
    return `<li><a class="dropdown-item restore-card-btn" href="#" data-id="${cid}">${ctitle}</a></li>`;
  }).join('');
  
  toolbar.innerHTML = `
    <button class="btn btn-light btn-sm border shadow-sm d-flex align-items-center justify-content-center p-1" style="width: 36px; height: 36px; border-radius: 4px;" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-folder-fill text-dark" viewBox="0 0 16 16">
        <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139z"/>
      </svg>
    </button>
    <ul class="dropdown-menu dropdown-menu-end shadow" style="display: none; position: absolute; right: 0; top: 100%; min-width: 150px;">
      ${listHtml}
    </ul>
  `;
  
  const btn = toolbar.querySelector('button');
  const menu = toolbar.querySelector('.dropdown-menu');
  btn.onclick = (e) => { e.preventDefault(); menu.style.display = menu.style.display === 'block' ? 'none' : 'block'; };
  
  toolbar.querySelectorAll('.restore-card-btn').forEach(restoreBtn => {
    restoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCard = document.getElementById(e.target.getAttribute('data-id'));
      if (targetCard) {
        targetCard.style.display = ''; 
        targetCard.removeAttribute('card-hidden');
      }
      updateGlobalToolbar(container);
    });
  });
};


const handleCommand = (cmd) => {
  isDropdownOpen.value = false; 
  const rootEl = cardRoot.value;
  const parentEl = rootEl?.parentNode;
  if (!rootEl) return;

  if (cmd === 'hide') {
    rootEl.style.display = 'none';
    rootEl.setAttribute('card-hidden', 'true'); 
    updateGlobalToolbar(parentEl);
  } 
  else if (cmd === 'moveTop') {
    if (parentEl && parentEl.firstElementChild) parentEl.insertBefore(rootEl, parentEl.firstElementChild);
  } 
  else if (cmd === 'moveBottom') {
    if (parentEl) parentEl.appendChild(rootEl);
  }
  else if (cmd === 'open') {
    if (props.url) {
      const isAbsoluteUrl = /^(https?|ftp):\/\//.test(props.url);

      if (isAbsoluteUrl) {
        window.open(props.url, '_blank');
      } else {
        const url = '../bootstrap/' + props.url;
        const tabId = props.title || props.id;
        const tabTitle = props.title || '詳細資料';

        const newTabInfo = {
          id: tabId,
          name: tabId,
          text: tabTitle,
          title: tabTitle,
          url: url,
          src: url, 
          path: url,
          active: true,
          canClose: true,
          attributes: {
            form: 'raw_url_bypass' 
          }
        };

        try {
          if (window.top) {
              window.top.postMessage({ method: 'addTab', item: newTabInfo }, '*');
          } else {
              window.postMessage({ method: 'addTab', item: newTabInfo }, '*');
          }
        } catch (e) {
          console.error("發送 addTab 訊息失敗:", e);
          window.open(url, '_blank');
        }
      }
    }
  }
};
</script>

<style scoped>
.header-icon-link { color: inherit; opacity: 0.8; }
.header-icon-link:hover { opacity: 1; }

.info-card-vue {
  position: relative !important;
  left: auto !important;
  top: auto !important;
  margin: 0 !important; 
  transition: transform 0.2s;
}

.info-card-vue.red .card-header { background-color: #dc3545; color: white; }
.info-card-vue.orange .card-header { background-color: #fd7e14; color: white; }
.info-card-vue.blue .card-header { background-color: #0d6efd; color: white; }
.info-card-vue.green .card-header { background-color: #198754; color: white; }
.info-card-vue.yellow .card-header { background-color: #ffc107; color: #212529; }
.info-card-vue.purple .card-header { background-color: #6f42c1; color: white; }
.info-card-vue.gray .card-header { background-color: #6c757d; color: white; }
.card-header { border-bottom: none; }
</style>