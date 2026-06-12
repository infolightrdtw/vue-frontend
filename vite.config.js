import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'

const EEP_BACKEND = 'https://localhost:44368'

const sysPageProxy = {
    '/bootstrap': {
        target: EEP_BACKEND,
        changeOrigin: true,
        secure: false,
        bypass(req) {
            const path = (req.url || '').split('?')[0]
            const segs = path.replace(/^\/bootstrap\/?/, '').split('/').filter(Boolean)
            const first = decodeURIComponent(segs[0] || '')
            if (segs.length === 1 && /^sys/i.test(first)) {
                return null // 代理到 Core（serve Razor view）
            }
            return req.url // 交還 SPA
        }
    },
    '/main': {
        target: EEP_BACKEND,
        changeOrigin: true,
        secure: false,
        bypass(req) {
            const path = (req.url || '').split('?')[0]
            if (req.method === 'POST' || path.startsWith('/main/')) {
                return null 
            }
            return req.url 
        }
    },
    '/scripts': { target: EEP_BACKEND, changeOrigin: true, secure: false },
    '/stylesheets': { target: EEP_BACKEND, changeOrigin: true, secure: false }
}

export default defineConfig({
    base: '/',
    plugins: [
        VueRouter({

        }),
        vue(),
        Components({
            dirs: ['src/components', 'src/html'],
            extensions: ['vue'],
            deep: true
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'vue': 'vue/dist/vue.esm-bundler.js'
        }
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://localhost:44368', //測試機'http://localhost:5050'
                changeOrigin: true,
                secure: false // 允許自簽憑證
            },

            '/file': {
                target: 'https://localhost:44368',
                changeOrigin: true,
                secure: false
            },

            ...sysPageProxy
        },
        allowedHosts: ['eepcloud.infolight.com']
    },
    preview: {
        host: '0.0.0.0',
        port: 4173,
        proxy: {
            '/api': {
                target: 'https://localhost:44368',
                changeOrigin: true,
                secure: false
            },
            '/file': {
                target: 'https://localhost:44368',
                changeOrigin: true,
                secure: false
            },

            ...sysPageProxy
        }
    }
})
