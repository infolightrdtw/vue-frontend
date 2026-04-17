<template>
    <select class="form-select" v-bind="disabled?{disabled}:null" v-model="value" :style="style">
        <option v-if="allowEmpty" value="">{{emptyLabel}}</option>
        <option v-for="item in optionItems"
                :key="item[valueField]"
                :value="item[valueField]">
            {{ item[textField] }}
        </option>
    </select>
</template>
<script lang="ts" setup>
    import { ref, reactive, computed, onMounted } from 'vue'

    const {
        root: $, type = '', items = [], modelValue = '', valueField = 'value', textField = 'text',
        loadParam = {}, allowEmpty = true, emptyLabel = '', disabled = false
    } = defineProps<{
        root: object,
        type?: string,
        items?: Array,
        allowEmpty?: boolean,
        emptyLabel?: string,
        loadParam?: object,
        modelValue?: string,
        valueField?: string,
        textField?: string,
        disabled?: bool
        style?: object
    }>()

    import flowUtils from '@/utils/flowApi'
    const { getFlows, queryFlow, queryData } = flowUtils($)

    const emit = defineEmits<{
        (e: 'update:modelValue', v: string): void
    }>()

    const value = computed({
        get: () => modelValue,
        set: (v) => emit('update:modelValue', v)
    })

    const optionItems = reactive([])
    onMounted(async () => {
        if (items.length) {
            loadData(items)
        }
        else {
            load()
        }
    })

    async function load() {
        if (type) {
            let rows
            try {
                switch (type) {
                    case 'flows':
                        rows = await getFlows()
                        break
                    case 'userGroups':
                        rows = await queryData({ type: 'UserGroups' })
                        break
                    case 'previvousActivities':
                        rows = await queryFlow({ type: 'PrevivousActivities', ...loadParam })
                        break
                    default:
                        throw new Error(`type:'${type}' not supported.`)
                }
            }
            catch (e) {
                $.showError(e)
            }
            loadData(rows)
        }
    }

    function loadData(rows) {
        optionItems.splice(0, optionItems.length)
        rows.forEach(r => {
            optionItems.push(r)
        })

        if (!allowEmpty && rows.length && !value.value) {
            value.value = rows[0][valueField]
        }
    }
</script>
<style scoped>
</style>