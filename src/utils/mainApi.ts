import axios from 'axios'
import { ref, reactive, onMounted, computed } from 'vue'
import emitter from '@/utils/emitter'

axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

export default function () {
    const accountApiUrl = '/api/ApiMain/account';
    const dataApiUrl = '/api/ApiMain/data';
    
    let menus = reactive<any[]>([])
    
    let openedTabs = reactive([{
        id: 'home',
        name: 'homepage',
        active: true,
        canClose: false
    }, {
        id: 'workflow',
        name: 'flowpage',
        src: '/flow',
        canClose: false
    }])
    let isShowContextmenu = ref(false)


    onMounted(() => {
        loadMenus()
    })

    function findMenuItem(menuList: any[], id: string): any {
        for (const item of menuList) {
            if (item.id == id) {
                return { ...item };
            }
            const children = item.children || item.items;
            if (children && children.length > 0) {
                const found = findMenuItem(children, id);
                if (found) return found;
            }
        }
        return null;
    }

    async function loadMenus() {
        try {
            const { data: menuResult } = await axios.post(dataApiUrl, { mode: 'getMenus' })

            let menuData = Array.isArray(menuResult) ? menuResult : (menuResult.rows || []);

            const { data: favorResult } = await axios.post(dataApiUrl, { mode: 'getMenusFavor' })
            const favorData = Array.isArray(favorResult) ? favorResult : (favorResult.rows || []);

            if (favorData.length > 0) {
                const favorRoot = {
                    id: 'FROOT',
                    text: '我的最愛', 
                    attributes: { icon: 'glyphicon glyphicon-star' }, 
                    children: [] as any[]
                };

                const favorGroups: Record<string, any> = {};

                favorData.forEach((r: any) => {
                    const sourceItem = findMenuItem(menuData, r.MENUID);
                    
                    if (sourceItem) {
                        if (!r.GROUPNAME || r.GROUPNAME === '<--root-->') {
                            favorRoot.children.push(sourceItem);
                        } else {
                            const gName = r.GROUPNAME;
                            if (!favorGroups[gName]) {
                                const groupNode = {
                                    id: 'FGROUP_' + gName,
                                    text: gName,
                                    attributes: { icon: 'glyphicon glyphicon-folder-open' }, 
                                    children: [] as any[]
                                };
                                favorRoot.children.push(groupNode);
                                favorGroups[gName] = groupNode;
                            }
                            favorGroups[gName].children.push(sourceItem);
                        }
                    }
                });

                if (favorRoot.children.length > 0) {
                    menuData.unshift(favorRoot);
                }
            }

            menus.splice(0, menus.length);
            menuData.forEach((c: any) => menus.push(c));

        }
        catch (e) { 
            console.error('Load Menus Error:', e);
        }
    }

    async function logout() {
        try {
            await axios.post(
                accountApiUrl,
                {
                    mode: 'logoff'
                })
        }
        catch (e) { }
    }

    function toggleContextmenu() {
        isShowContextmenu.value = !isShowContextmenu.value
    }

    emitter.on('addTab', addTab)
    emitter.on('closeTab', closeTab)
    emitter.on('selectTab', selectTab)

    window.addEventListener('message', function (e) {
        const data = e.data
        if (data.method == 'addTab') {
            addTab(data.item)
        }
        else if (data.method == 'closeCurrentTab') {
            closeCurrentTab()
        }
    })

    function addTab(menuItem: any) {
        const attr = menuItem.attributes || {}; 
        if (attr && attr.form) {
            const id = menuItem.id
            let found = false
            for (let i = 0; i < openedTabs.length; i++) {
                if (openedTabs[i].id == id) {
                    openedTabs[i].active = true
                    found = true
                }
                else {
                    openedTabs[i].active = false
                }
            }
            if (!found) {       
                let p = ''
                if (menuItem.param) { //from flow todo/history/notify
                    p = `param_${id}`
                    sessionStorage[p] = JSON.stringify(menuItem.param)
                }
                else if (attr.param) { //from menu
                    var params = attr.param.split('&').filter(Boolean);
                    if (params.length) {
                        const param: any = {
                            WEBFORM_NAME: attr.form,
                            tabTitle: menuItem.text
                        }

                        for (var i = 0; i < params.length; i++) {
                            var pvalues = params[i].split('=');
                            if (pvalues.length == 2) {
                                param[pvalues[0]] = pvalues[1];
                            }
                        }
                        p = `param_${id}`
                        sessionStorage[p] = JSON.stringify(param)
                    }
                }
                openedTabs.push({ ...menuItem, active: true, p })
            }
        }
    }
    
    function selectTab(id: string) {
        for (let i = 0; i < openedTabs.length; i++) {
            openedTabs[i].active = false
            if (openedTabs[i].id == id) {
                openedTabs[i].active = true

            }
            else {
                openedTabs[i].active = false
            }
        }
    }
    
    function closeTab(id: string) {
        let index = -1;
        for (let i = 0; i < openedTabs.length; i++) {
            openedTabs[i].active = false
            if (openedTabs[i].id == id) {
                index = i;
                const p = openedTabs[i]['p']
                if (p) {
                    sessionStorage.removeItem(p)
                }
            }
        }
        if (index == openedTabs.length - 1) {
            openedTabs[index - 1].active = true
        }
        else {
            openedTabs[index + 1].active = true
        }
        if (index >= 0) {
            openedTabs.splice(index, 1)
        }
    }

    function closeCurrentTab() {
        let currentTab = openedTabs.find(t=> t.active);
        if (currentTab) {
            closeTab(currentTab.id)
        }
    }

    return {
        logout,
        toggleContextmenu,
        menus,
        openedTabs,
        isShowContextmenu
    }
}