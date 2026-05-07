<template>
  <div class="schedule-wrapper">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />

    <Teleport to="body">
      <div 
        v-if="modalState.visible"
        class="modal fade show d-block" 
        style="background-color: rgba(0,0,0,0.5);"
        tabindex="-1"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ modalState.mode === 'insert' ? '新增記錄' : '編輯記錄' }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">標題</label>
                <input type="text" class="form-control" v-model="form.title">
              </div>
              <div class="mb-3">
                <label class="form-label">開始時間</label>
                <input type="datetime-local" class="form-control" v-model="form.start">
              </div>
              <div class="mb-3">
                <label class="form-label">結束時間</label>
                <input type="datetime-local" class="form-control" v-model="form.end">
              </div>
              <div class="mb-3">
                <label class="form-label">內容</label>
                <textarea class="form-control" v-model="form.text"></textarea>
              </div>
            </div>
            <div class="modal-footer d-flex justify-content-between">
              <div>
                <button 
                  v-if="modalState.mode === 'update' && attrs.editable !== false" 
                  type="button" class="btn btn-danger" 
                  @click="deleteEvent" 
                  :disabled="isSaving"
                >
                  刪除
                </button>
              </div>
              <div>
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">取消</button>
                <button type="button" class="btn btn-primary" @click="submitEvent" :disabled="isSaving">
                  {{ isSaving ? '處理中...' : '儲存' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, onMounted, nextTick, reactive } from 'vue'
import dataUtils from '@/utils/dataApi'; 

import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'

const attrs = useAttrs()
const calendarRef = ref<any>(null)

function get(name: string): any {
  return (attrs as any)[name]
}

const viewMap: Record<string, string> = { month: 'dayGridMonth', week: 'timeGridWeek', day: 'timeGridDay' }
function parseDefaultView(): 'month' | 'week' | 'day' {
  const raw = String(get('defaultView') ?? '').trim().toLowerCase()
  if (raw === 'week') return 'week'
  if (raw === 'day') return 'day'
  return 'month'
}

function parseViews(): Array<'month' | 'week' | 'day'> {
  const raw = String(get('views') ?? '').trim().toLowerCase()
  const tokens = raw.split(',').map(v => v.trim()).filter(Boolean)
  const out: Array<'month' | 'week' | 'day'> = []
  for (const t of tokens) {
    if (t === 'month' || t === 'week' || t === 'day') out.push(t)
  }
  return out.length ? out : ['month', 'week', 'day']
}

function safeHour(val: any, fallback: number) {
  const n = Number(val)
  if (!Number.isFinite(n)) return fallback
  return Math.min(24, Math.max(0, Math.floor(n)))
}
function parseRemoteName(remoteName: string) {
  const rn = String(remoteName || '').trim()
  return { module: rn.split('.')[0] || '', command: rn.split('.')[1] || '' }
}
function mergeDateTime(row: any, isStart: boolean): string {
  const dateField = String(get(isStart ? 'dateField' : 'dateToField') ?? get('dateField') ?? '').trim()
  return dateField ? String(row?.[dateField] || '') : ''
}

const isSaving = ref(false)
const modalState = reactive({
  visible: false,
  mode: 'insert', // 'insert' | 'update'
})

const form = reactive({
  id: '',
  title: '',
  text: '',
  start: '',
  end: '',
  originalRow: null as any 
})

function formatToDateTimeLocal(dateStr: string | Date) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function closeModal() {
  modalState.visible = false
}

const calendarOptions = computed(() => {
  const allowAdd = get('allowAdd') !== false 
  const editable = get('editable') !== false

  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin],
    themeSystem: 'bootstrap5',
    locale: 'zh-tw',
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'title',
      right: (allowAdd && editable ? 'addEvent,' : '') + 'prev,today,next dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable,
    selectable: allowAdd,
    customButtons: allowAdd && editable ? {
      addEvent: { text: '+', click: handleInsert }
    } : {},
    events: loadEvents,
    eventClick: handleEventClick 
  }
})

onMounted(async () => {
  await nextTick()
  setTimeout(() => calendarRef.value?.getApi()?.updateSize(), 0)
})

