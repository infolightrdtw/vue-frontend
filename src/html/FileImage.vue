<template>
  <img v-if="props.fileName" :style="props.style" :src="src" />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import dataUtils from '@/utils/dataApi'
const { downloadFile } = dataUtils()

const props = defineProps<{
  fileName: string
  folder?: string
  style?: Record<string, any>
}>()

const src = ref('')

watch(() => props.fileName, async (newValue) => {
  if (!newValue) { src.value = ''; return }
  const content = await downloadFile(newValue, props.folder)
  const ext = newValue.split('.').pop() || 'png'
  src.value = 'data:image/' + ext + ';base64,' + content
}, { immediate: true })
</script>


