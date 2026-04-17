<template>
    <div class="card">
        <div class="card-header text-bg-primary">
            {{title}}
            <div :class="buttonCls" @click="toggle"></div>
        </div>
        <!--<Transition name="fade">-->
            <div v-show="isShow" class="card-body">
                <slot></slot>
            </div>
        <!--</Transition>-->
    </div>
</template>

<script lang="ts" setup>
    import { ref, computed } from 'vue'
    let { title = '', collapsed = false } = defineProps<{
        title?: string,
        collapsed?: boolean
    }>()

    const isShow = ref(!collapsed)
    const buttonCls = computed(() => ['float-end fa panel-toggle', isShow.value ? 'fa-minus' : 'fa-plus'])

    function show() {
        isShow.value = true
    }

    function hide() {
        isShow.value = true
    }

    function toggle() {
        isShow.value = !isShow.value
    }

    defineExpose({ show, hide, toggle })
</script>
<style scoped>
    .panel-toggle {
        line-height:24px;
        cursor: pointer;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.5s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>