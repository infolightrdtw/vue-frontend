<!-- Carousel.vue -->
<template>
  <div class="bootstrap-carousel">
    <div
      ref="carouselEl"
      class="carousel slide"
      :id="carouselId"
      :data-bs-ride="items.length ? 'carousel' : undefined"
      :data-bs-interval="effectiveInterval"
      :class="outerClass"
      v-bind="forwardedAttrs"
    >
      <!-- Indicators -->
      <div v-if="items.length" class="carousel-indicators">
        <button
          v-for="(_, idx) in items"
          :key="idx"
          type="button"
          :data-bs-target="`#${carouselId}`"
          :data-bs-slide-to="idx"
          :class="{ active: idx === 0 }"
          :aria-current="idx === 0 ? 'true' : undefined"
          :aria-label="`Slide ${idx + 1}`"
        />
      </div>

      <!-- Slides -->
      <div class="carousel-inner">
        <div
          v-for="(it, idx) in items"
          :key="itemKey(it, idx)"
          class="carousel-item"
          :class="{ active: idx === 0 }"
        >
          <component
            :is="isHref(it) ? 'a' : 'div'"
            :href="isHref(it) ? it.url : undefined"
            :target="isHref(it) ? '_blank' : undefined"
            class="d-block w-100 text-decoration-none"
            @click="(e:any) => onItemClick(e, it)"
          >
            <FileImage
              v-if="it.src"
              :fileName="it.src"
              :folder="effectiveFolder"
              class="d-block w-100"
              :style="imgStyle"
              loading="lazy"
            />

            <div v-if="it.caption" class="carousel-caption d-none d-md-block">
              <p class="mb-0">{{ it.caption }}</p>
            </div>
          </component>
        </div>

        <div v-if="!items.length" class="text-muted small p-3">
          (Carousel 無資料)
        </div>
      </div>

      <!-- Controls -->
      <button
        v-if="items.length > 1"
        class="carousel-control-prev"
        type="button"
        :data-bs-target="`#${carouselId}`"
        data-bs-slide="prev"
        @click.prevent="goPrev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>

      <button
        v-if="items.length > 1"
        class="carousel-control-next"
        type="button"
        :data-bs-target="`#${carouselId}`"
        data-bs-slide="next"
        @click.prevent="goNext"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from "vue";
import dataUtils from '@/utils/dataApi'; 
import FileImage from '@/html/FileImage.vue'

type AnyRow = Record<string, any>;
type ScriptLike<TArgs extends any[] = any[]> =
  | string
  | ((...args: TArgs) => any)
  | null
  | undefined;

type CarouselItem = {
  src: string;
  caption?: string;
  url?: string | boolean;
  __row?: AnyRow;
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
    captionField?: string;
    urlField?: string;

    images?: Array<{ src: string; caption?: string; url?: string | boolean }>;

    interval?: number;

    onClick?: ScriptLike<[AnyRow | CarouselItem]>;

    autoLoad?: boolean;
    fetcher?: (remoteName: string) => Promise<AnyRow[]>;
  }>(),
  {
    id: "Carousel1",
    pageSize: 5,
    images: () => [],
    interval: 5000,
    autoLoad: true,
    imageField: "src",
    captionField: "caption",
    urlField: "url",
  }
);

const emit = defineEmits<{
  (e: "loaded", rows: AnyRow[]): void;
  (e: "error", err: any): void;
  (e: "click", item: CarouselItem): void;
}>();

const attrs = useAttrs();

/** 讀 props + attrs（含 DOM 小寫化） */
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
function callScriptLike<TArgs extends any[]>(handler: ScriptLike<TArgs>, ...args: TArgs) {
  if (!handler) return undefined;
  if (typeof handler === "function") return handler(...args);
  const fn = (window as any)?.[handler];
  if (typeof fn === "function") return fn(...args);
  return undefined;
}

/** 內層 carousel 使用專用 id，避免任何外層重複 */
const carouselId = computed(() => `${props.id || "Carousel1"}__bs`);

const effectiveRemoteName = computed(() => String(readAny(["remoteName", "remotename"], "") || "").trim());
const effectivePageSize = computed(() => Math.max(1, toInt(readAny(["pageSize", "pagesize"], props.pageSize), 5)));
const effectiveInterval = computed(() => Math.max(0, toInt(readAny(["interval"], props.interval), 5000)));

