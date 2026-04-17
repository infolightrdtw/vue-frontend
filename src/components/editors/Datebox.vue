<template>
  <div class="datebox-wrapper input-group">
    <input
      ref="inputRef"
      type="text"
      class="form-control"
      :placeholder="prompt"
      :readonly=false
    />
    <span class="input-group-btn">
      <button
        class="btn btn-outline-secondary datebox-btn form-btn glyphicon glyphicon-calendar"
        type="button"
        tabindex="-1"
        @click="openPicker"
      ></button>
    </span>
  </div>
</template>


<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { MandarinTraditional as zh_tw } from 'flatpickr/dist/l10n/zh-tw.js'
import { Mandarin as zh_cn } from 'flatpickr/dist/l10n/zh.js'
import { ja } from 'flatpickr/dist/l10n/ja.js'
import { ko } from 'flatpickr/dist/l10n/ko.js'

const props = defineProps({
  modelValue: { type: String, default: '' },  
  prompt: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
  minDate: { type: [String, Date], default: null },
  maxDate: { type: [String, Date], default: null },
  yearStart: { type: Number, default: 1970 },
  yearEnd: { type: Number, default: new Date().getFullYear() + 10 }
})

const emit = defineEmits(['update:modelValue','change'])
const inputRef = ref(null)
let fp = null
let yearSelectEl = null

const currentLang = (localStorage.getItem('user-language') || 'zh-tw').toLowerCase()

let fpLocale = zh_tw
if (currentLang === 'zh-cn') fpLocale = zh_cn
else if (currentLang === 'zh-hk') fpLocale = zh_tw 
else if (currentLang === 'ja-jp') fpLocale = ja
else if (currentLang === 'ko-kr') fpLocale = ko
else if (currentLang === 'en-us') fpLocale = 'default' 

function openPicker () {
  if (fp && typeof fp.open === 'function') {
    fp.open()
  } else if (inputRef.value) {
    inputRef.value.focus()
  }
}

function buildYearDropdown (instance) {
  if (!instance) return

  if (instance.currentYearElement && instance.currentYearElement.tagName === 'SELECT') {
    yearSelectEl = instance.currentYearElement
    yearSelectEl.value = String(instance.currentYear)
    return
  }

  const yearInput = instance.currentYearElement
  if (!yearInput) return

  const select = document.createElement('select')

  select.className = 'flatpickr-monthDropdown-months flatpickr-yearDropdown'
  const start = Math.min(props.yearStart, props.yearEnd)
  const end = Math.max(props.yearStart, props.yearEnd)
  for (let y = start; y <= end; y++) {
    const opt = document.createElement('option')
    opt.value = String(y)
    opt.textContent = String(y)
    select.appendChild(opt)
  }
  select.value = String(instance.currentYear)

  select.addEventListener('change', (e) => {
    const y = parseInt(e.target.value, 10)
    if (!Number.isNaN(y)) instance.changeYear(y)
  })

  const sync = () => { select.value = String(instance.currentYear) }
  instance.config.onYearChange.push(sync)
  instance.config.onMonthChange.push(sync)

  const wrapper = yearInput.parentNode  // .numInputWrapper
  if (wrapper && wrapper.classList && wrapper.classList.contains('numInputWrapper')) {
    wrapper.parentNode.replaceChild(select, wrapper)
  } else {
    yearInput.parentNode.replaceChild(select, yearInput)
  }
  instance.currentYearElement = select
  yearSelectEl = select
}

onMounted(() => {
  fp = flatpickr(inputRef.value, {
    locale: fpLocale,
    dateFormat: 'Y-m-d',
    defaultDate: props.modelValue || null,
    minDate: props.minDate || null,
    maxDate: props.maxDate || null,
    disableMobile: true,
    monthSelectorType: 'dropdown',
    onReady (selectedDates, dateStr, instance) { buildYearDropdown(instance) },
    onOpen (selectedDates, dateStr, instance) { buildYearDropdown(instance) },
    onChange (selectedDates, dateStr) {
      emit('update:modelValue', dateStr)
      emit('change', dateStr)
    }
  })

  watch(() => props.modelValue, (v) => {
    if (!fp) return
    const cur = fp.input.value
    if (v !== cur) fp.setDate(v || null, true)
  })
})

onBeforeUnmount(() => { if (fp) fp.destroy() })
</script>

<style scoped>
:deep(.flatpickr-current-month) {
  display: flex;
  align-items: center;
  gap: 6px;
}
:deep(select.flatpickr-monthDropdown-months),
:deep(select.flatpickr-yearDropdown) {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  font: inherit !important; 
  line-height: 1.25;
  padding: 0 2px;
}

:deep(.flatpickr-current-month .numInputWrapper .arrowUp),
:deep(.flatpickr-current-month .numInputWrapper .arrowDown) {
  display: none !important;
}

:deep(.flatpickr-current-month .numInput.cur-year) {
  -moz-appearance: textfield !important;
  appearance: textfield !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  font: inherit !important;
  line-height: 1.25;
  padding: 0 2px;
}
:deep(.flatpickr-current-month .numInput.cur-year::-webkit-outer-spin-button),
:deep(.flatpickr-current-month .numInput.cur-year::-webkit-inner-spin-button) {
  -webkit-appearance: none !important;
  margin: 0 !important;
}
.datebox-btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

:deep(.datebox-wrapper input.form-control),
:deep(.datebox-wrapper input.form-control.flatpickr-input),
:deep(.datebox-wrapper input.form-control.flatpickr-input[readonly]) {
  background-color: #ffffff !important;
}



</style>
