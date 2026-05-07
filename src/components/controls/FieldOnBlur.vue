<template>
</template>

<script setup lang="ts">
    import { computed, watch, onMounted } from 'vue'

    const props = withDefaults(defineProps<{
        root: any,
        bindingObject?: string,
        columns?: any[]
    }>(), {
        bindingObject: '',
        columns: () => []
    })

    const root = computed(() => props.root)
    const columns = computed(() => props.columns || [])

    onMounted(() => {
        if (!props.bindingObject) return
        const { totalObjs } = initFields()
        const control = root.value['$' + props.bindingObject]

        watch(() => control?.value ? control.value.currentRow : {}, (newRow) => {
            columns.value.forEach(c => {
                if (!c.isTotal && newRow && Object.keys(newRow).length > 0) {
                    const v = getExpressionValue(c, newRow)
                    if (v !== undefined) newRow[c.targetField] = v
                }
            })
        }, { deep: true })

        totalObjs.forEach(o => {
            const totalControl = root.value['$' + o]
            watch(() => totalControl?.value ? totalControl.value.totalRow : {}, () => {
                if (control?.value && control.value.currentRow) {
                    const newRow = control.value.currentRow
                    columns.value.forEach(c => {
                        if (c.isTotal) {
                            const v = getExpressionValue(c, newRow)
                            if (v !== undefined) newRow[c.targetField] = v
                        }
                    })
                }
            }, { deep: true })
        })
    })

    // Manual trigger by changed field name (jQuery $.fn.fieldonblur.trigger).
    // Recomputes any column whose expression references `name`, then propagates.
    function trigger(name: string) {
        if (!props.bindingObject) return
        const control = root.value['$' + props.bindingObject]
        const row = control?.value?.currentRow
        if (!row) return
        const triggerNames = [name]
        columns.value.forEach(c => {
            const fields: string[] = c.fields || (c.expression || '').match(/[\u4e00-\u9fa5_a-zA-Z0-9_\.']+/g) || []
            const hit = fields.some(f => triggerNames.some(n => f.indexOf(n) === 0))
            if (!hit || !c.targetField) return
            const v = getExpressionValue(c, row)
            if (v !== undefined) {
                row[c.targetField] = v
                triggerNames.push(c.targetField)
            }
        })
    }

    defineExpose({ trigger })


    function initFields() {
        const totalObjs: string[] = []
        columns.value.forEach(c => {
            c.fields = (c.expression || '').match(/[\u4e00-\u9fa5_a-zA-Z0-9_\.']+/g) || []
            c.isFunc = !!/[a-zA-Z0-9_]+\(/.exec(c.expression || '')
            c.fields.forEach((f: string) => {
                const { tObj } = isTotal(f)
                if (tObj) {
                    if (totalObjs.indexOf(tObj) < 0) totalObjs.push(tObj)
                    c.isTotal = true
                }
            })
        })
        return { totalObjs }
    }

    function isChanged(newRow: object, oldRow: object, column: object) {
        let changed = false
        if (newRow && oldRow) {
            column.fields.forEach(f => {
                if (newRow[f] != oldRow[f]) {
                    changed = true
                }
            })
        }
        return changed
    }

    function getExpressionValue(column: any, currentRow: any) {
        const scripts: string[] = []
        if (column.isFunc && root.value?.funcStrings) {
            Object.keys(root.value.funcStrings).forEach(k => scripts.push(root.value.funcStrings[k]))
        }
        let isReturn = false
        column.fields.forEach((f: string) => {
            if (isField(f)) {
                //isField
                const fieldValue = getTypeValue(currentRow[f], column.fields.length)
                if (fieldValue !== undefined) {
                    if (typeof fieldValue === 'number') {
                        scripts.push(`const ${f} = ${fieldValue}`)
                    }
                    else {
                        scripts.push(`const ${f} = '${fieldValue.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n')}'`)
                    }
                }
                else {

                }
            }
            else {
                //isTotal
                const { tObj, tField } = isTotal(f)
                if (tObj) {
                    const totalRow = root.value['$' + tObj]?.value?.totalRow || {}
                    if (Object.keys(totalRow).length == 0) {
                        isReturn = true
                    }
                    else {
                        scripts.push(`const ${tObj} = {}`)
                        scripts.push(`${tObj}.Total = ${JSON.stringify(totalRow)}`)
                    }
                }
            }
        })
        if (isReturn) {
            return
        }
        scripts.push('return ' + column.expression)

        var func = new Function(scripts.join(';'))
        try {
            return func()
        } catch (e) {
            console.log(e)
        }
    }

    function getTypeValue(v: any, fLength: number) {
        if (v === undefined) {
            return v
        }
        else {
            var value = Number(v);
            var isNumber = false;
            if (isNaN(value) || v === '' || fLength == 1) {
            } else {
                if (!isNaN(value)) {
                    if (value.toString()[0] != v.toString()[0]) {
                        //0XXX string
                    } else if (/\d+e\d+/ig.test(v.toString())) {
                        //xExx string
                    } else {
                        return value
                    }
                }
            }
            return v
        }
    }

    function isField(exp: string) {
        return /^[\u4e00-\u9fa5_a-zA-Z][\u4e00-\u9fa5_a-zA-Z0-9_]*$/.exec(exp)
    }

    function isTotal(exp: string) {
        var totalRule = /^([a-zA-Z]\w*)\.Total\.([\u4e00-\u9fa5_a-zA-Z0-9_]+)$/i.exec(exp)
        if (totalRule) {
            const tObj = totalRule[1]
            const tField = totalRule[2]
            return { tObj, tField }
        }
        else {
            return { tObj: '', tField: '' }
        }
    }

</script>

<style scoped>
</style>
