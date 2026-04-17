<template>
    <div class="panel-heading" role="tab" :id="menuID">
        <h4 class="panel-title">
            <a data-bs-toggle="collapse" :data-bs-parent="data_bs_parent" :href="data_bs_target" :data-bs-target="data_bs_target" :aria-expanded="aria_expanded" :aria-controls="data_bs_target">{{item.text}}</a>
        </h4>
    </div>
    <div :data-bs-parent="data_bs_parent" :id="collapseID" :class="collapseCls" role="tabpanel" :aria-labelledby="menuID">
        <div class="panel-body">
            <div class="list-group">
                <SubMenuItem v-for="submenu in item.children" :item="submenu" :activeTabId="activeTabId"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
/*    import SubMenuItem from '@/html/SubMenuItem.vue'*/
    import { computed } from 'vue'
    let { item, parentMenu, active, activeTabId } = defineProps<{ item: any, parentMenu:String, active?: Boolean, activeTabId?: String }>()

    const data_bs_parent = computed(() => `#${parentMenu}`)
    const data_bs_target = computed(() => `#collapse_${item.id}`)
    const aria_expanded = computed(() => active === true)
    const collapseCls = computed(() => ['panel-collapse collapse', active === true ? 'show' : ''])
    const menuID = computed(() => `menu_${item.id}`)
    const collapseID = computed(() => `collapse_${item.id}`)
   
</script>