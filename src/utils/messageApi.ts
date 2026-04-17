import axios from 'axios'
import { ref, inject, onMounted, computed } from 'vue'
axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

export default function () {
    const messageApiUrl = '/api/ApiMain/message';
    const localeMessages = ref({})

    onMounted(() => {
        loadMessage()
    })

    async function loadMessage() {
        const { data: result } = await axios.post(messageApiUrl, {})
        localeMessages.value = result
    }

    return {
        localeMessages
    }
}