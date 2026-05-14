<template>
    <template v-if="isVisible">
        <div class="panel-heading" role="tab" :id="menuID">
            <h4 class="panel-title">
                <a href="javascript:void(0)" :aria-expanded="effectiveExpanded" :aria-controls="collapseID" @click="toggle">
                    <template v-for="(seg, i) in titleSegments" :key="i">
                        <mark v-if="seg.match" class="menu-search-hit">{{ seg.text }}</mark>
                        <template v-else>{{ seg.text }}</template>
                    </template>
                </a>
            </h4>
        </div>
        <div :id="collapseID" class="panel-collapse collapse" :class="{ show: effectiveExpanded }" role="tabpanel" :aria-labelledby="menuID">
            <div class="panel-body">
                <div class="list-group">
                    <SubMenuItem v-for="submenu in props.item.children" :key="submenu.id" :item="submenu" :activeTabId="props.activeTabId" :searchQuery="props.searchQuery" />
                </div>
            </div>
        </div>
    </template>
</template>

<script lang="ts" setup>
    import { ref, computed } from 'vue'
    import { isMenuItemVisible, hasMatchingDescendant, highlightSegments } from '@/utils/menuSearch'

    const props = defineProps<{ item: any, parentMenu: String, active?: Boolean, activeTabId?: String, searchQuery?: string }>()

    const menuID = computed(() => `menu_${props.item.id}`)
    const collapseID = computed(() => `collapse_${props.item.id}`)

    const isExpanded = ref(props.active === true)
    const isVisible = computed(() => isMenuItemVisible(props.item, props.searchQuery || ''))
    const effectiveExpanded = computed(() => {
        if (props.searchQuery && hasMatchingDescendant(props.item, props.searchQuery)) return true
        return isExpanded.value
    })
    const titleSegments = computed(() => highlightSegments(props.item?.text, props.searchQuery || ''))

    function toggle() {
        isExpanded.value = !isExpanded.value
    }
</script>
