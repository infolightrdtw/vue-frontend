<template>
  <!-- #2: Teleport always renders; visibility lives on the inner element via
       v-if/v-show, so the modal DOM is created on mount and `modalRef` is
       reliably available even on the first call to open(). -->
  <Teleport to="body">
    <div
      v-if="isModalOpen"
      class="drilldown-modal modal fade show"
      :id="modalId"
      ref="modalRef"
      tabindex="-1"
      style="display: block;"
      @click.self="onBackdropClick"
    >
      <div
        class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        style="max-width: 95vw;"
      >
        <div class="modal-content" style="height: 95vh;">

          <div class="modal-header">
            <h5 class="modal-title">{{ pageTitle || '詳細資料' }}</h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="closeModal"
            ></button>
          </div>

          <div class="modal-body p-0 d-flex flex-column">
            <DataGrid
              v-if="activeMode === 'table'"
              :id="`grid_${id}`"
              :ref="gridRef"
              :root="root"
              :remoteName="targetRemoteName"
              :columns="targetColumns"
              :whereItems="drillWhereItems"
              :pagination="true"
              :pageSize="10"
              :viewCommandVisible="false"
              :editCommandVisible="false"
              :deleteCommandVisible="false"
              :bordered="bordered"
              :hover="hover"
              :striped="striped"
              style="flex: 1; overflow: auto;"
            />

            <iframe
              v-if="activeMode === 'dialog'"
              :src="iframeUrl"
              style="width: 100%; height: 100%; border: none; flex: 1;"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import DataGrid from './DataGrid.vue'

const props = defineProps({
  id: { type: String, default: () => `drilldown_${uuidv4().substring(0, 8)}` },
  root: { type: Object, required: true },
  bindingObject: { type: String, default: '' },
  columns: { type: Array, default: () => [] },
  mode: { type: String, default: 'table' },
  targetRemoteName: { type: String, default: '' },
  targetColumns: { type: Array, default: () => [] },
  page: { type: String, default: '' },
  pageTitle: { type: String, default: 'Drilldown' },
  pageOpenForm: { type: Boolean, default: true },
  bordered: { type: Boolean, default: true },
  hover: { type: Boolean, default: true },
  striped: { type: Boolean, default: true },
  // Closes when user clicks the dim backdrop. Default false to mirror the
  // legacy `backdrop: 'static'` jQuery behaviour.
  closeOnBackdrop: { type: Boolean, default: false },
  onFormat: String,
  onClick: String
})

const $ = props.root

const modalRef = ref(null)
const modalId = computed(() => `modal_${props.id}`)

// #3: real Composition-API ref for the embedded DataGrid (replaces the broken
// string template ref `:ref="\`grid_${id}\`"` which was a no-op).
const gridRef = ref(null)

const isModalOpen = ref(false)
const activeMode = ref('')
const drillWhereItems = ref([])
const iframeUrl = ref('')

// #6: track sessionStorage keys we wrote so they get cleaned up — both when
// this Drilldown closes the dialog and when it unmounts. Prevents unbounded
// growth across many drill operations.
const ownedDrillIds = new Set()
function purgeDrillId (key) {
  if (!key) return
  try { sessionStorage.removeItem(key) } catch { /* ignore */ }
  ownedDrillIds.delete(key)
}
function purgeAllDrillIds () {
  for (const key of Array.from(ownedDrillIds)) purgeDrillId(key)
}

const closeModal = () => {
  isModalOpen.value = false
  iframeUrl.value = ''
  activeMode.value = ''
  drillWhereItems.value = []
  purgeAllDrillIds()
}

function onBackdropClick () {
  if (props.closeOnBackdrop) closeModal()
}

const open = async (row) => {
  if (!row) return

  const whereItems = []
  props.columns.forEach(col => {
    whereItems.push({
      field: col.targetField,
      operator: col.operator || '=',
      value: row[col.field]
    })
  })

  if (props.onClick && typeof $.invoke === 'function') {
    const r = await Promise.resolve($.invoke(props.onClick, row, whereItems))
    if (r === false) return
  }

  activeMode.value = String(props.mode || '').toLowerCase()

  if (activeMode.value === 'table') {
    drillWhereItems.value = whereItems
    isModalOpen.value = true
    return
  }

  // Dialog / Tab / Window — open another page with the drill payload stashed
  // in sessionStorage (the receiving page reads the key from `?drill=...`).
  if (props.page) {
    const drillId = `drill_${uuidv4().substring(0, 8)}`
    const drillData = {
      targetRemoteName: props.targetRemoteName,
      whereItems,
      drillRow: row,
      loadAction: props.pageOpenForm ? 'viewRow' : null
    }
    try {
      sessionStorage.setItem(drillId, JSON.stringify(drillData))
      ownedDrillIds.add(drillId)
    } catch (e) { console.warn('[Drilldown] sessionStorage set failed', e) }

    const url = `${props.page}?drill=${drillId}`
    const title = props.pageTitle || '詳細資料'

    if (activeMode.value === 'dialog') {
      iframeUrl.value = url
      isModalOpen.value = true
      return
    }
    if (activeMode.value === 'tab') {
      if (typeof $.addTab === 'function') {
        $.addTab({ title, url, path: url })
      } else {
        window.open(url, '_blank')
      }
      return
    }
    window.open(url, '_blank')
  }
}

const formatValue = (value, row) => {
  if (props.onFormat && typeof $.invoke === 'function') {
    return $.invoke(props.onFormat, value, row) || value
  }
  return value
}

// #8: always return the same object shape so callers don't have to special-
// case empty values. When the value is empty we still return an object but
// with `onClick: null`, signalling to renderers that the cell is plain text.
function createLink (value, row) {
  const text = formatValue(value, row)
  if (text === null || text === undefined || text === '') {
    return { text: '', onClick: null }
  }
  return { text, onClick: () => open(row) }
}

onBeforeUnmount(() => { purgeAllDrillIds() })

defineExpose({
  open,
  closeModal,
  formatValue,
  createLink,
  gridRef,
  bindingObject: props.bindingObject
})
</script>

<!-- #5: cell style applies to <td>s rendered inside DataGrid (a different
     SFC). A scoped block here would carry Drilldown's data-v hash and never
     match. Keep this rule un-scoped (or move to a global stylesheet); the
     scoped block below is for selectors that DO live in this template. -->
<style>
.drilldown-cell {
  cursor: pointer;
}
</style>

<style scoped>
.drilldown-modal {
  background: rgba(0, 0, 0, 0.4);
}
</style>
