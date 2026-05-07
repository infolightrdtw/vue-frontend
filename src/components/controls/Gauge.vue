<template>
  <div class="info-gauge-wrapper" :style="{ width: computedWidth, height: computedHeight }" v-loading="isLoading">
    <v-chart 
      ref="chartRef" 
      :option="chartOptions" 
      autoresize 
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, useAttrs, watch } from 'vue'
import dataUtils from '@/utils/dataApi'

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, GaugeChart, TooltipComponent, TitleComponent])

const attrs = useAttrs()
const chartRef = ref<any>(null)
const isLoading = ref(false)

const internalValue = ref(0)
const internalMin = ref(0)
const internalMax = ref(100)


function get(name: string, defaultValue: any = undefined): any {
  return (attrs as any)[name] !== undefined ? (attrs as any)[name] : defaultValue
}

const computedWidth = computed(() => {
  const w = get('size', 250)
  return `${w}px`
})
const computedHeight = computed(() => {
  const h = get('size', 250)
  return `${h * 0.9}px` 
})

async function loadData() {
  const remoteName = String(get('remoteName') ?? '').trim()

  if (!remoteName) {
    internalValue.value = Number(get('currentValue', 0))
    internalMin.value = Number(get('minValue', 0))
    internalMax.value = Number(get('maxValue', 100))
    return
  }

  try {
    isLoading.value = true
    const { loadData: apiLoadData } = dataUtils(remoteName)
    const r: any = await apiLoadData({
      total: false,
      whereStr: get('whereStr', '') || '',
      whereItems: Array.isArray(get('whereItems')) ? get('whereItems') : []
    })
    const rows = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? [])

    if (rows && rows.length > 0) {
      const row = rows[0]
      const valField = get('field')
      const minField = get('minField')
      const maxField = get('maxField')

      internalValue.value = valField && row[valField] !== undefined ? Number(row[valField]) : 0
      internalMin.value = minField && row[minField] !== undefined ? Number(row[minField]) : Number(get('minValue', 0))
      internalMax.value = maxField && row[maxField] !== undefined ? Number(row[maxField]) : Number(get('maxValue', 100))
    }
  } catch (e) {
    console.error('Gauge loadData error:', e)
  } finally {
    isLoading.value = false
  }
}

const chartOptions = computed(() => {
  const style = get('gaugeStyle', 'active') // 'active', 'donut', 'zones'
  const ptrLength = get('ptrLength', 60) 
  const ptrStroke = get('ptrStroke', 5) 
  const ptrColor = get('ptrColor', '#000000') 
  const lineWidth = get('lineWidth', 15) 
  const viewLabels = get('viewLabels', true) 
  const labelsSize = get('labelsSize', 20) 
  const labelPosition = get('labelPosition', 0) 

  let axisLineColors: any[] = []
  
  if (style === 'zones') {
    const zones = get('staticZones', [])
    if (zones.length > 0) {
      const range = internalMax.value - internalMin.value
      // ECharts 的 color 格式是 [比例(0~1), 顏色]
      axisLineColors = zones.map((z: any) => {
        const ratio = (z.max - internalMin.value) / range
        return [ratio > 1 ? 1 : ratio, z.strokeStyle]
      })
    } else {
      axisLineColors = [[1, '#6FADCF']]
    }
  } else {
    axisLineColors = [[1, get('colorStart', '#6FADCF')]]
  }

  const showPointer = style !== 'donut'

  return {
    series: [
      {
        type: 'gauge',
        min: internalMin.value,
        max: internalMax.value,
        startAngle: 210,
        endAngle: -30,
        radius: '90%',
        pointer: {
          show: showPointer,
          length: `${ptrLength}%`,
          width: ptrStroke,
          itemStyle: { color: ptrColor }
        },
        axisLine: {
          lineStyle: {
            width: lineWidth,
            color: axisLineColors
          }
        },
       
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { 
          show: get('viewStaticLabels', false),
          distance: 15
        },
        
        detail: {
          show: viewLabels,
          valueAnimation: true,
          fontSize: labelsSize,
          color: 'inherit', 
          offsetCenter: [0, `${labelPosition}%`],
          formatter: '{value}'
        },
        data: [
          { value: internalValue.value }
        ]
      }
    ]
  }
})

watch(() => get('currentValue'), () => {
  if (!get('remoteName')) {
    internalValue.value = Number(get('currentValue', 0))
  }
})

onMounted(() => {
  loadData()
})

defineExpose({
  loadData,
  getChart: () => chartRef.value
})
</script>

<style scoped>
.info-gauge-wrapper {
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>