<template>
  <div :id="id" :class="outerClass" v-bind="forwardedAttrs">
    <div class="row g-3">
      <div
        v-for="(row, idx) in pagedRows"
        :key="rowKey(row, idx)"
        :class="colClass"
      >
        <div class="card h-100" :class="styleClass">
          <component
            :is="rowUrl(row) ? 'a' : 'div'"
            :href="rowUrl(row) || undefined"
            :target="rowUrl(row) ? '_blank' : undefined"
            class="text-decoration-none"
            style="display:block;"
            @click="(e:any) => handleItemClick(e, row)"
          >
            <FileImage
              :fileName="rowFileName(row)"
              :folder="effectiveFolder"
              class="card-img-top img-fluid"
              loading="lazy"
            />

            <div v-if="rowCaption(row)" class="card-body py-2">
              <div class="card-text small text-muted" v-html="rowCaptionHtml(row)"></div>
            </div>
          </component>
        </div>
      </div>
    </div>

    <div v-if="effectivePagination" class="clearfix mt-2">
      <ul class="pagination pagination-sm justify-content-end mb-0">
        <li class="page-item" :class="{ disabled: page <= 1 }">
          <a class="page-link" href="#" @click.prevent="goPage(page - 1)">‹</a>
        </li>

        <li
          v-for="p in totalPages"
          :key="p"
          class="page-item"
          :class="{ active: p === page }"
        >
          <a class="page-link" href="#" @click.prevent="goPage(p)">{{ p }}</a>
        </li>

        <li class="page-item" :class="{ disabled: page >= totalPages }">
          <a class="page-link" href="#" @click.prevent="goPage(page + 1)">›</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, watch } from "vue";
import dataUtils from '@/utils/dataApi'; 
import FileImage from '@/html/FileImage.vue'

defineOptions({ inheritAttrs: false });

type AnyRow = Record<string, any>;
type ScriptLike<TArgs extends any[] = any[]> =
  | string
  | ((...args: TArgs) => any)
  | null
  | undefined;

const props = withDefaults(
  defineProps<{
    id?: string;
    root?: any;
    remoteName?: string;
    pageSize?: number;
    pagination?: boolean;
    imageFolder?: string;
    imageField?: string;
    captionField?: string;
    urlField?: string;
    horizontalColumnsCount?: number;
    containerCls?: string;
    styleCls?: string;
    textFormatter?: ScriptLike<[AnyRow]>;
    onClick?: ScriptLike<[AnyRow]>;
    autoLoad?: boolean;
    fetcher?: (remoteName: string) => Promise<AnyRow[]>;
  }>(),
  {
    pageSize: 5,
    pagination: false,
    horizontalColumnsCount: 3,
    containerCls: "container",
    styleCls: "",
    imageField: "src",
    captionField: "caption",
    urlField: "url",
    autoLoad: true,
  }
);

const emit = defineEmits<{
  (e: "click", row: AnyRow): void;
  (e: "loaded", rows: AnyRow[]): void;
  (e: "error", err: any): void;
}>();

const attrs = useAttrs();

function readAny(keys: string[], fallback: any = undefined) {
  for (const k of keys) {
    const pv = (props as any)[k];
    if (pv !== undefined && pv !== null && pv !== "") return pv;

    const av = (attrs as any)[k];
    if (av !== undefined && av !== null && av !== "") return av;

    const lower = k.toLowerCase();
    const av2 = (attrs as any)[lower];
    if (av2 !== undefined && av2 !== null && av2 !== "") return av2;
  }
  return fallback;
}

function toBool(v: any, fallback = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes" || s === "y") return true;
    if (s === "false" || s === "0" || s === "no" || s === "n") return false;
  }
  return fallback;
}

