<template>
    <span>{{ displayText }}</span>
</template>

<script lang="ts" setup>
    import { ref, watch } from 'vue'
    let { remoteName, valueField, textField, separator = ',', value, root } = defineProps<{
        root: object,
        remoteName: string,
        valueField: string,
        textField: string,
        separator?: string,
        value: any
    }>()

    const $ = root
    const displayText = ref('')

    watch(() => value, async (newValue) => {
        if (!newValue) {
            displayText.value = ''
        }
        else {
            const texts = []
            const values = newValue.toString().split(separator)
            for (let i = 0; i < values.length; i++) {
                if (values[i]) {
                    const text = await $.getRelationValue({ remoteName, valueField, textField }, values[i])
                    texts.push(text)
                }
            }
            displayText.value = texts.join(separator)
        }
    }, { immediate: true })
</script>


