<template>
  <div 
    :id="id" 
    class="bootstrap-steps" 
    :class="[`steps-style-${style}`, `animation-${animation}`]"
  >
    <ul class="nav nav-pills" :class="{ 'nav-justified': justified }">
      <li 
        v-for="(step, index) in steps" 
        :key="index" 
        class="nav-item"
      >
        <a 
          class="nav-link" 
          :class="{ 
            'active': activeIndex === index, 
            'disabled': !canClickAnchor(index),
            'done': activeIndex > index
          }"
          :href="`#${id}_${index}`"
          @click.prevent="selectStep(index)"
        >
          {{ step.title || step.Title || `Step ${index + 1}` }}
        </a>
      </li>
    </ul>

    <div class="tab-content mt-3">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="tab-pane fade"
        :class="{ 'show active': activeIndex === index }"
        role="tabpanel"
        :id="`${id}_${index}`"
      >
        <slot :name="index"></slot>
      </div>
    </div>

   <div class="toolbar d-flex justify-content-end mt-4 gap-2">     
      <button 
        v-show="!isFirstStep && !isLockedOnLastPage" 
        class="btn btn-outline-info sw-btn-prev" 
        type="button"
        @click="prev"
      >
        上一步
      </button>
      
      <button 
        v-show="!isLastStep" 
        class="btn btn-info text-white sw-btn-next" 
        type="button"
        @click="next"
      >
        下一步
      </button>

      <button 
        v-show="isLastStep" 
        class="btn btn-success sw-btn-ok" 
        type="button"
        @click="submit"
      >
        確定
      </button>
      
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  id: { type: String, required: true },
  root: { type: Object, default: () => ({}) },
  steps: { type: Array, default: () => [] },
  style: { type: String, default: 'dots' },
  animation: { type: String, default: 'slide-horizontal' },
  justified: { type: Boolean, default: true },
  lastPageLimit: { type: Boolean, default: false },
  anchorClickable: { type: Boolean, default: true },
  selected: { type: [String, Number], default: 0 },
  onNextClick: { type: Function, default: null },
  onPrevClick: { type: Function, default: null }
});

const emit = defineEmits(['update:selected', 'change', 'next-click', 'prev-click', 'ok-click']);

const activeIndex = ref(Number(props.selected));

const isFirstStep = computed(() => activeIndex.value === 0);
const isLastStep = computed(() => activeIndex.value === (props.steps.length - 1));
const isLockedOnLastPage = computed(() => props.lastPageLimit && isLastStep.value);

watch(() => props.selected, (newVal) => {
  activeIndex.value = Number(newVal);
});

const canClickAnchor = (index) => {
  if (isLockedOnLastPage.value) return false; 
  if (!props.anchorClickable && activeIndex.value !== index) return false; 
  return true;
};

const selectStep = (index) => {
  if (!canClickAnchor(index)) return;
  activeIndex.value = index;
  emit('update:selected', index);
  emit('change', index);
};

const next = () => {
  if (props.onNextClick) props.onNextClick(activeIndex.value);
  emit('next-click', activeIndex.value);
  if (!isLastStep.value) selectStep(activeIndex.value + 1);
};

const prev = () => {
  if (props.onPrevClick) props.onPrevClick(activeIndex.value);
  emit('prev-click', activeIndex.value);
  if (!isFirstStep.value) selectStep(activeIndex.value - 1);
};

const submit = () => {
  emit('ok-click');
  if (props.root && typeof props.root.submit === 'function') {
    props.root.submit();
  }
};

defineExpose({
  next,
  prev,
  submit,
  activeIndex
});
</script>

<style scoped>
.nav-pills .nav-link.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>