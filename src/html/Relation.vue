<template>
    <span>{{ displayText }}</span>
</template>

<script lang="ts" setup>
    import { ref, watch } from 'vue'

    const props = defineProps<{
        root: object,
        remoteName: string,
        valueField: string,
        textField: string,
        separator?: string,
        seperator?: string,   
        value: any
    }>()

    const $ = props.root
    const displayText = ref('')
    const getSep = () => props.separator || props.seperator || ','

    watch(() => props.value, async (newValue) => {
        if (newValue === null || newValue === undefined || newValue === '') {
            displayText.value = ''
            return
        }
        const sep = getSep()
        const texts = []
        const values = newValue.toString().split(sep)
        for (let i = 0; i < values.length; i++) {
            if (values[i]) {
                const text = await $.getRelationValue(
                    { remoteName: props.remoteName, valueField: props.valueField, textField: props.textField },
                    values[i]
                )
                texts.push(text)
            }
        }
        displayText.value = texts.join(sep)
    }, { immediate: true })
</script>
