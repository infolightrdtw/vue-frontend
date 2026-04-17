<template>
  <div class="info-donutchart-wrapper" :style="{ width: computedWidth }">
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
import axios from 'axios'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts' 
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
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

    let param: any = {}
    const onBeforeLoad = get('onBeforeLoad')
    if (typeof onBeforeLoad === 'function') {
      param = onBeforeLoad(param) || param
    }

    const { module, command } = parseRemoteName(remoteName)
    const bodyObj: any = {
      mode: 'getDataset',
      module,
      command,
      datas: JSON.stringify([param]),
      duplicateCheck: false
    }

    const body = new URLSearchParams()
    Object.entries(bodyObj).forEach(([k, v]) => body.append(k, String(v ?? '')))

    const { data } = await axios.post('/api/ApiMain/Data', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
    })

    chartData.value = Array.isArray(data) ? data : (data?.rows ?? data?.data ?? [])
  } catch (e) {
    console.error('DonutChart load error:', e)
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
  const labelField = get('labelField')
  const valueField = get('valueField')
  const showDataLabels = get('showDataLabels') !== false
  const dataLabelStyle = get('dataLabelStyle') || 'percent'
  const sliceMargin = Number(get('sliceMargin') || 0)

  const seriesData = chartData.value.map(row => ({
    name: row[labelField],
    value: row[valueField]
  }))

  return {
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      show: get('legendShow') === true,
      type: 'scroll',
      ...getLegendPos(get('legendLocation') || 'ne'),
      orient: get('legendRows') > 0 ? 'horizontal' : 'vertical'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '60%'], 
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        data: seriesData,
        itemStyle: {
          borderRadius: sliceMargin,
          borderColor: '#fff',
          borderWidth: sliceMargin > 0 ? 2 : 0
        },
        label: {
          show: showDataLabels,
          position: 'outside',
          formatter: getLabelFormatter(dataLabelStyle),
          bleedMargin: 5,
          constrainToGraph: true
        },
        labelLine: {
          show: showDataLabels,
          length: 15,
          length2: 10,
          smooth: true
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        }
      }
    ]
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
.info-donutchart-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
}
.chart-title {
  font-size: 1.1rem;
  color: #333;
}
</style>