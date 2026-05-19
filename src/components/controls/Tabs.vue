<template>
    <ul :class="ulCls">
        <li v-for="(item, index) in items" v-show="!item.hidden" class="nav-item" role="presentation">
            <button :class="buttonCls(item)" type="button" role="tab" @click="select(index)">
                <LText v-if="item.name" :root="$" :value="item.name" />
                <template v-else>
                    {{item.title}}
                </template>
                <span v-if="item.count != undefined" class="badge">{{item.count}}</span>
            </button>
        </li>
    </ul>
    <div class="tab-content">
        <div v-for="(item, index) in items" v-show="!item.hidden" :class="divCls(item)" role="tabpanel">
            <slot :name="index"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { reactive, computed } from 'vue'
    let { root: $,  mode = 'pill', tabs = [] } = defineProps<{
        root: object,
        containerCls?: string,
        mode?: string,
        tabs: Array,
        tabCls?: string,
        contentCls?: string,
        justified?: boolean,
        stacked?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'onSelect', index: number, title: string): void;
    }>();

    const visibleTabs = tabs.filter(t=> t.hidden !== true)
    const items = reactive(visibleTabs)
    const ulCls = computed(() => ['nav', `nav-${mode}s`])
    const buttonCls = item => ['nav-link', item.active === true ? 'active' : '']
    const divCls = item => ['tab-pane fade', item.active === true ? 'show active' : '']
   
    
    function select(index) {
        for (var i = 0; i < items.length; i++) {
            items[i].active = i === index
        }
        emit('onSelect', index, items[index].title)
    }

    function indexOfTab(key: string | number) {
        if (typeof key === 'number') return key
        return items.findIndex(t => t.title === key || t.name === key)
    }

    function setTabHidden(key: string | number, hidden: boolean) {
        const idx = indexOfTab(key)
        if (idx < 0) return
        items[idx].hidden = hidden
        if (hidden && items[idx].active) {
            const next = items.findIndex(t => !t.hidden)
            if (next >= 0) select(next)
        }
    }

    function hideTab(key: string | number) { setTabHidden(key, true) }
    function showTab(key: string | number) { setTabHidden(key, false) }

    defineExpose({ select, hideTab, showTab })
</script>

<style scoped>
    .badge{
        margin: -3px 0 0 5px;
    }
</style>