//events
async function loadEvents(info: any, success: any, failure: any) {
   try {
    const rn = get('remoteName')
    const { module } = parseRemoteName(rn)
    if (!module) return success([])

    const { loadData: apiLoadData } = dataUtils(rn)

    let param: any = {
      start: info.startStr,
      end: info.endStr,
      whereStr: get('whereStr', '') || '',
      whereItems: Array.isArray(get('whereItems')) ? get('whereItems') : []
    }

    const onBeforeLoad = get('onBeforeLoad')
    if (typeof onBeforeLoad === 'function') {
      param = onBeforeLoad(param) || param
    }

    const r = await apiLoadData(param)

    const rows = Array.isArray(r) ? r : (r?.rows || [])

    const titleField = get('titleField') || 'title'
    const defaultItemClass = String(get('defaultItemClass') ?? 'event-info').trim()
    const onRenderItem = get('onRenderItem')

    const events = rows.map((row: any) => {
      let event: any = {
        id: row?.id ?? row?.ID,
        title: row?.[titleField],
        start: mergeDateTime(row, true),
        end: mergeDateTime(row, false),
        className: defaultItemClass,
        extendedProps: row 
      }

      if (typeof onRenderItem === 'function') {
        event = onRenderItem(event) || event
      }
      return event
    })

    success(events)
  } catch (e) {
    failure(e)
  }
}

function handleInsert() {
  const onInsert = get('onInsert')
  if (typeof onInsert === 'function') {
    onInsert()
  }

  const now = new Date()
  const end = new Date(now.getTime() + 60 * 60 * 1000)
  
  form.id = ''
  form.title = ''
  form.text = ''
  form.start = formatToDateTimeLocal(now)
  form.end = formatToDateTimeLocal(end)
  form.originalRow = {}
  
  modalState.mode = 'insert'
  modalState.visible = true
}

function handleEventClick(clickInfo: any) {
  const event = clickInfo.event
  const props = event.extendedProps

  // [Hook]: onUpdate
  const onUpdate = get('onUpdate')
  if (typeof onUpdate === 'function') {
    if (onUpdate(props) === false) {
      return; 
    }
    onUpdate(props)
  }
  
  form.id = event.id
  form.title = event.title
  form.text = props[get('textField') || 'text'] || ''
  form.start = formatToDateTimeLocal(event.start)
  form.end = formatToDateTimeLocal(event.end)
  form.originalRow = props 
  
  modalState.mode = 'update'
  modalState.visible = true
}

async function deleteEvent() {
  const onDelete = get('onDelete')
  if (typeof onDelete === 'function') {
    if (onDelete(form.originalRow) === false) {
      return
    }
  } else {
    if (!confirm('確定要刪除這筆記錄嗎？')) return
  }

  isSaving.value = true
  try {
    const rn = get('remoteName')
    const { command } = parseRemoteName(rn) 
    const { updateData: apiUpdateData } = dataUtils(rn)

    const datas = [{
      table: command,
      inserted: [],
      updated: [],
      deleted: [form.originalRow] 
    }]

    const data = await apiUpdateData(datas)

    closeModal()
    calendarRef.value?.getApi()?.refetchEvents()

    const onApplied = get('onApplied')
    if (typeof onApplied === 'function') {
      onApplied(data)
    }

  } catch (e) {
    alert('刪除失敗！')
    console.error('[刪除 API 執行失敗]:', e)
  } finally {
    isSaving.value = false
  }
}

async function submitEvent() {
  isSaving.value = true
  try {
    const rn = get('remoteName')
    const { command } = parseRemoteName(rn)
    const { updateData: apiUpdateData } = dataUtils(rn)

    const titleField = get('titleField') || 'title'
    const textField = get('textField') || 'text'
    const dateField = get('dateField') || 'startDate'
    const dateToField = get('dateToField') || 'endDate'

    const rowData = {
      ...form.originalRow,
      [titleField]: form.title,
      [textField]: form.text,
      [dateField]: form.start.replace('T', ' '),
      [dateToField]: form.end.replace('T', ' ')
    }

    const datas = [{
      table: command,
      inserted: modalState.mode === 'insert' ? [rowData] : [],
      updated: modalState.mode === 'update' ? [rowData] : [],
      deleted: []
    }]

    const data = await apiUpdateData(datas)

    closeModal()
    calendarRef.value?.getApi()?.refetchEvents()

    const onApplied = get('onApplied')
    if (typeof onApplied === 'function') {
      onApplied(data)
    }

  } catch (e) {
    alert('儲存失敗！')
    console.error('[儲存 API 執行失敗]:', e)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.schedule-wrapper { min-height: 600px; background: #fff; border-radius: 8px; padding: 0.5rem; }
</style>