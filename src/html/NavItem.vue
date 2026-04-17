<template>
    <li class="nav-item" role="presentation">
        <button :class="buttonCls" type="button" role="tab"  @click.prevent="select">
            {{text}}
            <span v-if="canClose" class="fa fa-remove" style="margin-left:5px" @click.stop="close"></span>
        </button>
    </li>
</template>

<script lang="ts" setup>
    import { computed } from 'vue'
    import emitter from '@/utils/emitter'
    let { root, item } = defineProps<{
        root: object,
        item: any
    }>()
    const $ = root

    const text = computed(() => item.text ? item.text: $.getMessage(item.name))
    const canClose = computed(() => item.canClose !== false)
    const buttonCls = computed(() => ['nav-link', item.active === true ? 'active' : ''])

    function close() {
        emitter.emit('closeTab', item.id)
    }

    function select() {
        emitter.emit('selectTab', item.id)
    }
</script>