<template>
    <div class="info-flowDesigner" :style="style" style="position:relative">
        <FlowSegment v-for="segment in segments" :item="segment"></FlowSegment>
        <svg width="100%" height="100%">
            <FlowLine v-for="line in lines" :source="getActivityByID(activities,line.source)" :target="getActivityByID(activities,line.target)"></FlowLine>
        </svg>
        <FlowSegmentBody v-for="segment in segments" :item="segment"></FlowSegmentBody>
        <FlowActivity v-for="activity in activities" :item="activity"></FlowActivity>
        <BLoading :root="$" ref="refLoading" style="width: 200px; top: 50%; left: 50%; transform: translate(-50%, -50%);" />
    </div>
</template>
<script lang="ts" setup>
    import { ref, reactive, computed, onMounted } from 'vue'

    const { root: $, flowParam } = defineProps<{
        root: object,
        flowParam: object
    }>()
    import flowUtils from '@/utils/flowApi'
    const { preview, getActivityByID } = flowUtils($);

    const refLoading = ref()
    const segments = reactive([])
    const activities = reactive([])
    const lines = reactive([])

    const style = computed(()=>{
        let h = 400
        activities.forEach(a=>{
            h = Math.max(h, a.top + a.height)
        })
        h+= 20
        return {height: `${h}px`}
    })

    onMounted(async () => {
        load()
    })

    async function load() {
        refLoading.value.show('loading')
        try {
            const { flowSegments, flowActivities, flowLines } = await preview(flowParam)
            let sWidth = 0
            flowSegments.forEach(s => {
                s.left = sWidth
                if (sWidth == 0) {
                    s.cls = 'first-segment'
                }
                sWidth += s.options.width
                segments.push(s)
            })
            flowActivities.forEach(a => {
                activities.push(a)
            })
            flowLines.forEach(l => {
                lines.push(l)
            })
        }
        catch (e) {
            $.showError(e)
        }
        finally {
            refLoading.value.hide()
        }
    }
</script>
<style scoped>
    svg{
        width: 100%;
        height: 100%;
    }
</style>