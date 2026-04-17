<template>
  <div
    ref="mapEl"
    class="form-control bootstrap-geomap"
    :style="{ height: height + 'px', padding: 0 }"
  />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';

type AnyValue = { lat: number; lng: number; zoom?: number } | string | null;

const props = withDefaults(defineProps<{
  modelValue?: AnyValue,  
  height?: number,     
  level?: number, 
  valueType?: 'point' | 'geojson' | 'wkt' | string 
}>(), {
  modelValue: null,
  height: 200,
  level: 13,
  valueType: 'point'
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: AnyValue): void
  (e: 'change', v: AnyValue): void
}>();

const mapEl = ref<HTMLElement | null>(null);
let map: any = null;
let L: any = null;
let marker: any = null;
let geoLayer: any = null;

function parseInitialView() {
  if (props.valueType === 'point' && props.modelValue && typeof props.modelValue !== 'string') {
    const v = props.modelValue as { lat: number; lng: number; zoom?: number };
    if (Number.isFinite(v.lat) && Number.isFinite(v.lng)) {
      return { lat: v.lat, lng: v.lng, zoom: v.zoom ?? props.level };
    }
  }
  return { lat: 25.0478, lng: 121.5319, zoom: props.level };
}

async function ensureLeaflet() {
  if (!L) {
    const mod = await import('leaflet');
    L = mod.default ?? mod;

    const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    L.Marker.prototype.options.icon = L.icon({
      iconUrl, iconRetinaUrl, shadowUrl,
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });
  }
}

function setPoint(lat: number, lng: number, byUser = false) {
  if (!L || !map) return;
  if (!marker) marker = L.marker([lat, lng]).addTo(map);
  else marker.setLatLng([lat, lng]);

  const v = { lat, lng, zoom: map.getZoom() };
  emit('update:modelValue', v);
  if (byUser) emit('change', v);
}

function clearDrawing() {
  if (marker) { map.removeLayer(marker); marker = null; }
  if (geoLayer) { map.removeLayer(geoLayer); geoLayer = null; }
}

function setGeoJSON(text: string) {
  if (!L || !map) return;
  try {
    const obj = JSON.parse(text);
    if (geoLayer) map.removeLayer(geoLayer);
    geoLayer = L.geoJSON(obj).addTo(map);
    map.fitBounds(geoLayer.getBounds(), { padding: [16, 16] });
    emit('update:modelValue', text);
  } catch {

  }
}

onMounted(async () => {
  await ensureLeaflet();
  if (!mapEl.value) return;

  const id = 'leaflet-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  const initial = parseInitialView();
  map = L.map(mapEl.value).setView([initial.lat, initial.lng], initial.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  if (props.valueType === 'point') {
    if (props.modelValue && typeof props.modelValue !== 'string') {
      setPoint(initial.lat, initial.lng);
    }
    map.on('click', (e: any) => setPoint(e.latlng.lat, e.latlng.lng, true));
    map.on('zoomend', () => {
      if (props.valueType !== 'point') return;
      const v = props.modelValue as any;
      if (v && typeof v !== 'string' && Number.isFinite(v.lat) && Number.isFinite(v.lng)) {
        emit('update:modelValue', { lat: v.lat, lng: v.lng, zoom: map.getZoom() });
      }
    });
  } else if (props.valueType === 'geojson' && typeof props.modelValue === 'string') {
    setGeoJSON(props.modelValue);
  }
  
  requestAnimationFrame(() => {
    if (map) {
      map.invalidateSize();
    }
  });

  setTimeout(() => map && map.invalidateSize(), 250);
});

onBeforeUnmount(() => {
  if (map) { map.remove(); map = null; }
});

watch(() => props.level, (z) => {
  if (map && Number.isFinite(z)) map.setZoom(z as number);
});

watch(() => props.modelValue, (v) => {
  if (!map) return;
  if (props.valueType === 'point' && v && typeof v !== 'string') {
    const { lat, lng, zoom } = v as any;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setPoint(lat, lng);
      if (Number.isFinite(zoom)) map.setZoom(zoom);
    }
  } else if (props.valueType === 'geojson' && typeof v === 'string') {
    clearDrawing();
    setGeoJSON(v);
  }
});
</script>

<style scoped>
.bootstrap-geomap {
  border: 1px solid var(--bs-border-color, #ced4da);
  border-radius: 0.375rem;
}
</style>