const effectiveImageField = computed(() => String(readAny(["imageField", "imagefield"], props.imageField) || "src"));
const effectiveCaptionField = computed(() => String(readAny(["captionField", "captionfield"], props.captionField) || "caption"));
const effectiveUrlField = computed(() => String(readAny(["urlField", "urlfield"], props.urlField) || "url"));

/** FileImage.folder 預設 Images */
const effectiveFolder = computed(() => {
  const f = String(readAny(["imageFolder", "imagefolder"], props.imageFolder || "") || "").trim();
  return f || "Images";
});

/** 相容：style="shadow" 當 class */
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

const imgStyle = computed(() => ({ display: "block" } as Record<string, any>));

const items = ref<CarouselItem[]>([]);

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
    return []; 
  }
}

function mapRowsToItems(rows: AnyRow[]): CarouselItem[] {
  const fImg = effectiveImageField.value;
  const fCap = effectiveCaptionField.value;
  const fUrl = effectiveUrlField.value;

  const mapped = (rows || [])
    .map((r) => ({
      src: String(r?.[fImg] ?? "").trim(),
      caption: String(r?.[fCap] ?? "").trim(),
      url: r?.[fUrl] as any,
      __row: r,
    }))
    .filter((x) => x.src);

  return mapped.slice(0, effectivePageSize.value);
}

function mapStaticToItems(): CarouselItem[] {
  const mapped = (props.images || [])
    .map((x) => ({
      src: String((x as any).src ?? (x as any).Src ?? "").trim(),
      caption: String((x as any).caption ?? (x as any).Caption ?? "").trim(),
      url: (x as any).url ?? (x as any).Url,
    }))
    .filter((x) => x.src);

  return mapped.slice(0, effectivePageSize.value);
}

async function reload() {
  try {
    if (effectiveRemoteName.value) {
      const fetcher = props.fetcher || defaultFetcher;
      const rows = await fetcher(effectiveRemoteName.value);
      items.value = mapRowsToItems(rows);
      emit("loaded", rows);
    } else {
      items.value = mapStaticToItems();
    }

    await nextTick();
    await initCarousel();
  } catch (err) {
    emit("error", err);
  }
}

defineExpose({ reload });

function isHref(it: CarouselItem) {
  return typeof it.url === "string" && it.url.trim() !== "";
}
function onItemClick(_e: MouseEvent, it: CarouselItem) {
  emit("click", it);
  callScriptLike(props.onClick, it.__row || it);
}
function itemKey(it: CarouselItem, idx: number) {
  return (it.__row as any)?.id ?? (it.__row as any)?.ID ?? (it.__row as any)?.Id ?? it.src ?? idx;
}

/** Bootstrap Carousel instance */
const carouselEl = ref<HTMLElement | null>(null);
let bsInstance: any = null;

function goPrev() {
  if (bsInstance?.prev) bsInstance.prev();
}
function goNext() {
  if (bsInstance?.next) bsInstance.next();
}

async function initCarousel() {
  if (!carouselEl.value) return;

  if (bsInstance?.dispose) {
    bsInstance.dispose();
    bsInstance = null;
  }

  if (items.value.length <= 1) return;

  const mod: any = await import("bootstrap/js/dist/carousel");
  const BsCarousel = mod?.default || mod?.Carousel || (window as any)?.bootstrap?.Carousel;
  if (!BsCarousel) return;

  bsInstance = new BsCarousel(carouselEl.value, {
    interval: effectiveInterval.value,
    ride: items.value.length ? "carousel" : false,
    pause: "hover",
    touch: true,
    wrap: true,
  });
}

onMounted(() => {
  const auto = toBool(readAny(["autoLoad", "autoload"], props.autoLoad), true);
  if (auto) reload();
});

watch(
  () => effectiveRemoteName.value,
  (v, ov) => {
    if (v && v !== ov) reload();
  }
);

watch(
  () => effectiveInterval.value,
  async () => {
    await nextTick();
    await initCarousel();
  }
);

onBeforeUnmount(() => {
  if (bsInstance?.dispose) bsInstance.dispose();
  bsInstance = null;
});
</script>

<style scoped>
.bootstrap-carousel :deep(.carousel-item > a),
.bootstrap-carousel :deep(.carousel-item > div) {
  width: 100%;
}
</style>
