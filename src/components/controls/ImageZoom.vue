<template>
  <div :id="id" class="bootstrap-imagezoom" :class="outerClass" v-bind="forwardedAttrs">
    <div v-if="effectiveTitle" class="mb-2 fw-semibold">
      {{ effectiveTitle }}
    </div>

    <div :class="layoutClass" :style="layoutStyle">
      <div
        ref="mainWrapRef"
        class="imagezoom-main position-relative"
        :style="mainWrapStyle"
        @mouseenter="onEnter"
        @mouseleave="onLeave"
        @mousemove="onMove"
        @mousedown="onDown"
        @mouseup="onUp"
      >
        <div
          v-if="effectiveZoomType === 'innerzoom'"
          class="innerzoom-layer position-absolute top-0 start-0 w-100 h-100"
          :style="innerZoomStyle"
        />
        <FileImage
          v-if="currentSmallName"
          class="img-fluid d-block"
          :fileName="currentSmallName"
          :folder="effectiveFolder"
          :style="mainImageInlineStyle"
        />

        <div
          v-if="showZoom && effectiveZoomType === 'drag'"
          class="zoom-lens position-absolute"
          :style="lensStyle"
        />
      </div>

      <div
        v-if="effectiveZoomType !== 'innerzoom'"
        class="imagezoom-zoom border rounded"
        :class="{ 'd-none': !showZoom || !currentLargeDataUrl }"
        :style="zoomPaneStyle"
      />
    </div>

    <div v-if="items.length" class="mt-3 d-flex align-items-center gap-2 flex-wrap">
      <button
        v-if="items.length > effectivePageSize"
        type="button"
        class="btn btn-sm btn-outline-secondary"
        @click="thumbPrev"
      >
        ‹
      </button>

      <div class="d-flex gap-2 flex-wrap">
        <button
          v-for="(it, idx) in thumbItems"
          :key="idx"
          type="button"
          class="p-0 border rounded overflow-hidden bg-white"
          :class="{ 'border-primary': isCurrent(it) }"
          style="width:56px;height:56px;"
          @click="selectItem(it)"
          :title="it.src_small"
        >
          <FileImage
            v-if="it.src_small"
            :fileName="it.src_small"
            :folder="effectiveFolder"
            :style="{ width: '56px', height: '56px', objectFit: 'cover', display: 'block' }"
          />
        </button>
      </div>

      <button
        v-if="items.length > effectivePageSize"
        type="button"
        class="btn btn-sm btn-outline-secondary"
        @click="thumbNext"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, watch } from "vue";
import FileImage from '@/html/FileImage.vue'
import dataUtils from "@/utils/dataApi";

type AnyRow = Record<string, any>;
type ScriptLike<TArgs extends any[] = any[]> =
  | string
  | ((...args: TArgs) => any)
  | null
  | undefined;

type ZoomItem = {
  src_small: string;
  src_large: string;
  [k: string]: any;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    id?: string;
    root?: any;

    remoteName?: string;
    pageSize?: number;

    imageFolder?: string;
    imageField?: string;
    largeImageField?: string;

    images?: ZoomItem[];

    position?: "left" | "right" | "top" | "bottom";
    zoomType?: "standard" | "reverse" | "drag" | "innerzoom";

    imageWidth?: string; // ex: "320px" or "50%" or "320"
    zoomWidth?: string;  // ex: "320px" or "50%" or "320"
    title?: string;

    onBeforeLoad?: ScriptLike<[any]>;

    autoLoad?: boolean;
    fetcher?: (remoteName: string) => Promise<AnyRow[]>;
  }>(),
  {
    pageSize: 5,
    images: () => [],
    position: "right",
    zoomType: "standard",
    autoLoad: true,
  }
);

const emit = defineEmits<{
  (e: "loaded", rows: AnyRow[]): void;
  (e: "error", err: any): void;
  (e: "change", item: ZoomItem): void;
}>();

