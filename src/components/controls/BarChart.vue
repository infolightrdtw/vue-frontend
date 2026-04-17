<template>
  <div class="info-barchart-wrapper" :style="{ width: computedWidth }">
    <div v-if="title" class="chart-title mb-2 text-center fw-bold">{{ title }}</div>
    
    <div :style="{ height: computedHeight }">
      <v-chart 
        ref="chartRef" 
        :option="chartOptions" 
        autoresize 
        @click="onChartClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, useAttrs } from 'vue'
import dataUtils from '@/utils/dataApi'; 
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const attrs = useAttrs()
const chartRef = ref<any>(null)
const chartData = ref<any[]>([])

function get(name: string): any {
  return (attrs as any)[name]
}

const title = computed(() => get('title') || '')
const computedWidth = computed(() => {
  const w = get('width')
  return (!w || w === '0' || w === 0) ? '100%' : `${w}px`
})
const computedHeight = computed(() => `${get('height') || 400}px`)

function parseRemoteName(remoteName: string) {
  const rn = String(remoteName || '').trim()
  const module = rn.includes('.') ? rn.split('.')[0] : ''
  const command = rn.includes('.') ? rn.split('.')[1] : ''
  return { module, command }
}

async function loadData() {
   try {
    const remoteName = String(get('remoteName') ?? '').trim()
    if (!remoteName) return

    const { loadData: apiLoadData } = dataUtils(remoteName)

    let param: any = {}
    const onBeforeLoad = get('onBeforeLoad')
    if (typeof onBeforeLoad === 'function') {
      param = onBeforeLoad(param) || param
    }

    const r = await apiLoadData({ 
      datas: [param],
      duplicateCheck: false 
    })

    chartData.value = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? [])

  } catch (e) {
    console.error('BarChart load error:', e)
  }
}

function onChartClick(params: any) {
  const onClick = get('onClick')
  if (typeof onClick === 'function') {
    onClick(params)
  }
}

const getLegendPos = (loc: string) => {
  const map: Record<string, any> = {
    nw: { top: '5%', left: '5%' },
    n: { top: '5%', left: 'center' },
    ne: { top: '5%', right: '5%' },
    e: { top: 'center', right: '5%' },
    se: { bottom: '5%', right: '5%' },
    s: { bottom: '5%', left: 'center' },
    sw: { bottom: '5%', left: '5%' },
    w: { top: 'center', left: '5%' }
  }
  return map[loc] || map.ne
}

const chartOptions = computed(() => {
  const keyField = get('keyField')
  const dataFields = get('dataFields') || []
  const isAnimate = get('animate') === true
  const isStacked = get('stack') === true
  const isHorizontal = get('barDirection') === 'horizontal'
  
  const categoryData = chartData.value.map(row => row[keyField])

  const xAxis = isHorizontal ? { type: 'value' } : { type: 'category', data: categoryData }
  const yAxis = isHorizontal ? { type: 'category', data: categoryData } : { type: 'value' }

  return {
    animation: isAnimate,
    tooltip: { trigger: 'axis' },
    legend: {
      show: get('legendShow') === true,
      ...getLegendPos(get('legendLocation') || 'ne')
    },
    grid: { containLabel: true },
    xAxis,
    yAxis,
    series: dataFields.map((df: any) => ({
      name: df.label || df.field,
      type: 'bar',
      stack: isStacked ? 'total' : null, 
      data: chartData.value.map(row => row[df.field]),
      label: {
        show: df.showPointLabels,
        position: isHorizontal ? 'right' : 'top'
      }
    }))
  }
})

onMounted(() => {
  loadData()
})

defineExpose({
  reload: loadData,
  getChart: () => chartRef.value
})
</script>

<style scoped>
.info-barchart-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
}
.chart-title {
  font-size: 1.1rem;
  color: #333;
}
</style>