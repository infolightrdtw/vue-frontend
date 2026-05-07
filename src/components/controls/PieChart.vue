<template>
  <div class="info-piechart-wrapper" :style="{ width: computedWidth }">
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
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent
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

    let param: any = {}
    const onBeforeLoad = get('onBeforeLoad')
    if (typeof onBeforeLoad === 'function') {
      param = onBeforeLoad(param) || param
    }

    const { loadData: apiLoadData } = dataUtils(remoteName)

    const r = await apiLoadData({ 
      datas: [param],
      duplicateCheck: false 
    })

    chartData.value = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? [])

  } catch (e) {
    console.error('PieChart load error:', e)
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

const getLabelFormatter = (style: string) => {
  switch (style) {
    case 'label': return '{b}'   
    case 'value': return '{c}'      
    case 'percent': return '{d}%'   
    default: return '{d}%'
  }
}

const chartOptions = computed(() => {
  const labelField = get('labelField');
  const valueField = get('valueField');
  const showDataLabels = get('showDataLabels') !== false;
  const dataLabelStyle = get('dataLabelStyle') || 'percent';

  const seriesData = chartData.value.map(row => ({
    name: row[labelField],
    value: row[valueField]
  }));

  return {
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '10%',
      containLabel: true
    },
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['0%', '60%'], 
        center: ['50%', '50%'],
        data: seriesData,
        label: {
          show: showDataLabels,
          formatter: getLabelFormatter(dataLabelStyle),
          position: 'outside',      
          bleedMargin: 5,           
          constrainToGraph: true,   
        },
        labelLine: {
          show: true,
          length: 15,         
          length2: 10,         
          smooth: true
        },
        labelLayout: {
          hideOverlap: false       
        }
      }
    ]
  };
});

onMounted(() => {
  loadData()
})

defineExpose({
  reload:   loadData,
  getChart: () => chartRef.value,

  load:     loadData,
  loadData: (data: any) => { chartData.value = Array.isArray(data) ? data : (data?.rows ?? data?.data ?? []) },
  setWhere: (_w: any) => loadData(),
  resize:   () => chartRef.value?.resize?.(),
  options:  () => chartOptions.value
})
</script>

<style scoped>
.info-piechart-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
}
.chart-title {
  font-size: 1.1rem;
  color: #333;
}
</style>