// src/main.js
import { createApp, ref } from 'vue'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'


import '@fortawesome/fontawesome-free/css/all.css'
//import '@/assets/stylesheets/logon.css'
//import 'element-plus/dist/index.css'
//import ElementPlus from 'element-plus'
import '@/assets/stylesheets/main.css';

import '@/assets/stylesheets/themes/bootstrap_default.css'
import '@/assets/stylesheets/bootstrap-custom.css'

//import DataGrid from '@/components/controls/DataGrid.vue'
//import DataForm from '@/components/controls/DataForm.vue'
const app = createApp(App)
app.use(router)

//router.beforeEach((to, from, next) => {
//    if (to.fullPath == '/') {
//        next('/logon')
//    }
//    else {
//        var durl = decodeURIComponent(to.fullPath) 
//        if (durl != to.fullPath) {
//            next(durl)
//        }
//        else {
//            next()
//        }
//    }
//});


app.mount('#app')

//app.component('DataGrid', DataGrid)
//app.component('DataForm', DataForm)
