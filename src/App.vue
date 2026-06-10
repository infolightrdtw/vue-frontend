<template>
   <router-view/>
</template>

<script setup>
   /* Global theme bootstrap — runs in every Vue instance (main window AND
      iframed pages like /flow). Ensures the saved theme is loaded on startup
      and that THEME_CHANGE postMessages from the parent are honoured.
      Main.vue still drives the picker UI; this is only the listener side. */
   import { onMounted, onUnmounted } from 'vue'
   /* Shared structural rules — loaded once per Vue instance (main window
      and every iframed route). Per-theme files below carry only the
      :root variables that this base file consumes. */
   import '@/assets/stylesheets/themes/theme-base.css'
   import defaultThemeUrl from '@/assets/stylesheets/themes/vue_default.css?url'
   import blackThemeUrl   from '@/assets/stylesheets/themes/vue_black.css?url'
   import violetThemeUrl  from '@/assets/stylesheets/themes/vue_violet.css?url'
   import greenThemeUrl   from '@/assets/stylesheets/themes/vue_green.css?url'
   import indigoThemeUrl  from '@/assets/stylesheets/themes/vue_indigo.css?url'
   import mauveThemeUrl   from '@/assets/stylesheets/themes/vue_mauve.css?url'

   const themeMap = {
       default: defaultThemeUrl,
       black:   blackThemeUrl,
       violet:  violetThemeUrl,
       green:   greenThemeUrl,
       indigo:  indigoThemeUrl,
       mauve:   mauveThemeUrl
   }

   function applyTheme(name) {
       const linkId = 'dynamic-theme-style'
       let link = document.getElementById(linkId)
       if (!link) {
           link = document.createElement('link')
           link.id = linkId
           link.rel = 'stylesheet'
           document.head.appendChild(link)
       }
       const url = themeMap[name] || themeMap.default
       if (link.getAttribute('href') !== url) link.href = url
   }

   function handleMessage(e) {
       if (e?.data?.type === 'THEME_CHANGE' && e.data.theme) {
           applyTheme(e.data.theme)
       }
   }

   onMounted(() => {
       applyTheme(localStorage.getItem('user-theme') || 'default')
       window.addEventListener('message', handleMessage)
   })
   onUnmounted(() => {
       window.removeEventListener('message', handleMessage)
   })
</script>

<style>
    #app {
        font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
        font-size: 16px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
