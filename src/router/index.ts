import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import NotFound from '@/pages/NotFound.vue'
routes.push({
    path: '/:pathMatch(.*)*', // 捕获所有未匹配的路径
    name: 'NotFound',
    component: NotFound,
})

// create instance
const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    if (to.fullPath == '/') {
        next('/logon')
    }
    else {
        var durl = decodeURIComponent(to.fullPath)
        if (durl != to.fullPath) {
            next(durl)
        }
        else {
            next()
        }
    }
});

export default router;