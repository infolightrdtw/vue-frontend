<template>
</template>

<script setup lang="ts">
    import { reactive, computed, watch, onMounted } from 'vue'
    let { root, bindingObject = '', columns = [] } = defineProps<{
        root: object,
        bindingObject?: string,
        columns: Array
    }>()

    onMounted(() => {
        if (bindingObject) {
            const { totalObjs } = initFields()
            const control = root['$' + bindingObject]
            watch(() => control.value ? control.value.currentRow: {}, (newRow, oldRow) => {
                columns.forEach(c => {
                    //if (isChanged(newRow, oldRow, column)) {
                    if (!c.isTotal) {
                        if (Object.keys(newRow).length > 0) {
                            var v = getExpressionValue(c, newRow)
                            if (v !== undefined) {
                                newRow[c.targetField] = v
                            }
                        }
                    }
                   // }
                })
            }, { deep: true })
            totalObjs.forEach(o => {
                const totalControl = root['$' + o]
                watch(() => totalControl.value ? totalControl.value.totalRow : {}, () => {
                    if (control.value && control.value.currentRow) {
                        const newRow = control.value.currentRow
                        columns.forEach(c => {
                            if (c.isTotal) {
                                var v = getExpressionValue(c, newRow)
                                if (v !== undefined) {
                                    newRow[c.targetField] = v
                                }
                            }
                        })
                    }
                }, { deep: true })

            })
        }
    })


    function initFields() {
        const totalObjs = []
        columns.forEach(c => {
            c.fields = (c.expression || '').match(/[\u4e00-\u9fa5_a-zA-Z0-9_\.']+/g);
            if (/[a-zA-Z0-9_]+\(/.exec(c.expression || '')) {
                c.isFunc = true
            }
            else {
                c.isFunc = false
            }
            c.fields.forEach(f => {
                const { tObj, tField } = isTotal(f)
                if (tObj) {
                    if (totalObjs.indexOf(tObj) < 0) {
                        totalObjs.push(tObj)
                    }
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

    function getExpressionValue(column: object, currentRow: object) {
        const scripts = []
        //if fields contains function
        if (column.isFunc) {
           Object.keys(root.funcStrings).forEach(k=> scripts.push(root.funcStrings[k]))
        }
        let isReturn = false
        column.fields.forEach(f => {
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
                    const totalRow = root['$' + tObj].value ? root['$' + tObj].value.totalRow : {}
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
