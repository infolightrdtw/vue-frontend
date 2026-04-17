<template>
  <component
    :is="tag"
    :id="id"
    :class="labelCls"
    :style="styleObj"
    @click="handleClick"
    v-html="htmlText"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

type OnClickLike = string | ((e: MouseEvent) => void) | null | undefined;

const props = withDefaults(
  defineProps<{
    id?: string;
    root?: any;   
    text?: string;
    color?: string;
    background?: string;
    padding?: string;
    border?: string;
    font?: string;
    labelCls?: string;
    onClick?: OnClickLike;
    allowHtml?: boolean;
    tag?: "p" | "span" | "div" | "label";
  }>(),
  {
    text: "",
    labelCls: "",
    onClick: undefined,
    allowHtml: false,
    tag: "p",
  }
);

const emit = defineEmits<{
  (e: "click", ev: MouseEvent): void;
}>();

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const parsedFont = computed(() => {
  const raw = props.font ?? "";
  const hasUnderline = raw.includes("underline");
  const fontValue = raw.replace(/underline/g, "").trim();
  return { hasUnderline, fontValue };
});

const styleObj = computed<Record<string, string>>(() => {
  const s: Record<string, string> = {};

  if (props.color) s.color = props.color;
  if (props.background) s.background = props.background;
  if (props.padding) s.padding = props.padding;

  if (props.border) s.border = `1px solid ${props.border}`;

  if (parsedFont.value.fontValue) s.font = parsedFont.value.fontValue;

  if (parsedFont.value.hasUnderline) s.textDecoration = "underline";

  return s;
});

const htmlText = computed(() => {
  const t = props.text ?? "";
  const base = props.allowHtml ? t : escapeHtml(t);
  return base.replace(/\r\n|\n|\r/g, "<br>");
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
