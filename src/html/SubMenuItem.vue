<template>
    <template v-if="isVisible">
        <a v-if="hasChildren" href="javascript:void(0)" class="list-group-item" :aria-expanded="effectiveExpanded" :aria-controls="collapseID" @click="toggle">
            <span class="menu-toggle glyphicon" :class="effectiveExpanded ? 'glyphicon-minus' : 'glyphicon-plus'" aria-hidden="true"></span>
            <template v-for="(seg, i) in titleSegments" :key="i">
                <mark v-if="seg.match" class="menu-search-hit">{{ seg.text }}</mark>
                <template v-else>{{ seg.text }}</template>
            </template>
        </a>
        <a v-else href="javascript:void(0)" class="list-group-item" :class="{ 'active': props.item.id === props.activeTabId }" @click="add">
            <i v-if="iconCls.length" :class="iconCls"></i>
            <template v-for="(seg, i) in titleSegments" :key="i">
                <mark v-if="seg.match" class="menu-search-hit">{{ seg.text }}</mark>
                <template v-else>{{ seg.text }}</template>
            </template>
        </a>
        <div v-if="hasChildren" :id="collapseID" class="panel-collapse panel-child collapse" :class="{ show: effectiveExpanded }" role="tabpanel">
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
    import emitter from '@/utils/emitter'
    import { isMenuItemVisible, hasMatchingDescendant, highlightSegments } from '@/utils/menuSearch'

    const props = defineProps<{ item: any, activeTabId?: String, searchQuery?: string }>()

    const hasChildren = computed(() => props.item.children != null)
    const collapseID = computed(() => `collapse_${props.item.id}`)
    const isExpanded = ref(false)
    const isVisible = computed(() => isMenuItemVisible(props.item, props.searchQuery || ''))
    const effectiveExpanded = computed(() => {
        if (props.searchQuery && hasMatchingDescendant(props.item, props.searchQuery)) return true
        return isExpanded.value
    })
    const titleSegments = computed(() => highlightSegments(props.item?.text, props.searchQuery || ''))

    function toggle() {
        isExpanded.value = !isExpanded.value
    }

    const iconCls = computed(() => {
        const cls: string[] = []
        const icon = props.item?.attributes?.icon
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
        emitter.emit('addTab', props.item)
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
