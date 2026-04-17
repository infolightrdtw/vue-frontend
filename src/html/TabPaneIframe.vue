<template>
    <div :id="divID" :class="divCls" role="tabpanel" style="position:relative">
        <iframe v-if="src" :src="src" frameborder="0" @load="frameLoaded"></iframe>
        <div v-if="showLoading" class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:100%">{{ loadingMsg }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, computed } from 'vue'
    let { root:$, item, solution } = defineProps<{
        root: object,
        item?: any,
        solution?: String
    }>()

    const divID = computed(() => `tab-pane-${item.id}`)
    const divCls = computed(() => ['tab-pane fade', item.active === true ? 'show active' : ''])
    const showLoading = ref(item.attributes != undefined)
    const loadingMsg = computed(() => $.getMessage('loading'))

    const src = computed(() => {
        if (item) {
            if (item.attributes) {
                const solution = $.clientInfo.value.solution
                const query = item.p ? `?p=${item.p}`: ''
                return `/bootstrap/${solution}/${item.attributes.form}${query}`
            }
            else if (item.src) {
                return item.src
            }
        }
    });

    function frameLoaded() {
        showLoading.value = false
    }

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