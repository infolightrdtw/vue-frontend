import axios from 'axios'
import { ref, reactive, onMounted, Ref } from 'vue'
axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL
axios.defaults.withCredentials = true;
axios.defaults.crossDomain = true;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

export default function (lMessages: any) {
    const accountApiUrl = '/api/ApiMain/account';
    const localeMessages = lMessages

    let user = ref('')
    let password = ref('')
    let database = ref('')
    let solution = ref('')
    let errorMessage = ref('')

    let databases = reactive([])
    let solutions = reactive([])

    const successMessage = ref('')
    const regData = reactive({
        user: '', userName: '', password: '', cpassword: '', email: '', license: false
    })
    const resetData = reactive({
        user: '', email: ''
    })

    async function logon() {
        const param = {
            mode: 'logon',
            user: user.value,
            password: password.value,
            database: database.value,
            solution: solution.value
        }
        errorMessage.value = '';
        try {
            const {
                data: result
            } = await axios.post(accountApiUrl, param)
            const ok = result.message == "LogonSuccess"
            if (ok) {
                return result.clientInfo
            }
            else {
                errorMessage.value = localeMessages.value.passwordWrong
            }
           
        }
        catch (e) {
            errorMessage.value = e.response.data ? e.response.data.error: e.message;
        }
    }

    async function submitAccount(type: string, mode: string) {
        errorMessage.value = '';
        successMessage.value = '';

        const param: any = { mode: mode || type };
        const formDataObj = type === 'resetP' ? resetData : regData;
        
        for (const key in formDataObj) {
            if (formDataObj[key] !== false && formDataObj[key] !== null && formDataObj[key] !== undefined) {
                param[key] = formDataObj[key];
            }
        }

        const designer = getParameter('designer');
        const db = getParameter('database');
        const sol = getParameter('solution');

        if (designer) param.designer = designer;
        if (db) param.database = db;
        if (sol) param.solution = sol;

        const clientInfo = window.sessionStorage.getItem('clientInfo');
        if (clientInfo) param.clientInfo = clientInfo;

        try {
            const { data: result } = await axios.post(accountApiUrl, param);

            if (result.message === 'success') {
                return true;
            } else {
                let localeStr = '';
                if (result.message && result.message.indexOf(':') > 0) {
                    const parts = result.message.split(':');
                    localeStr = localeMessages.value[parts[0]] || result.message;
                    errorMessage.value = localeStr.replace('{0}', parts[1]);
                } else {
                    localeStr = localeMessages.value[result.message];
                    if (result.message === 'userExist') {
                        localeStr = (localeMessages.value.user) + (localeMessages.value.exist);
                    }
                    errorMessage.value = localeStr || result.message ;
                }
                return false;
            }
        } catch (e: any) {
            errorMessage.value = e.response && e.response.data ? e.response.data.error : e.message;
            return false;
        }
    }

    onMounted(() => {
        loadDatabases().catch(e => { errorMessage.value = e?.response?.data?.error || e?.message || String(e) })
        loadSolutions().catch(e => { errorMessage.value = e?.response?.data?.error || e?.message || String(e) })
    })

    async function loadDatabases() {
        const {
            data: result
        } = await axios.post(accountApiUrl, { mode: 'getDatabases' })
        result.forEach(c => databases.push({ text: c.name, value: c.name }))
        if (result.length) {
            const db = getParameter('database')
            if (databases.find(c => c.value == db)) {
                database.value = db
            }
            else {
                database.value = databases[0].value
            }
        }
    }

    async function loadSolutions() {
        const {
            data: result
        } = await axios.post(accountApiUrl, { mode: 'getSolutions' })
        result.forEach(c => solutions.push({ text: c.ITEMNAME, value: c.ITEMTYPE }))
        if (result.length) {
            const sol = getParameter('solution')
            if (solutions.find(c => c.value == sol)) {
                solution.value = sol
            }
            else {
                solution.value = solutions[0].value
            }
        }
    }

    function getParameter(name: string) {
        let search = window.top.location.search;
        if (!search) {
            search = window.location.search; //iframe
        }
        if (search) {
            const result = search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return decodeURI(result[1]).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        } else {
            return '';
        }
    }

    return {
        logon,
        user,
        password,
        database,
        solution,
        errorMessage,
        databases,
        solutions,    
        regData,
        resetData,
        successMessage,
        submitAccount
    }
}