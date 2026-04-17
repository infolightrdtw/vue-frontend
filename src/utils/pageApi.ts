import { ref, computed, onMounted, Ref, toRef } from 'vue'
import dataUtils from './dataApi'
import axios from 'axios'

export default function (funcs: object, controls: object, addOn: Ref) {
    const pageFunctions = funcs
    const pageControls = controls || {}
    const funcStrings = {}

    const ALERT_ADDON = computed(() => {
        if (addOn) {
            return addOn.value.alert
        }
        else {
            return pageControls['$__alert']?.value
        }
    })

    const FLOW_MODAL = computed(() => {
        if (addOn) {
            return addOn.value.flowModal
        }
        else {
            return flowModal.value
        }
    })
    

    if (funcs) {
        Object.keys(funcs).forEach(k => {
            funcStrings[k] = funcs[k].toString()
        })
    }

    const localeMessages = ref({})
    const clientInfo = ref({})

    const {
        loadMessage,
        loadClientInfo
    } = dataUtils()

    onMounted(async () => {
        localeMessages.value = await loadMessage()
        const result = await loadClientInfo()
        if (Object.keys(result).length > 0) {
            clientInfo.value = result
            window.sessionStorage.setItem('clientInfo', JSON.stringify(result));
        }
        else {
            //time out redirect
            window.location.href = `../../logon${window.top.location.search}`
        }
    })

    function getMessage(name: string) {
        const names = name.split(' ')
        let msg = names.map(n => localeMessages.value[KEYWORDS[n] || n] || n).join('')

        for (let i = 1; i < arguments.length; i++) {
            if (arguments[i] != undefined) {
                const reg = new RegExp("({)" + (i - 1) + "(})", "g")
                msg = msg.replace(reg, arguments[i])
            }
        }
        return msg
    }

    const KEYWORDS = {
        'delete': 'remove',
        'import': 'imports',
        'export': 'exports',
        'return': 'back'
    }

    async function alert(title: string, type: 'warning' | 'danger' | 'info') {
        if (ALERT_ADDON.value) {
            if (ALERT_ADDON.value.isShow) { }
            else {
                return await ALERT_ADDON.value.alert(title, type)
            }
        }
    }

    async function alertMessage(title: string, type: 'warning' | 'danger' | 'info') {
        const msg = getMessage(title)
        return await alert(msg, type)
    }

    function getErrorText(e: any) {
        return e.response?.data?.error || e.responseText || e.message || e
    }

    function showError(e: any, isLocale: boolean = false) {
        let text = getErrorText(e)
        if (isLocale && text.split(' ').length == 1) {
            text = getMessage(text)
        }
        alert(text, 'danger')
    }

    async function confirm(title: string, type: 'warning' | 'danger' | 'info') {
        if (ALERT_ADDON.value) {
            return await ALERT_ADDON.value.confirm(title, type)
        }
    }

    async function confirmMessage(title: string, type: 'warning' | 'danger' | 'info') {
        const msg = getMessage(title)
        return await confirm(msg, type)
    }

    async function callMethod(module: string, method: string, parameters: object) {
        const { callMethod: callServerMethod } = dataUtils(module);
        try {
            return await callServerMethod(method, parameters || {})
        } catch (e) {
            showError(e)
        }
    }

    function invoke(param: any) {
        const target = param.target
        const name = param.name || param.toString()
        const params = []
        for (let i = 1; i < arguments.length; i++) {
            params.push(arguments[i])
        }
        if (pageFunctions[name]) {
            return pageFunctions[name].apply(target, params)
        }
        else {
            showError(`function:'${name}' not found`)
        }
    }

    function addTab(item: object) {
        window.top.postMessage({ method: 'addTab', item })
    }

    function closeCurrentTab() {
        window.top.postMessage({ method: 'closeCurrentTab' })
    }

    function getFormatValue(value: any, row: object, format: string) {
        if (!format) {
            return value
        } else if (value == undefined || value.toString() == '') {
            return ''
        }
        else {
            const formats = format.split(/;|,/)
            switch (formats[0].trim()) {
                case 'logic': {
                    const logicTexts = formats.length == 2 ? formats[1].split(',') : ['true', 'false']
                    const trueStrs = ['1', 'y', 'true']
                    return value != undefined && trueStrs.indexOf(value.toString().toLowerCase()) >= 0 ? logicTexts[0] : (logicTexts.length == 2 ? logicTexts[1] : '')
                }
                case 'creator':
                case 'updater': {
                    return formats.length >= 2 && row[formats[1]] ? value + " (" + row[formats[1]].replace(/[TZ]/g, ' ').replace(/-/g, "/").split('.')[0] + ")" : value
                }
                //html
                case 'checkbox': {
                    const trueStrs = formats.length == 2 ? [formats[1]] : ['1', 'y', 'true']
                    const checked = value != undefined && trueStrs.indexOf(value.toString().toLowerCase()) >= 0 ? 'checked="checked"' : ''
                    return {
                        html: `<input type="checkbox" ${checked} onclick="return false;"/>`
                    }
                }
                case 'signature': {
                    return {
                        html: `<img src="data:image/svg+xml;base64,${(value.indexOf(',')[0])}">`
                    }
                }
                case 'badge': {
                    return {
                        html: `<span class="badge" style="cursor:pointer">${value}</span>`
                    }
                }
                //element
                case 'drilldown': {
                    break
                }
                case 'file': {
                    return {
                        type: 'link',
                        text: value,
                        folder: formats[1] || '',
                        fileName: value
                    }
                }
                case 'image': {
                    if (formats[1] == 'blob') {
                        const v = value.split(',');
                        if (v.length == 2) {
                            return {
                                html: `<img src="data:image/${v[0].split('.').pop()};base64,${v[1]}">`
                            }
                        }
                    }
                    else {
                        return {
                            type: 'image',
                            folder: formats[1] || '',
                            fileName: value,
                            style: formats[2] ? `cursor:pointer;height:${formats[2]}px` : ''
                        }

                    }
                }
                case 'barcode': {
                    break
                }
                case 'qrcode': {
                    break
                }
                case 'map': {
                    break
                }
                case 'status': {
                    break
                }
                case 'flowflag': {
                    return {
                        type: 'flowflag',
                        value,
                        root: {
                            getMessage,
                            openFlowModal
                        }
                    }
                    break
                }
            }

            //format string
            if (format.indexOf('?') >= 0) {
                const str = value.toString()
                let newStr = ''
                for (let i = 0; i < str.length && i < format.length; i++) {
                    if (format[i] == '?') {
                        newStr += str[i]
                    } else {
                        newStr += format[i]
                    }
                }
                return newStr
            } else if (['N', 'C', 'D', 'F'].indexOf(format[0]) >= 0) {
                const num = Number(value)
                if (isNaN(num)) {
                    return ''
                } else {
                    //D
                    if (format[0] == 'D') {
                        let formatValue = num.toString().split('.')[0]
                        if (format.length > 1) {
                            const length = parseInt(format.substring(1))
                            if (!isNaN(length)) {
                                for (let i = formatValue.length; i < length; i++) {
                                    formatValue = '0' + formatValue
                                }
                            }
                        }
                        return formatValue
                    } else {
                        let formatValue = num.toString()
                        if (format.length > 1) {
                            const length = parseInt(format.substring(1))
                            if (!isNaN(length)) {
                                formatValue = num.toFixed(length)
                            }
                        }
                        const numString = formatValue.split('.')
                        let newNum = ''
                        const flag = numString[0][0] == '-' ? 1 : 0
                        for (let i = numString[0].length - 1; i >= flag; i--) {
                            newNum = numString[0][i] + newNum
                            if (i > 0 && ((numString[0].length - i) % 3 == 0)) {
                                if (i == 1 && flag == 1) { } else {
                                    if (format[0] == 'C' || format[0] == 'N') {
                                        newNum = ',' + newNum
                                    }
                                }
                            }
                        }
                        if (flag == 1) {
                            newNum = '-' + newNum
                        }
                        formatValue = numString.length == 2 ? newNum + '.' + numString[1] : newNum
                        //N,C
                        return format[0] == 'C' ? '$' + formatValue : formatValue
                    }
                }
            }
            else if (format.indexOf('yy') >= 0 || format.indexOf('YY') >= 0 || format.indexOf('hh') >= 0) {
                let date = new Date(value.toString().replace(/[TZ]/g, ' ').replace(/-/g, "/").split('.')[0])
                if (date.toString() == 'Invalid Date' && value.length === 8) {
                    date = new Date(value.substring(0, 4) + '-' + value.substring(4, 6) + '-' + value.substring(6, 8))
                }
                return date.Format(format);
            }
            return ''
        }
    }

    function getDefaultValues(columns: Array<any>, dParams: object = {}) {
        const values = {}
        columns.forEach(c => {
            if (c.defaultValue) {
                const v = getDefaultValue(c.defaultValue, dParams)
                if (v != undefined) {
                    values[c.field] = v
                }
            }
        })
        return values
    }

    function getDefaultValue(dRule: string, dParams: object = {}) {
        const rule = /([a-zA-Z_]+)(.*)/.exec(dRule)
        if (rule) {
            const defaultRule = defaultRules[rule[1]]
            if (defaultRule) {
                return defaultRule.call(null, eval(rule[2]), dParams[rule[1]])
            }
        }
    }

    function getVariableValue(name) {
        if (name) {
            return getDefaultValue(`varaible['${name}']`)
        }
    }

    async function setAppLanguage(langValue: string) {
        const d = new Date()
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000))
        document.cookie = `rwdLanguage=${langValue};expires=${d.toUTCString()};path=/`

        localStorage.setItem('user-language', langValue)

        try {
            const clientInfoStr = sessionStorage.getItem('clientInfo')
            if (clientInfoStr) {
                const info = JSON.parse(clientInfoStr)
                info['locale'] = langValue
                sessionStorage.setItem('clientInfo', JSON.stringify(info))
                
                clientInfo.value = info
            }
        } catch (e) {
            console.error('Update session error', e)
        }

        try {
            const param = {
                mode: 'setClientInfo',
                key: 'locale',
                value: langValue
            }
            await axios.post('/api/ApiMain/data', param)
        } catch (error) {
            console.error('Set language failed:', error)
        } finally {
            window.location.reload()
        }
    }

    async function prompt(title: string, defaultValue: string = '') {
        if (ALERT_ADDON.value && typeof ALERT_ADDON.value.prompt === 'function') {
            return await ALERT_ADDON.value.prompt(title, defaultValue)
        } else {
            return new Promise((resolve) => {
                const result = window.prompt(title, defaultValue)
                resolve(result) 
            })
        }
    }

    function getDate(dateType: string) {
        const today = new Date()
        const year = today.getFullYear()
        const month = today.getMonth()
        const day = today.getDate()
        switch (dateType) {
            case 'firstday':
                return new Date(year, month, 1)
            case 'lastday':
                return new Date(year, month + 1, 0)
            case 'firstdaylm':
                return new Date(year, month - 1, 1)
            case 'lastdaylm':
                return new Date(year, month, 0)
            case 'firstdayty':
                return new Date(year, 0, 1)
            case 'lastdayty':
                return new Date(year + 1, 0, 0)
            case 'firstdayly':
                return new Date(year - 1, 0, 1)
            case 'lastdayly':
                return new Date(year, 0, 0)
        }
    }

    const defaultRules = {
        constant: function (param) {
            return param[0]
        },
        varaible: function (param) {
            switch (param[0]) {
                case 'today':
                    return new Date().Format("yyyy/MM/dd")
                case 'todayc8':
                    return new Date().Format("yyyyMMdd")
                case 'firstday':
                case 'lastday':
                case 'firstdaylm':
                case 'lastdaylm':
                case 'firstdayty':
                case 'lastdayty':
                case 'firstdayly':
                case 'lastdayly':
                    return getDate(param[0]).Format("yyyy/MM/dd");
                case 'now':
                    return new Date().Format("yyyy/MM/dd hh:mm:ss");
            }
            return clientInfo.value[param[0]] || ''
        },
        function: function (param) {
            return invoke.apply(null, param)
        },
        //row: function (param) {
        //    return ''
        //},
        autoseq: function (param, rows) {
            if (rows) {
                let value = -1;
                for (let i = 0; i < rows.length; i++) {
                    const fieldValue = parseInt(rows[i][param[0]]);
                    if (!isNaN(fieldValue)) {
                        value = Math.max(fieldValue, value);
                    }
                }
                let strValue = value < 0 ? param[2].toString() : (value + param[3]).toString();

                for (let i = strValue.length; i < param[1]; i++) {
                    strValue = '0' + value;
                }
                return strValue;
            }
            return ''
        },
        parent: function (param, parentRow) {
            return parentRow[param[0]]
        }
    }

    function validateRow(columns: Array<any>, row: object) {
        const invalidColumns = {}
        columns.forEach(c => {
            const v = row[c.field]
            let message = ''
            if (c.required && (v == undefined || v == null || v == '')) {
                message = getMessage('validateNull')
            }
            if (!message && c.validType) {
                message = validate(c.validType, v)
            }
            if (message) {
                invalidColumns[c.field] = {
                    message,
                    title: c.title
                }
            }
        })
        return invalidColumns
    }

    function validate(vRule: string, value: any) {
        const rule = /([a-zA-Z_]+)(.*)/.exec(vRule)
        if (rule) {
            const validRule = validateRules[rule[1]]
            if ((value == undefined || value == null || value == '') && rule[1] !== 'function') { } else {
                const param = rule.length > 1 ? eval(rule[2]) : null;
                if (!validRule.validator.call(validRule, value, param)) {
                    const args = [validRule.message, ...param]
                    return getMessage.apply(null, args)
                }
            }
        }
        return ''
    }

    const validateRules = {
        email: {
            validator(value) {
                return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value)
            },
            message: 'validateEmail'
        },
        url: {
            validator(value) {
                return /^((https|http|ftp|rtsp|mms)?:\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value)
            },
            message: 'validateUrl'
        },
        length: {
            validator(value, param = []) {
                const len = String(value ?? '').trim().length
                const min = Number(param[0] ?? 0)
                const max = Number(param[1] ?? Number.MAX_SAFE_INTEGER)
                return len >= min && len <= max
            },
            message: 'validateLength'
        },
        minLength: {
            validator(value, param = []) {
                const len = String(value ?? '').length
                const min = Number(param[0] ?? 0)
                return len >= min
            },
            message: 'validateMinLength'
        },
        maxLength: {
            validator(value, param = []) {
                const len = String(value ?? '').length
                const max = Number(param[0] ?? Number.MAX_SAFE_INTEGER)
                return len <= max
            },
            message: 'validateMaxLength'
        },
        greater: {
            validator(value, param = []) {
                const v = parseFloat(value)
                const p = parseFloat(param[0])
                if (!isNaN(v) && !isNaN(p)) return v >= p
                return value >= param[0]
            },
            message: 'validateGreater'
        },
        less: {
            validator(value, param = []) {
                const v = parseFloat(value)
                const p = parseFloat(param[0])
                if (!isNaN(v) && !isNaN(p)) return v <= p
                return value <= param[0]
            },
            message: 'validateLess'
        },
        range: {
            validator(value, param = []) {
                const v = parseFloat(value)
                const p0 = parseFloat(param[0])
                const p1 = parseFloat(param[1])
                if (!isNaN(v) && !isNaN(p0) && !isNaN(p1)) {
                    return v >= p0 && v <= p1
                }
                if (!param[0]) return true
                return value >= param[0] && value <= param[1]
            },
            message: 'validateRange'
        },
        cid: {
            validator(value) {
                const regIdNo = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/
                return regIdNo.test(value)
            },
            message: 'validateID'
        },
        tid: {
            validator(value) {
                const tab = 'ABCDEFGHJKLMNPQRSTUVXYWZIO'
                const A1 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3]
                const A2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5]
                const Mx = [9, 8, 7, 6, 5, 4, 3, 2, 1, 1]

                if (value.length !== 10) return false
                const i = tab.indexOf(value.charAt(0))
                if (i === -1) return false
                let sum = A1[i] + A2[i] * 9

                for (let i = 1; i < 10; i++) {
                    const v = parseInt(value.charAt(i), 10)
                    if (isNaN(v)) return false
                    sum += v * Mx[i]
                }
                return sum % 10 === 0
            },
            message: 'validateID'
        },
        uid: {
            validator(value) {
                const invalidList = '00000000,11111111'
                if (!/^\d{8}$/.test(value) || invalidList.indexOf(value) !== -1) {
                    return false
                }
                const multiplier = [1, 2, 1, 2, 1, 2, 4, 1]
                let sum = 0
                const calc = (digital) => {
                    const one = digital % 10
                    const ten = (digital - one) / 10
                    return one + ten
                }
                for (let i = 0; i < multiplier.length; i++) {
                    sum += calc(value[i] * multiplier[i])
                }
                return sum % 5 === 0 || (value[6] === '7' && (sum + 1) % 5 === 0)
            },
            message: 'validateID'
        },
        function: {
            validator(value, param = []) {
                if (param.length) {
                    const name = param[0]
                    param[0] = {
                        name,
                        target: this
                    }
                }
                return invoke.apply(null, param)
            },
            message: '{1}'
        }
    }

    const rValues = {}

    async function loadRelationValues(opts: object, value: string, merge?: boolean) {
        if (opts['remoteName'] && value) {
            const { loadData } = dataUtils(opts['remoteName']);
            let data
            try {
                data = await loadData({
                    total: false,
                    whereItems: [{
                        field: opts['valueField'],
                        operator: 'in',
                        value
                    }]
                })
            }
            catch (_) { }

            const values = data.reduce((obj, r) => {
                obj[r[opts['valueField']]] = r[opts['textField']]
                return obj
            }, {})

            if (merge) {
                const oValues = rValues[opts['remoteName']] || {}
                rValues[opts['remoteName']] = { ...oValues, ...values }
            }
            else {
                rValues[opts['remoteName']] = values
            }
        }
    }

    async function getRelationValue(opts: object, value: string) {
        let text = (rValues[opts['remoteName']] || {})[value]
        return text == undefined ? '' : text
    }

    let flowModal
    function registerFlowModal(modalObj: Ref) {
        flowModal = modalObj
    }

    async function openFlowModal(name: string, ...args) {
        if (FLOW_MODAL.value) {
            const modal = FLOW_MODAL.value[name]
            if (modal) {
                return await modal.open.apply(null, args)
            }
            else {
                showError(`Flow modal:'${name}'not found.`)
            }
        }
        else {
            showError(`Flow modal is not registered.`)
        }
    }

    function getQueryValue(name: string) {
        const queryString = window.location.search;
        if (queryString != "") {
            const result = queryString.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return decodeURIComponent(result[1]);
        } else {
            return '';
        }
    }

    function getEncryptParameters(key = 'p') {
        const p = getQueryValue(key)
        if (p) {
            const parameter = sessionStorage[p];
            if (parameter) {
                var obj = JSON.parse(parameter);
                return obj;
            }
        }
    }


    Date.prototype.Format = function (fmt, dp): string {
        const o = {
            "M+": this.getMonth() + 1, //
            "d+": this.getDate(), //
            "h+": this.getHours(), //
            "m+": dp ? this.getMonth() + 1 : this.getMinutes(), //
            "i+": this.getMinutes(), //
            "s+": this.getSeconds(), //
            "q+": Math.floor((this.getMonth() + 3) / 3) //
        }
        if (/(Y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() - 1911 + "").substr(3 - RegExp.$1.length))
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
        if (/(S+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getMilliseconds() + '00').substring(0, RegExp.$1.length))
        for (let k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
        return fmt
    }

    return {
        //props
        localeMessages,
        clientInfo,
        funcStrings,
        //methods
        alert,
        alertMessage,
        confirm,
        confirmMessage,
        getErrorText,
        showError,
        callMethod,
        invoke,
        addTab,
        closeCurrentTab,
        //default validate
        getFormatValue,
        getVariableValue,
        getDefaultValue,
        getDefaultValues,
        validateRow,
        loadRelationValues,
        getRelationValue,
        getMessage,
        getEncryptParameters,
        //flow
        registerFlowModal,
        openFlowModal,
        setAppLanguage,
        prompt,
        //controls
        ...pageControls
    }
}