function toInt(v: any, fallback: number) {
  const n = typeof v === "string" ? parseInt(v, 10) : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const effectiveRemoteName = computed(() => String(readAny(["remoteName", "remotename"], "") || "").trim());
const effectivePageSize = computed(() => Math.max(1, toInt(readAny(["pageSize", "pagesize"], 5), 5)));
const effectivePagination = computed(() => toBool(readAny(["pagination"], props.pagination), false));

const effectiveImageField = computed(() => String(readAny(["imageField", "imagefield"], props.imageField) || "src"));
const effectiveCaptionField = computed(() => String(readAny(["captionField", "captionfield"], props.captionField) || "caption"));
const effectiveUrlField = computed(() => String(readAny(["urlField", "urlfield"], props.urlField) || "url"));

const effectiveColumns = computed(() => {
  const n = toInt(readAny(["horizontalColumnsCount", "horizontalcolumnscount"], props.horizontalColumnsCount), 3);
  return Math.min(12, Math.max(1, n));
});

const effectiveContainerCls = computed(() => String(readAny(["containerCls", "containercls"], props.containerCls) || "container"));

const effectiveFolder = computed(() => {
  const f = String(readAny(["imageFolder", "imagefolder"], props.imageFolder || "") || "").trim();
  return f || "Images";
});

const legacyStyleCls = computed(() => {
  const s = (attrs as any).style;
  return typeof s === "string" && s.trim() ? s.trim() : "";
});

const styleClass = computed(() => (props.styleCls || legacyStyleCls.value || "").trim());
const outerClass = computed(() => {
  const extra = (attrs as any).class;
  return ["bootstrap-imagelist", effectiveContainerCls.value, extra].filter(Boolean);
});

const forwardedAttrs = computed(() => {
  const { style, class: _class, ...rest } = attrs as Record<string, any>;
  return rest;
});

const rows = ref<AnyRow[]>([]);
const page = ref(1);

const totalPages = computed(() => {
  if (!effectivePagination.value) return 1;
  const n = Math.ceil(rows.value.length / effectivePageSize.value);
  return Math.max(1, n);
});

const pagedRows = computed(() => {
  if (!effectivePagination.value) return rows.value;
  const size = effectivePageSize.value;
  const start = (page.value - 1) * size;
  return rows.value.slice(start, start + size);
});

function goPage(p: number) {
  const next = Math.min(Math.max(1, p), totalPages.value);
  page.value = next;
}

const colClass = computed(() => {
  const n = effectiveColumns.value;
  const span = Math.floor(12 / n) || 12;
  return [`col-12`, `col-sm-${Math.min(12, span * 2)}`, `col-md-${span}`].join(" ");
});

function rowKey(row: AnyRow, idx: number) {
  return row?.id ?? row?.ID ?? row?.Id ?? row?.key ?? idx;
}

function callScriptLike<TArgs extends any[]>(handler: ScriptLike<TArgs>, ...args: TArgs) {
  if (!handler) return undefined;
  if (typeof handler === "function") return handler(...args);
  const fn = (window as any)?.[handler];
  if (typeof fn === "function") return fn(...args);
  return undefined;
}

function rowCaption(row: AnyRow) {
  const formatted = callScriptLike(props.textFormatter, row);
  if (typeof formatted === "string") return formatted;

  const f = effectiveCaptionField.value;
  return String(row?.[f] ?? "");
}

function rowCaptionHtml(row: AnyRow) {
  const t = rowCaption(row) || "";
  const escaped = t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return escaped.replace(/\r\n|\n|\r/g, "<br>");
}

function rowUrl(row: AnyRow): string {
  const f = effectiveUrlField.value;
  const v = row?.[f];
  if (typeof v !== "string") return "";
  const s = v.trim();
  if (!s) return "";
  if (/^(https?:)?\/\//i.test(s) || s.startsWith("/")) return s;
  return "";
}

function rowFileName(row: AnyRow) {
  const f = effectiveImageField.value;
  const v = row?.[f];
  return typeof v === "string" ? v.trim() : "";
}

function handleItemClick(_e: MouseEvent, row: AnyRow) {
  emit("click", row);
  callScriptLike(props.onClick, row);
}

async function defaultFetcher(remoteName: string): Promise<AnyRow[]> {
  const rn = remoteName || "";
  if (!rn) return [];

  try {
    const { loadData: apiLoadData } = dataUtils(rn);
    const data = await apiLoadData({});

    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.rows)) return (data as any).rows;
    if (typeof (data as any)?.datas === "string") {
      try {
        const parsed = JSON.parse((data as any).datas);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn('[defaultFetcher 解析 datas 字串失敗]:', e);
      }
    }
    
    return [];
  } catch (error) {
    console.error('[defaultFetcher 呼叫 API 失敗]:', error);
    return []; // 發生錯誤時安全地回傳空陣列，保護 UI 元件不當機
  }
}

async function reload() {
  const rn = effectiveRemoteName.value;
  if (!rn) {
    rows.value = [];
    return;
  }

  try {
    const fetcher = props.fetcher || defaultFetcher;
    const loaded = await fetcher(rn);
    rows.value = Array.isArray(loaded) ? loaded : [];
    page.value = 1;
    emit("loaded", rows.value);
  } catch (err) {
    emit("error", err);
  }
}

defineExpose({ reload });

onMounted(() => {
  const auto = toBool(readAny(["autoLoad", "autoload"], props.autoLoad), true);
  if (effectiveRemoteName.value && auto) reload();
});

watch(
  () => effectiveRemoteName.value,
  (v, ov) => {
    const auto = toBool(readAny(["autoLoad", "autoload"], props.autoLoad), true);
    if (v && v !== ov && auto) reload();
  }
);
</script>
