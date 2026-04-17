<template>
    <button :class="buttonCls"
            @click="click"
            :title="title">
        <i v-if="item.iconCls" :class="iconCls"></i>
        {{ buttonText }}
    </button>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    let { item, root, showText = true, defaultCls = '' } = defineProps<{
        root: object,
        item: object,
        showText?: boolean,
        defaultCls?: string
    }>()
    const emit = defineEmits<{
        (e: 'click', item: object): void;
    }>();

    const buttonName = computed(() => {
        let  name = capitalizeFirstLetter(item.text || '')
        return name
    })

    const buttonCls = computed(() => {
        if (defaultCls && (!item.btnCls || item.btnCls == 'btn-default')) {
            return `btn ${defaultCls}`
        }
        else {
            return `btn ${item.btnCls}`
        }
    })
    const iconCls = computed(() => item.iconCls.indexOf('fa') == 0 ? ['fa', item.iconCls] : ['glyphicon', item.iconCls])
    const buttonText = computed(() => showText ? title.value : '')
    const title = computed(() => root.getMessage(buttonName.value) || item.text)

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    }

    function click() {
        emit('click', item)
    }


</script>

<style scoped>
</style>