const attrs = useAttrs();
const { downloadFile } = dataUtils();

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
function toInt(v: any, fallback: number) {
  const n = typeof v === "string" ? parseInt(v, 10) : Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function normSize(v: any): string {
  if (v === undefined || v === null) return "";
  const s = String(v).trim();
  if (!s) return "";
  // "320" -> "320px"
  if (/^\d+(\.\d+)?$/.test(s)) return `${s}px`;
  return s;
}
function callScriptLike<TArgs extends any[]>(handler: ScriptLike<TArgs>, ...args: TArgs) {
  if (!handler) return undefined;
  if (typeof handler === "function") return handler(...args);
  const fn = (window as any)?.[handler];
  if (typeof fn === "function") return fn(...args);
  return undefined;
}


const effectiveRemoteName = computed(() => String(readAny(["remoteName", "remotename"], "") || "").trim());
const effectivePageSize = computed(() => Math.max(1, toInt(readAny(["pageSize", "pagesize"], props.pageSize), 5)));
const effectiveFolder = computed(() => {
  const f = String(readAny(["imageFolder", "imagefolder"], props.imageFolder || "") || "").trim();
  return f || "Images";
});
const effectiveImageField = computed(() => String(readAny(["imageField", "imagefield"], props.imageField || "") || ""));
const effectiveLargeImageField = computed(() => String(readAny(["largeImageField", "largeimagefield"], props.largeImageField || "") || ""));
const effectivePosition = computed(() => (readAny(["position"], props.position) as any) || "right");
const effectiveZoomType = computed(() => (readAny(["zoomType", "zoomtype"], props.zoomType) as any) || "standard");
const effectiveImageWidth = computed(() => normSize(readAny(["imageWidth", "imagewidth"], props.imageWidth)));
const effectiveZoomWidth = computed(() => normSize(readAny(["zoomWidth", "zoomwidth"], props.zoomWidth)));
const effectiveTitle = computed(() => String(readAny(["title"], props.title || "") || "").trim());

const legacyStyleCls = computed(() => {
  const s = (attrs as any).style;
  return typeof s === "string" && s.trim() ? s.trim() : "";
});
const outerClass = computed(() => {
  const extra = (attrs as any).class;
  return [legacyStyleCls.value, extra].filter(Boolean);
});
const forwardedAttrs = computed(() => {
  const { style, class: _class, ...rest } = attrs as Record<string, any>;
  return rest;
});

const items = ref<ZoomItem[]>([]);
const selectedIndex = ref(0);

const thumbOffset = ref(0);
const thumbItems = computed(() => {
  const start = thumbOffset.value;
  return items.value.slice(start, start + effectivePageSize.value);
});
function thumbPrev() {
  thumbOffset.value = Math.max(0, thumbOffset.value - effectivePageSize.value);
}
function thumbNext() {
  const maxStart = Math.max(0, items.value.length - effectivePageSize.value);
  thumbOffset.value = Math.min(maxStart, thumbOffset.value + effectivePageSize.value);
}
function isCurrent(it: ZoomItem) {
  const cur = items.value[selectedIndex.value];
  return cur?.src_small === it.src_small && cur?.src_large === it.src_large;
}

const currentSmallName = computed(() => items.value[selectedIndex.value]?.src_small || "");
const currentLargeName = computed(() => items.value[selectedIndex.value]?.src_large || "");

/** 大圖 dataUrl（用 downloadFile 轉 base64） */
const currentLargeDataUrl = ref("");
const largeNatural = ref<{ w: number; h: number } | null>(null);

/** cache 避免同張大圖重複 download */
const largeCache = new Map<string, { dataUrl: string; w: number; h: number }>();

async function loadLargeDataUrl(fileName: string) {
  if (!fileName) {
    currentLargeDataUrl.value = "";
    largeNatural.value = null;
    return;
  }

  const key = `${effectiveFolder.value}::${fileName}`;
  const cached = largeCache.get(key);
  if (cached) {
    currentLargeDataUrl.value = cached.dataUrl;
    largeNatural.value = { w: cached.w, h: cached.h };
    return;
  }

  const content = await downloadFile(fileName, effectiveFolder.value);
  const ext = fileName.split(".").pop() || "png";
  const dataUrl = `data:image/${ext};base64,${content}`;

  // 取 natural size（用於背景縮放比例）
  const img = new Image();
  const size = await new Promise<{ w: number; h: number }>((resolve) => {
    img.onload = () => resolve({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = dataUrl;
  });

  largeCache.set(key, { dataUrl, w: size.w, h: size.h });
  currentLargeDataUrl.value = dataUrl;
  largeNatural.value = size.w && size.h ? size : null;
}

async function selectItem(it: ZoomItem) {
  const idx = items.value.findIndex(
    (x) => x.src_small === it.src_small && x.src_large === it.src_large
  );
  selectedIndex.value = idx >= 0 ? idx : 0;
  emit("change", items.value[selectedIndex.value]);

  await loadLargeDataUrl(currentLargeName.value);
  resetZoomState();
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
    return []; // 發生錯誤時安全地回傳空陣列
  }
}

async function reload() {
  try {
    // OnBeforeLoad(param)
    callScriptLike(props.onBeforeLoad, { id: props.id, root: props.root });

    if (effectiveRemoteName.value) {
      const fetcher = props.fetcher || defaultFetcher;
      const rows = await fetcher(effectiveRemoteName.value);

      const imgF = effectiveImageField.value;
      const largeF = effectiveLargeImageField.value;

      // 如果使用者沒指定欄位名，Src_small / Src_large
      const mapped: ZoomItem[] = (rows || []).map((r: AnyRow) => ({
        src_small: String(r?.[imgF] ?? r?.Src_small ?? r?.src_small ?? "").trim(),
        src_large: String(r?.[largeF] ?? r?.Src_large ?? r?.src_large ?? "").trim(),
        __row: r,
      })).filter(x => x.src_small || x.src_large);

      items.value = mapped;
      emit("loaded", rows);
    } else {
      const mapped = (props.images || []).map((x) => ({
        src_small: String((x as any).src_small ?? (x as any).Src_small ?? "").trim(),
        src_large: String((x as any).src_large ?? (x as any).Src_large ?? "").trim(),
      })).filter(x => x.src_small || x.src_large);

      items.value = mapped;
    }

    selectedIndex.value = 0;
    thumbOffset.value = 0;
    await loadLargeDataUrl(currentLargeName.value);
    resetZoomState();
  } catch (err) {
    emit("error", err);
  }
}

defineExpose({ reload });

const layoutClass = computed(() => {
  const pos = effectivePosition.value;
  if (pos === "top" || pos === "bottom") return "d-flex flex-column gap-3";
  return "d-flex flex-row gap-3 align-items-start";
});

const layoutStyle = computed(() => {
  const pos = effectivePosition.value;
  return {
    flexDirection: pos === "left" ? "row-reverse" :
                   pos === "right" ? "row" :
                   pos === "top" ? "column-reverse" : "column",
  } as Record<string, any>;
});

const mainWrapStyle = computed(() => {
  const w = effectiveImageWidth.value;
  return {
    width: w || "auto",
    maxWidth: "100%",
    cursor: currentLargeName.value ? (effectiveZoomType.value === "drag" ? "grab" : "crosshair") : "default",
    overflow: "hidden",
    borderRadius: "0.375rem",
  } as Record<string, any>;
});

const mainImageInlineStyle = computed(() => {
  return {
    width: "100%",
    height: "auto",
    display: "block",
  } as Record<string, any>;
});

const zoomPaneStyle = computed(() => {
  const w = effectiveZoomWidth.value || "320px";
  const bgSize = backgroundSize.value;

  return {
    width: w,
    height: w,
    backgroundImage: currentLargeDataUrl.value ? `url('${currentLargeDataUrl.value}')` : "",
    backgroundRepeat: "no-repeat",
    backgroundSize: bgSize,
    backgroundPosition: backgroundPosition.value,
  } as Record<string, any>;
});

const mainWrapRef = ref<HTMLElement | null>(null);
const showZoom = ref(false);
const pointer = ref({ x: 0, y: 0 }); 
const dragging = ref(false);
const lens = ref({ x: 0, y: 0, w: 0, h: 0 }); // lens 左上角 + 尺寸

function resetZoomState() {
  showZoom.value = false;
  dragging.value = false;
  pointer.value = { x: 0, y: 0 };
  lens.value = { x: 0, y: 0, w: 0, h: 0 };
}

function getRect() {
  const el = mainWrapRef.value;
  if (!el) return null;
  return el.getBoundingClientRect();
}

function ensureLensSize(rect: DOMRect) {
  // zoomFactor 越大，lens 越小
  const z = zoomFactor.value;
  const w = rect.width / z;
  const h = rect.height / z;
  lens.value.w = Math.max(40, Math.min(rect.width, w));
  lens.value.h = Math.max(40, Math.min(rect.height, h));
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function updatePointerFromEvent(e: MouseEvent) {
  const rect = getRect();
  if (!rect) return;

  const x = clamp(e.clientX - rect.left, 0, rect.width);
  const y = clamp(e.clientY - rect.top, 0, rect.height);
  pointer.value = { x, y };

  ensureLensSize(rect);

  const lx = clamp(x - lens.value.w / 2, 0, rect.width - lens.value.w);
  const ly = clamp(y - lens.value.h / 2, 0, rect.height - lens.value.h);
  lens.value.x = lx;
  lens.value.y = ly;
}

function onEnter(e: MouseEvent) {
  if (!currentLargeName.value) return;
  showZoom.value = true;
  updatePointerFromEvent(e);
}
function onLeave() {
  showZoom.value = false;
  dragging.value = false;
}
function onMove(e: MouseEvent) {
  if (!showZoom.value || !currentLargeName.value) return;
  if (effectiveZoomType.value === "drag" && !dragging.value) {
    return;
  }
  updatePointerFromEvent(e);
}
function onDown(e: MouseEvent) {
  if (effectiveZoomType.value !== "drag") return;
  if (!showZoom.value) return;
  dragging.value = true;
  updatePointerFromEvent(e);
}
function onUp() {
  dragging.value = false;
}

const lensStyle = computed(() => {
  return {
    left: `${lens.value.x}px`,
    top: `${lens.value.y}px`,
    width: `${lens.value.w}px`,
    height: `${lens.value.h}px`,
    border: "2px solid rgba(0,0,0,0.2)",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(1px)",
    cursor: "grabbing",
  } as Record<string, any>;
});

/** zoomFactor：若大圖 natural size 可得，就以比例估；否則用 2.5 */
const zoomFactor = computed(() => {
  const rect = getRect();
  if (!rect) return 2.5;
  if (!largeNatural.value) return 2.5;
  const zx = largeNatural.value.w / Math.max(1, rect.width);
  const zy = largeNatural.value.h / Math.max(1, rect.height);
  const z = Math.max(zx, zy) || 2.5;
  return clamp(z, 1.5, 5);
});

const backgroundSize = computed(() => {
  const rect = getRect();
  if (!rect) return "cover";
  const z = zoomFactor.value;
  return `${rect.width * z}px ${rect.height * z}px`;
});

const backgroundPosition = computed(() => {
  const rect = getRect();
  if (!rect) return "0% 0%";

  const cx = lens.value.x + lens.value.w / 2;
  const cy = lens.value.y + lens.value.h / 2;

  const px = clamp(cx / rect.width, 0, 1) * 100;
  const py = clamp(cy / rect.height, 0, 1) * 100;

  if (effectiveZoomType.value === "reverse") {
    return `${(100 - px).toFixed(2)}% ${(100 - py).toFixed(2)}%`;
  }
  return `${px.toFixed(2)}% ${py.toFixed(2)}%`;
});

const innerZoomStyle = computed(() => {
  const rect = getRect();
  const bgSize = backgroundSize.value;

  if (!showZoom.value || !currentLargeDataUrl.value || !rect) {
    return { display: "none" } as Record<string, any>;
  }

  return {
    backgroundImage: `url('${currentLargeDataUrl.value}')`,
    backgroundRepeat: "no-repeat",
    backgroundSize: bgSize,
    backgroundPosition: backgroundPosition.value,
    opacity: 1,
    pointerEvents: "none",
  } as Record<string, any>;
});

onMounted(() => {
  const auto = String(readAny(["autoLoad", "autoload"], props.autoLoad)).toLowerCase();
  const should = auto === "" ? true : auto !== "false";
  if (should) reload();
});

watch(
  () => effectiveRemoteName.value,
  (v, ov) => {
    if (v && v !== ov) reload();
  }
);

watch(
  () => currentLargeName.value,
  async (v) => {
    await loadLargeDataUrl(v);
  }
);
</script>

<style scoped>
.bootstrap-imagezoom .imagezoom-main {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
}
.bootstrap-imagezoom .imagezoom-zoom {
  background-color: #fff;
}
</style>
