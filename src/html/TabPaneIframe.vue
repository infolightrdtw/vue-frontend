<template>
    <div :id="divID" :class="divCls" role="tabpanel" style="position:relative">
        <iframe v-if="src" ref="frameRef" :src="src" frameborder="0" @load="frameLoaded"></iframe>
        <div v-if="showLoading" class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:100%">{{ loadingMsg }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, computed, onMounted, onUnmounted } from 'vue'
    import emitter from '@/utils/emitter'
    import { applyThemeToSysFrame, getCurrentThemeName } from '@/utils/sysThemeBridge'
    let { root:$, item, solution } = defineProps<{
        root: object,
        item?: any,
        solution?: String
    }>()

    const frameRef = ref<HTMLIFrameElement | null>(null)

    const divID = computed(() => `tab-pane-${item.id}`)
    const divCls = computed(() => ['tab-pane fade', item.active === true ? 'show active' : ''])
    const showLoading = ref(item.attributes != undefined)
    const loadingMsg = computed(() => $.getMessage('loading'))


    const SYS_FORM_RE = /^sys/i

    const isSysPage = computed(() => !!(item && item.attributes && SYS_FORM_RE.test(item.attributes.form)))

    const src = computed(() => {
        if (item) {
            if (item.attributes) {
                const form = item.attributes.form
                const query = item.p ? `?p=${item.p}`: ''
                if (SYS_FORM_RE.test(form)) {
                    return `/bootstrap/${form}${query}`
                }
                const solution = $.clientInfo.value.solution
                return `/bootstrap/${solution}/${form}${query}`
            }
            else if (item.src) {
                return item.src
            }
        }
    });

    function frameLoaded() {
        showLoading.value = false

        if (isSysPage.value) {
            applyThemeToSysFrame(frameRef.value, getCurrentThemeName())
        }
    }


    function onThemeChange(themeName: string) {
        if (isSysPage.value) {
            applyThemeToSysFrame(frameRef.value, themeName || getCurrentThemeName())
        }
    }

    onMounted(() => emitter.on('themeChange', onThemeChange as any))
    onUnmounted(() => emitter.off('themeChange', onThemeChange as any))

</script>

<style scoped>
    iframe {
        width: 100%;
        height: calc(100% - 5px);
    }

    .progress {
        position:absolute;
        width: 200px;
        height: 30px;
        left: 50%;
        margin-left: -100px;
        top: 200px
    }
</style>