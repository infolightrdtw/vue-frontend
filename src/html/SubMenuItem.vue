<template>
    <a v-if="hasChildren" data-bs-toggle="collapse" class="list-group-item" :href="data_bs_target" :data-bs-target="data_bs_target" aria-expanded="false" :aria-controls="data_bs_target">
        <span class="menu-toggle glyphicon" aria-hidden="true"></span>{{item.text}}
    </a>
    <a v-else href="javascript:void(0)" class="list-group-item" :class="{ 'active': item.id === activeTabId }" @click="add">
        <i v-if="iconCls.length" :class="iconCls"></i>{{item.text}}
    </a>
    <div v-if="hasChildren" :id="collapseID" class="panel-collapse panel-child collapse" role="tabpanel">
        <div class="panel-body">
            <div class="list-group">
                <SubMenuItem v-for="submenu in item.children" :item="submenu" :activeTabId="activeTabId" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed } from 'vue'
    import emitter from '@/utils/emitter'
    let { item, activeTabId } = defineProps<{ item: any, activeTabId?: String }>()

    const hasChildren = computed(() => item.children != null)
    const data_bs_parent = computed(() => `#${parentMenu}`)
    const data_bs_target = computed(() => `#collapse_${item.id}`)
    const collapseID = computed(() => `collapse_${item.id}`)
    const iconCls = computed(() => {
        const cls = []
        const icon = item?.attributes?.icon
        if (icon) {
            if (icon.startsWith('glyphicon-')) {
                cls.push('glyphicon')
            }
            else if (icon.startsWith('fa-')) {
                cls.push('fa')
            }
            cls.push(icon)
        }
        return cls
    })
    function add() {
        emitter.emit('addTab', item)
    }
</script>
<style scoped>
    .menu-icon {
        margin-right: 8px;
        font-size: 16px;
        width: 18px;
        text-align: center;
    }

    .menu-toggle {
        font-size: 14px;
        margin: 0 5px 0 0;
    }
</style>