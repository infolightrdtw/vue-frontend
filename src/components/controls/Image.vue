<template>
  <img
    :id="id"
    :src="resolvedSrc"
    :class="mergedClass"
    v-bind="forwardedAttrs"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";

defineOptions({ inheritAttrs: false });

type OnClickLike = string | ((e: MouseEvent) => void) | null | undefined;

const props = withDefaults(
  defineProps<{
    id?: string;
    root?: any; 
    src?: string;
    imageCls?: string;
    styleCls?: string;
    onClick?: OnClickLike;
  }>(),
  {
    src: "",
    imageCls: "img-responsive",
    styleCls: "shadow",
    onClick: undefined,
  }
);

const emit = defineEmits<{
  (e: "click", ev: MouseEvent): void;
}>();

const attrs = useAttrs();
const legacyStyleCls = computed(() => {
  const s = attrs.style;
  return typeof s === "string" && s.trim() ? s.trim() : "";
});

const effectiveStyleCls = computed(() => {
  return props.styleCls || legacyStyleCls.value || "shadow";
});

const resolvedSrc = computed(() => {
  const s = (props.src || "").trim();
  if (!s) return "";

  if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s) || s.startsWith("/")) {
    return s;
  }

  return `/file/images?q=${encodeURIComponent(s)}`;

});

const mergedClass = computed(() => {
  const extra = attrs.class; 
  return [props.imageCls, "bootstrap-image", effectiveStyleCls.value, extra].filter(Boolean);
});

const forwardedAttrs = computed(() => {
  const { style, class: _class, ...rest } = attrs as Record<string, any>;
  return rest;
});

function handleClick(ev: MouseEvent) {
  emit("click", ev);

  const cb = props.onClick;
  if (!cb) return;

  if (typeof cb === "function") {
    cb(ev);
    return;
  }

  const fn = (window as any)?.[cb];
  if (typeof fn === "function") fn();
}
</script>
