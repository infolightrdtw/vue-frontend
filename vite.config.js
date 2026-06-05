import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'

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
            }
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
            }
        }
    }
})
