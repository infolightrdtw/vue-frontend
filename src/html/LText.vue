<template>
    {{text}}
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    const { root, value = '' } = defineProps<{
        root: object,
        value?: string
    }>()
    const $ = root
    const text = computed(() => $.getMessage(value) || value)
</script>

